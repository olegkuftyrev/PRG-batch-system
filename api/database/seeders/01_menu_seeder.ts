import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuItem from '#models/menu_item'

/** Minutes to seconds */
const min = (m: number) => Math.round(m * 60)

export default class extends BaseSeeder {
  async run() {
    const img = (code: string) => `/uploads/${code.toLowerCase()}.png`

    const items: Partial<MenuItem>[] = [
      // Appetizers (fryer)
      { code: 'E2', title: 'Chicken Egg Roll', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' }, imageUrl: img('e2') },
      { code: 'E3', title: 'Cream Cheese Rangoon', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(2.5), '2': min(2.5), '3': min(2.5) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' }, imageUrl: img('e3') },
      { code: 'E1', title: 'Veggie Spring Roll', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(5), '2': min(5), '3': min(5) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'3', snack:'2', dinner:'3', late_snack:'2' }, imageUrl: img('e1') },
      // Beef
      { code: 'B5', title: 'Beijing Beef', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(5), '2': min(5), '3': min(5) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('b5') },
      { code: 'B3', title: 'Black Pepper Sirloin Steak', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(1.5), '2': min(1.75), '3': min(2) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('b3') },
      { code: 'B1', title: 'Broccoli Beef', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(0.75), '2': min(1), '3': min(1.25) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('b1') },
      // Chicken
      { code: 'C4', title: 'Grilled Teriyaki Chicken', station: 'grill', batchSizes: ['1','2','3'], cookTimes: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('c4') },
      { code: 'CB3', title: 'Honey Sesame Chicken Breast', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(2.5), '2': min(2.5), '3': min(2.5) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('cb3') },
      { code: 'C3', title: 'Kung Pao Chicken', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(1.25), '2': min(1.5), '3': min(1.75) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('c3') },
      { code: 'C2', title: 'Mushroom Chicken', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(1.25), '2': min(1.5), '3': min(1.75) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('c2') },
      { code: 'C1', title: 'Orange Chicken', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(8), '2': min(8), '3': min(8) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('c1') },
      { code: 'CB1', title: 'String Bean Chicken Breast', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(0.75), '2': min(1), '3': min(1.25) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'1', snack:'1', dinner:'1', late_snack:'1' }, imageUrl: img('cb1') },
      // Seafood
      { code: 'F4', title: 'Honey Walnut Shrimp', station: 'fryer', batchSizes: ['1','2','3'], cookTimes: { '1': min(3), '2': min(3), '3': min(3) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('f4') },
      // Sides
      { code: 'M1', title: 'Chow Mein', station: 'sides', batchSizes: ['1','2','3'], cookTimes: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('m1') },
      { code: 'R1', title: 'Fried Rice', station: 'sides', batchSizes: ['1','2','3'], cookTimes: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('r1') },
      { code: 'R2', title: 'White Rice', station: 'sides', batchSizes: ['1','2','3'], cookTimes: { '1': min(7), '2': min(7), '3': min(7) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'2', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('r2') },
      // Vegetable
      { code: 'V1', title: 'Super Greens', station: 'stirfry', batchSizes: ['1','2','3'], cookTimes: { '1': min(3), '2': min(3), '3': min(3) }, enabled: true, recommendedBatch: { breakfast:'1', lunch:'1', snack:'1', dinner:'2', late_snack:'1' }, imageUrl: img('v1') },
    ]
    for (const row of items) {
      await MenuItem.updateOrCreate({ code: row.code! }, row as any)
    }
  }
}
