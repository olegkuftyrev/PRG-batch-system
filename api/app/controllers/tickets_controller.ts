import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import MenuItem from '#models/menu_item'
import MenuVersion from '#models/menu_version'
import Ws from '#services/ws'
import { schedule } from '#services/timer'
import { createTicketValidator } from '#validators/ticket'
import { DateTime } from 'luxon'

export default class TicketsController {
  /** POST /api/tickets — create ticket */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTicketValidator)
    const menuItem = await MenuItem.findOrFail(payload.menuItemId)
    if (!menuItem.enabled) {
      return response.badRequest({ error: 'Menu item is disabled' })
    }
    const cookTimes = menuItem.cookTimes as Record<string, number>
    const durationSeconds = cookTimes[payload.batchSize] ?? 420
    const versionRow = await MenuVersion.query().first()
    const menuVersion = versionRow?.version ?? 1
    const today = DateTime.now().toISODate()!
    const last = await Ticket.query()
      .where('station', menuItem.station)
      .where('station_day', today)
      .orderBy('station_seq', 'desc')
      .first()
    const stationSeq = last ? last.stationSeq + 1 : 1

    const ticket = await Ticket.create({
      menuItemId: menuItem.id,
      station: menuItem.station,
      stationSeq,
      stationDay: DateTime.fromISO(today),
      state: 'created',
      source: payload.source,
      menuVersionAtCall: menuVersion,
      itemTitleSnapshot: menuItem.title,
      batchSizeSnapshot: payload.batchSize,
      durationSnapshot: durationSeconds,
    })
    Ws.toStation(ticket.station, 'ticket_created', ticket.serialize())
    response.status(201).json(ticket.serialize())
  }

  /** GET /api/tickets?station=stirfry — list by station, last-first */
  async index({ request, response }: HttpContext) {
    const station = request.input('station')
    if (!station) {
      return response.badRequest({ error: 'station query required' })
    }
    const tickets = await Ticket.query()
      .where('station', station)
      .preload('menuItem')
      .orderBy('station_day', 'desc')
      .orderBy('station_seq', 'desc')
    response.json(tickets.map((t) => t.serialize()))
  }

  /** POST /api/tickets/:id/start — start timer */
  async start({ params, response }: HttpContext) {
    const ticket = await Ticket.findOrFail(params.id)
    if (ticket.state !== 'created') {
      return response.badRequest({ error: 'Ticket already started or completed' })
    }
    ticket.state = 'started'
    ticket.startedAt = DateTime.now()
    ticket.durationSeconds = ticket.durationSnapshot
    await ticket.save()
    const startedAtMs = ticket.startedAt.toMillis()
    const durationMs = (ticket.durationSeconds ?? ticket.durationSnapshot) * 1000
    Ws.toStation(ticket.station, 'timer_started', {
      ticketId: ticket.id,
      startedAt: startedAtMs,
      durationSeconds: ticket.durationSeconds,
    })
    schedule(ticket.id, startedAtMs, durationMs)
    response.json(ticket.serialize())
  }

  /** POST /api/tickets/:id/complete — complete ticket */
  async complete({ params, response }: HttpContext) {
    const ticket = await Ticket.findOrFail(params.id)
    if (ticket.state === 'completed') {
      return response.badRequest({ error: 'Ticket already completed' })
    }
    ticket.state = 'completed'
    await ticket.save()
    Ws.toStation(ticket.station, 'ticket_completed', ticket.serialize())
    response.json(ticket.serialize())
  }
}
