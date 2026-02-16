import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('menu_item_id').unsigned().notNullable().references('id').inTable('menu_items').onDelete('RESTRICT')
      table.string('station', 20).notNullable() // stirfry | fryer | sides | grill
      table.integer('station_seq').notNullable()
      table.date('station_day').notNullable()
      table.string('state', 20).notNullable() // created | started | completed | canceled
      table.string('source', 20).notNullable() // foh | drive_thru

      table.timestamp('created_at')
      table.timestamp('started_at')
      table.integer('duration_seconds')

      // Snapshots at ticket create
      table.integer('menu_version_at_call').notNullable()
      table.string('item_title_snapshot', 100).notNullable()
      table.string('batch_size_snapshot', 20).notNullable()
      table.integer('duration_snapshot').notNullable()

      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
