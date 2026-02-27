import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MenuItem extends BaseModel {
  static table = 'menu_items'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare title: string

  @column()
  declare station: 'stirfry' | 'fryer' | 'sides' | 'grill'

  @column({
    prepare: (v: Record<string, number>) => JSON.stringify(v),
    consume: (v: string) => (typeof v === 'string' ? JSON.parse(v) : v) as Record<string, number>,
  })
  declare cookTimes: Record<string, number>

  @column({
    prepare: (v: string[]) => JSON.stringify(v),
    consume: (v: string) => (typeof v === 'string' ? JSON.parse(v) : v) as string[],
  })
  declare batchSizes: string[]

  @column()
  declare enabled: boolean

  @column({
    prepare: (v: Record<string, string>) => JSON.stringify(v),
    consume: (v: string) => (typeof v === 'string' ? JSON.parse(v) : v) as Record<string, string>,
  })
  declare recommendedBatch: Record<string, string>

  @column()
  declare color: 'blue' | 'red' | 'green' | 'orange' | null

  @column()
  declare imageUrl: string | null

  @column()
  declare holdTime: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  serialize() {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      station: this.station,
      cookTimes: this.cookTimes,
      batchSizes: this.batchSizes,
      enabled: this.enabled,
      recommendedBatch: this.recommendedBatch,
      color: this.color,
      imageUrl: this.imageUrl,
      holdTime: this.holdTime,
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
