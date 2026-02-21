import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async handle({ response }: HttpContext) {
    try {
      await db.rawQuery('SELECT 1')
      return response.json({ ok: true, database: 'connected' })
    } catch (error) {
      return response.status(503).json({ ok: false, error: 'Database unavailable' })
    }
  }
}
