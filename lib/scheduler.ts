// Note: Use the shop's timezone when available to compute local publish dates.
// This helper uses the server timezone for simplicity and returns ISO strings.

export type DayKey = "SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";

const dayKeyToIndex: Record<DayKey, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export function nextSlots({
  startDate,
  daysOfWeek,
  timeOfDay,
  count,
}: {
  startDate: string;
  daysOfWeek: DayKey[];
  timeOfDay: string; // "HH:MM"
  count: number;
}): string[] {
  const results: string[] = [];
  const [hh, mm] = timeOfDay.split(":").map((n) => parseInt(n, 10));
  const allowed = new Set(daysOfWeek.map((d) => dayKeyToIndex[d]));

  let cursor = new Date(startDate);
  // ensure we start at 00:00 to avoid skipping first day
  cursor.setHours(0, 0, 0, 0);

  while (results.length < count) {
    for (let i = 0; i < 7 && results.length < count; i++) {
      const day = cursor.getDay();
      if (allowed.has(day)) {
        const dt = new Date(cursor);
        dt.setHours(hh, mm, 0, 0);
        results.push(dt.toISOString());
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return results.slice(0, count);
}


