/**
 * Dayparts: fixed time ranges (MVP). Same as API.
 * Breakfast 6-11, Lunch 11-2, Snack 2-5, Dinner 5-8, Late Snack 8-12
 */
const DAYPARTS = [
  { id: 'breakfast', start: 6, end: 11 },
  { id: 'lunch', start: 11, end: 14 },
  { id: 'snack', start: 14, end: 17 },
  { id: 'dinner', start: 17, end: 20 },
  { id: 'late_snack', start: 20, end: 24 },
] as const

export type DaypartId = (typeof DAYPARTS)[number]['id']

export function getCurrentDaypart(now: Date = new Date()): DaypartId {
  const hour = now.getHours()
  for (const dp of DAYPARTS) {
    if (hour >= dp.start && hour < dp.end) return dp.id
  }
  return 'breakfast'
}

export function getRecommendedBatch(
  recommendedBatch: Record<string, string>,
  batchSizes: string[],
  daypart?: DaypartId
): string {
  const id = daypart ?? getCurrentDaypart()
  const recommended = recommendedBatch[id]
  if (recommended && batchSizes.includes(recommended)) return recommended
  return batchSizes[0] ?? '1'
}
