/**
 * Standalone seeder using raw pg. Run with: npx tsx scripts/run-seed.ts
 */
import pg from 'pg'

const min = (m: number) => Math.round(m * 60)

const client = new pg.Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'prg',
  password: process.env.DB_PASSWORD || 'prg_secret',
  database: process.env.DB_DATABASE || 'prg_batch',
})

const items = [
  { code: 'E2', title: 'Chicken Egg Roll', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' } },
  { code: 'E3', title: 'Cream Cheese Rangoon', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(2.5), '2': min(2.5), '3': min(2.5) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' } },
  { code: 'E1', title: 'Veggie Spring Roll', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(5), '2': min(5), '3': min(5) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' } },
  { code: 'B5', title: 'Beijing Beef', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(5), '2': min(5), '3': min(5) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'B3', title: 'Black Pepper Sirloin Steak', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(1.5), '2': min(1.75), '3': min(2) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'B1', title: 'Broccoli Beef', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(0.75), '2': min(1), '3': min(1.25) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'C4', title: 'Grilled Teriyaki Chicken', station: 'grill', batch_sizes: ['1','2','3'], cook_times: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'CB3', title: 'Honey Sesame Chicken Breast', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(2.5), '2': min(2.5), '3': min(2.5) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'C3', title: 'Kung Pao Chicken', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(1.25), '2': min(1.5), '3': min(1.75) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'C2', title: 'Mushroom Chicken', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(1.25), '2': min(1.5), '3': min(1.75) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'C1', title: 'Orange Chicken', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(8), '2': min(8), '3': min(8) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'CB1', title: 'String Bean Chicken Breast', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(0.75), '2': min(1), '3': min(1.25) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'1', snack:'1', dinner:'1', late_snack:'1' } },
  { code: 'F4', title: 'Honey Walnut Shrimp', station: 'fryer', batch_sizes: ['1','2','3'], cook_times: { '1': min(3), '2': min(3), '3': min(3) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'M1', title: 'Chow Mein', station: 'sides', batch_sizes: ['1','2','3'], cook_times: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'R1', title: 'Fried Rice', station: 'sides', batch_sizes: ['1','2','3'], cook_times: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' } },
  { code: 'V1', title: 'Super Greens', station: 'stirfry', batch_sizes: ['1','2','3'], cook_times: { '1': min(3), '2': min(3), '3': min(3) }, enabled: true, recommended_batch: { breakfast:'1', lunch:'1', snack:'1', dinner:'2', late_snack:'1' } },
]

async function run() {
  await client.connect()
  for (const row of items) {
    await client.query(
      `INSERT INTO menu_items (code, title, station, batch_sizes, cook_times, enabled, recommended_batch, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE SET title=$2, station=$3, batch_sizes=$4, cook_times=$5, enabled=$6, recommended_batch=$7, updated_at=NOW()`,
      [row.code, row.title, row.station, JSON.stringify(row.batch_sizes), JSON.stringify(row.cook_times), row.enabled, JSON.stringify(row.recommended_batch)]
    )
    console.log('Seeded:', row.code, row.title)
  }
  console.log('Seed complete.')
  await client.end()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
