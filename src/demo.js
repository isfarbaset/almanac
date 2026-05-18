import { db } from './db'
import { addDaysKey, todayKey } from './lib/date'

// Four cycles of plausible, slightly irregular data ending in the recent
// past so the user sees real predictions the moment they open the app.
export async function seedDemo() {
  const today = todayKey()
  const cycleGaps = [29, 27, 30] // spacing between the 4 period starts
  const periodLengths = [5, 4, 6, 5]
  const flowShape = ['light', 'medium', 'heavy', 'medium', 'light', 'spotting']

  // Anchor the most recent period start ~12 days before today.
  let start = addDaysKey(today, -12)
  const starts = [start]
  for (let i = cycleGaps.length - 1; i >= 0; i--) {
    start = addDaysKey(start, -cycleGaps[i])
    starts.unshift(start)
  }

  const rows = []
  starts.forEach((s, ci) => {
    const len = periodLengths[ci]
    for (let d = 0; d < len; d++) {
      rows.push({
        date: addDaysKey(s, d),
        flow: flowShape[Math.min(d, flowShape.length - 1)],
        symptoms: d === 1 ? ['cramps'] : [],
        note: '',
      })
    }
  })

  await db.transaction('rw', db.days, async () => {
    await db.days.bulkPut(rows)
  })
}
