/**
 * Dayparts: fixed time ranges (MVP). Server timezone = store TZ.
 * Breakfast 6-11, Lunch 11-2, Snack (Downtime) 2-5, Dinner 5-8, Late Snack (Downtime) 8-12
 * Note: "Downtime" in store docs = snack + late_snack (same recommended batch for both).
 */
export const DAYPARTS = [
    { id: 'breakfast', start: 6, end: 11 },
    { id: 'lunch', start: 11, end: 14 },
    { id: 'snack', start: 14, end: 17 }, // Downtime
    { id: 'dinner', start: 17, end: 20 },
    { id: 'late_snack', start: 20, end: 24 }, // Downtime
];
/**
 * Returns the current daypart ID based on server time (hour).
 */
export function getCurrentDaypart(now = new Date()) {
    const hour = now.getHours();
    for (const dp of DAYPARTS) {
        if (hour >= dp.start && hour < dp.end)
            return dp.id;
    }
    return 'breakfast'; // 0-6 falls into breakfast
}
