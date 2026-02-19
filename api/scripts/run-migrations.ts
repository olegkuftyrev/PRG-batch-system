/**
 * Standalone migration runner using pg. Run with: npx tsx scripts/run-migrations.ts
 * Use when ace migration:run has issues.
 */
import pg from 'pg'

const client = new pg.Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'prg',
  password: process.env.DB_PASSWORD || 'prg_secret',
  database: process.env.DB_DATABASE || 'prg_batch',
})

async function run() {
  await client.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS adonis_schema (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        batch INTEGER NOT NULL,
        migration_time TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    const { rows } = await client.query('SELECT name FROM adonis_schema')
    const done = new Set(rows.map((r: { name: string }) => r.name))
    const migrations = [
      { name: '1739714400000_create_menu_items_table', sql: `
        CREATE TABLE menu_items (
          id SERIAL PRIMARY KEY,
          code VARCHAR(20) NOT NULL UNIQUE,
          title VARCHAR(100) NOT NULL,
          station VARCHAR(20) NOT NULL,
          batch_sizes JSONB NOT NULL,
          cook_times JSONB NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT true,
          recommended_batch JSONB NOT NULL,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ
        )
      `},
      { name: '1739714400001_create_menu_versions_table', sql: `
        CREATE TABLE menu_versions (
          id SERIAL PRIMARY KEY,
          version INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ
        )
      `},
      { name: '1739714400002_create_tickets_table', sql: `
        CREATE TABLE tickets (
          id SERIAL PRIMARY KEY,
          menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
          station VARCHAR(20) NOT NULL,
          station_seq INTEGER NOT NULL,
          station_day DATE NOT NULL,
          state VARCHAR(20) NOT NULL,
          source VARCHAR(20) NOT NULL,
          created_at TIMESTAMPTZ,
          started_at TIMESTAMPTZ,
          duration_seconds INTEGER,
          menu_version_at_call INTEGER NOT NULL,
          item_title_snapshot VARCHAR(100) NOT NULL,
          batch_size_snapshot VARCHAR(20) NOT NULL,
          duration_snapshot INTEGER NOT NULL,
          updated_at TIMESTAMPTZ
        )
      `},
    ]
    const batch = (await client.query('SELECT COALESCE(MAX(batch), 0) + 1 as next FROM adonis_schema')).rows[0].next
    for (const m of migrations) {
      if (done.has(m.name)) {
        console.log('Skip:', m.name)
        continue
      }
      await client.query(m.sql)
      await client.query('INSERT INTO adonis_schema (name, batch) VALUES ($1, $2)', [m.name, batch])
      console.log('Done:', m.name)
    }
    console.log('Migrations complete.')
  } finally {
    await client.end()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
