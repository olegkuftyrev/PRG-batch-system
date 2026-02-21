import Ws from '#services/ws';
import Ticket from '#models/ticket';
const timeouts = new Map();
async function emitTimerEnd(ticketId) {
    const ticket = await Ticket.find(ticketId);
    if (ticket && ticket.state === 'started') {
        Ws.toStation(ticket.station, 'timer_ended', { ticketId });
    }
}
/**
 * Schedule timer_ended for a ticket. Clears existing timeout if any.
 */
export function schedule(ticketId, startedAtMs, durationMs) {
    const existing = timeouts.get(ticketId);
    if (existing)
        clearTimeout(existing);
    const remaining = startedAtMs + durationMs - Date.now();
    if (remaining <= 0) {
        emitTimerEnd(ticketId);
        return;
    }
    const t = setTimeout(() => {
        timeouts.delete(ticketId);
        emitTimerEnd(ticketId);
    }, remaining);
    timeouts.set(ticketId, t);
}
/**
 * Reschedule all started tickets (call on server boot).
 */
export async function rescheduleOnBoot() {
    const tickets = await Ticket.query().where('state', 'started');
    for (const t of tickets) {
        const startedAtMs = t.startedAt.toMillis();
        const durationMs = (t.durationSeconds ?? t.durationSnapshot) * 1000;
        schedule(t.id, startedAtMs, durationMs);
    }
}
