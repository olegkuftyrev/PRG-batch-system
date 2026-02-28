import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('ingredients').nullable()
      table.text('allergens').nullable()
      table.text('nutrition').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ingredients')
      table.dropColumn('allergens')
      table.dropColumn('nutrition')
    })
  }
}
