import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import MenuItem from './menu_item.js'

export default class Ticket extends BaseModel {
  static table = 'tickets'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare menuItemId: number

  @column()
  declare station: string

  @column()
  declare stationSeq: number

  @column.date()
  declare stationDay: DateTime

  @column()
  declare state: 'created' | 'started' | 'completed' | 'canceled'

  @column()
  declare source: 'foh' | 'drive_thru'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare startedAt: DateTime | null

  @column()
  declare durationSeconds: number | null

  @column()
  declare menuVersionAtCall: number

  @column()
  declare itemTitleSnapshot: string

  @column()
  declare batchSizeSnapshot: string

  @column()
  declare durationSnapshot: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => MenuItem)
  declare menuItem: BelongsTo<typeof MenuItem>

  serialize() {
    return {
      id: this.id,
      menuItemId: this.menuItemId,
      station: this.station,
      stationSeq: this.stationSeq,
      stationDay: this.stationDay.toISO(),
      state: this.state,
      source: this.source,
      createdAt: this.createdAt?.toISO(),
      startedAt: this.startedAt?.toISO(),
      durationSeconds: this.durationSeconds,
      menuVersionAtCall: this.menuVersionAtCall,
      itemTitleSnapshot: this.itemTitleSnapshot,
      batchSizeSnapshot: this.batchSizeSnapshot,
      durationSnapshot: this.durationSnapshot,
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
