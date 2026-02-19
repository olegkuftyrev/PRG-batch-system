import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 20).notNullable().unique()
      table.string('title', 100).notNullable()
      table.string('station', 20).notNullable() // stirfry | fryer | sides | grill
      table.jsonb('batch_sizes').notNullable() // e.g. ["0.5", "1", "2", "3", "Catering"]
      table.jsonb('cook_times').notNullable() // e.g. { "0.5": 420, "1": 420 } (seconds per batch size)
      table.boolean('enabled').notNullable().defaultTo(true)
      table.jsonb('recommended_batch').notNullable() // { breakfast, lunch, snack, dinner, late_snack } -> batch size string

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
