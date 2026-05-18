import { addDaysKey, daysBetween, todayKey } from './lib/date'

export const FLOWS = ['spotting', 'light', 'medium', 'heavy']
const BLEEDING = new Set(FLOWS)

const DEFAULT_CYCLE = 28
const DEFAULT_PERIOD = 5
const RECENT_WINDOW = 6 // how many recent cycles feed the prediction
const FUTURE_CYCLES = 4 // how many future periods to project onto the calendar
const LUTEAL = 14 // days from ovulation to next period (clinical estimate)

// Group logged bleeding days into discrete periods. A single missing day is
// tolerated so a "spotting, nothing, light" run still reads as one period.
function buildPeriods(sortedDays) {
  const periods = []
  let current = null
  let prevKey = null

  for (const d of sortedDays) {
    if (!BLEEDING.has(d.flow)) continue
    if (current && daysBetween(prevKey, d.date) <= 2) {
      current.end = d.date
    } else {
      if (current) periods.push(current)
      current = { start: d.date, end: d.date }
    }
    prevKey = d.date
  }
  if (current) periods.push(current)

  return periods.map((p) => ({
    ...p,
    length: daysBetween(p.start, p.end) + 1,
  }))
}

function weightedAverage(values) {
  // Recent values weigh more: oldest gets weight 1, newest gets weight n.
  let num = 0
  let den = 0
  values.forEach((v, i) => {
    const w = i + 1
    num += v * w
    den += w
  })
  return den ? num / den : 0
}

function stdev(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function buildModel(daysArray, cycleOverride) {
  const days = [...daysArray].sort((a, b) => a.date.localeCompare(b.date))
  const daysMap = new Map(days.map((d) => [d.date, d]))
  const periods = buildPeriods(days)
  const hasData = days.length > 0

  const cycleLengths = []
  for (let i = 1; i < periods.length; i++) {
    cycleLengths.push(daysBetween(periods[i - 1].start, periods[i].start))
  }

  const recentCycles = cycleLengths.slice(-RECENT_WINDOW)
  const recentPeriods = periods.slice(-RECENT_WINDOW).map((p) => p.length)

  const override = Number.isFinite(cycleOverride) ? cycleOverride : null
  let avgCycle
  let basis
  if (override) {
    avgCycle = override
    basis = 'manual'
  } else if (recentCycles.length) {
    avgCycle = Math.round(weightedAverage(recentCycles))
    basis = recentCycles.length >= 2 ? 'data' : 'estimate'
  } else {
    avgCycle = DEFAULT_CYCLE
    basis = 'default'
  }

  const avgPeriodLen = recentPeriods.length
    ? Math.max(2, Math.round(weightedAverage(recentPeriods)))
    : DEFAULT_PERIOD

  const cycleStdev = stdev(recentCycles)
  const minCycle = recentCycles.length ? Math.min(...recentCycles) : null
  const maxCycle = recentCycles.length ? Math.max(...recentCycles) : null
  const spread = minCycle != null ? maxCycle - minCycle : 0

  // Soft, non-alarming flag. Mirrors the clinical rule of thumb that
  // cycle-to-cycle variation above ~7-9 days is worth mentioning to a doctor.
  const irregular =
    recentCycles.length >= 3 && (spread > 8 || cycleStdev > 5)

  const today = todayKey()
  const lastPeriod = periods[periods.length - 1] || null
  const lastStart = lastPeriod ? lastPeriod.start : null

  let cycleDay = null
  if (lastStart && daysBetween(lastStart, today) >= 0) {
    cycleDay = daysBetween(lastStart, today) + 1
  }

  let prediction = null
  if (lastStart) {
    const futureStarts = []
    let s = lastStart
    while (futureStarts.length < FUTURE_CYCLES) {
      s = addDaysKey(s, avgCycle)
      futureStarts.push(s)
    }

    // First future start that has not already passed.
    const nextStart =
      futureStarts.find((k) => daysBetween(today, k) >= 0) || futureStarts[0]

    const predictedPeriodDays = new Set()
    for (const start of futureStarts) {
      for (let i = 0; i < avgPeriodLen; i++) {
        predictedPeriodDays.add(addDaysKey(start, i))
      }
    }

    // Ovulation ~ luteal length before the next predicted period.
    // Fertile window: 5 days before ovulation through 1 day after.
    const ovulationDay = addDaysKey(nextStart, -LUTEAL)
    const fertileDays = new Set()
    for (let i = -5; i <= 1; i++) {
      fertileDays.add(addDaysKey(ovulationDay, i))
    }

    const confidence = recentCycles.length
      ? Math.max(1, Math.round(cycleStdev || 2))
      : 4

    prediction = {
      nextStart,
      daysUntil: daysBetween(today, nextStart),
      confidence,
      predictedPeriodDays,
      fertileDays,
      ovulationDay,
      reliable: basis === 'data',
    }
  }

  return {
    hasData,
    daysMap,
    periods,
    stats: {
      avgCycle,
      avgPeriodLen,
      cycleStdev,
      minCycle,
      maxCycle,
      sampleCount: recentCycles.length,
      basis,
    },
    irregular,
    lastStart,
    cycleDay,
    prediction,
  }
}

// Resolve everything the calendar needs to render a single day cell.
export function dayState(key, model) {
  const logged = model.daysMap.get(key)
  const isToday = key === todayKey()
  const p = model.prediction
  return {
    logged: logged || null,
    flow: logged ? logged.flow : null,
    hasNote: !!(logged && (logged.note || (logged.symptoms || []).length)),
    isToday,
    predictedPeriod: p ? p.predictedPeriodDays.has(key) : false,
    fertile: p ? p.fertileDays.has(key) : false,
    ovulation: p ? p.ovulationDay === key : false,
  }
}
