import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'menu_items';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('color', 20).nullable().defaultTo(null);
            table.string('image_url', 500).nullable();
            table.integer('hold_time').notNullable().defaultTo(600);
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('color');
            table.dropColumn('image_url');
            table.dropColumn('hold_time');
        });
    }
}
