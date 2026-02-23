import db from '@adonisjs/lucid/services/db'

async function applyMigration() {
  try {
    console.log('Adding columns to menu_items table...')
    
    await db.rawQuery(`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS hold_time INTEGER NOT NULL DEFAULT 600;
    `)
    
    console.log('✅ Migration applied successfully!')
    console.log('- Added color column (nullable, varchar(20))')
    console.log('- Added image_url column (nullable, varchar(500))')
    console.log('- Added hold_time column (integer, default 600)')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
