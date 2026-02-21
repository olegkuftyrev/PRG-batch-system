import db from '@adonisjs/lucid/services/db';
export default class HealthController {
    async handle({ response }) {
        try {
            await db.rawQuery('SELECT 1');
            return response.json({ ok: true, database: 'connected' });
        }
        catch (error) {
            return response.status(503).json({ ok: false, error: 'Database unavailable' });
        }
    }
}
