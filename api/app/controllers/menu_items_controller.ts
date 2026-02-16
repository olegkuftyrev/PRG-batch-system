import type { HttpContext } from '@adonisjs/core/http'
import MenuItem from '#models/menu_item'
import MenuVersion from '#models/menu_version'
import Ws from '#services/ws'
import db from '@adonisjs/lucid/services/db'
import {
  createMenuItemValidator,
  updateMenuItemValidator,
} from '#validators/menu_item'

export default class MenuItemsController {
  /** GET /api/menu — list items + menu_version */
  async index({ response }: HttpContext) {
    const items = await MenuItem.query().orderBy('code', 'asc')
    const versionRow = await MenuVersion.query().first()
    const menuVersion = versionRow?.version ?? 1
    response.json({
      items: items.map((m) => m.serialize()),
      menuVersion,
    })
  }

  /** POST /api/menu — create item, bump version */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createMenuItemValidator)
    const trx = await db.transaction()
    try {
      const item = await MenuItem.create(
        {
          ...payload,
          enabled: payload.enabled ?? true,
          recommendedBatch: payload.recommendedBatch ?? {},
        },
        { client: trx }
      )
      const version = await this.bumpVersion(trx)
      await trx.commit()
      Ws.broadcast('menu_updated', { version })
      response.status(201).json(item.serialize())
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  /** PATCH /api/menu/:id — update item, bump version */
  async update({ params, request, response }: HttpContext) {
    const item = await MenuItem.findOrFail(params.id)
    const payload = await request.validateUsing(updateMenuItemValidator)
    const trx = await db.transaction()
    try {
      item.merge(payload)
      await item.useTransaction(trx).save()
      const version = await this.bumpVersion(trx)
      await trx.commit()
      Ws.broadcast('menu_updated', { version })
      response.json(item.serialize())
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  /** DELETE /api/menu/:id — delete item, bump version */
  async destroy({ params, response }: HttpContext) {
    const item = await MenuItem.findOrFail(params.id)
    const trx = await db.transaction()
    try {
      await item.useTransaction(trx).delete()
      const version = await this.bumpVersion(trx)
      await trx.commit()
      Ws.broadcast('menu_updated', { version })
      response.noContent()
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  private async bumpVersion(trx: any): Promise<number> {
    const row = await MenuVersion.query().useTransaction(trx).first()
    if (row) {
      row.version += 1
      await row.useTransaction(trx).save()
      return row.version
    } else {
      await MenuVersion.create({ version: 1 }, { client: trx })
      return 1
    }
  }
}
