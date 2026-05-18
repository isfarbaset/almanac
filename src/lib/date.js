import {
  format,
  parseISO,
  differenceInCalendarDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns'

// The whole app keys days by a local "YYYY-MM-DD" string so that a logged
// day never shifts across timezones or DST. Dates are only materialized
// into Date objects for arithmetic and display.

export const KEY_FMT = 'yyyy-MM-dd'

export function toKey(date) {
  return format(date, KEY_FMT)
}

export function fromKey(key) {
  return parseISO(key)
}

export function todayKey() {
  return toKey(new Date())
}

export function addDaysKey(key, n) {
  return toKey(addDays(fromKey(key), n))
}

export function daysBetween(aKey, bKey) {
  return differenceInCalendarDays(fromKey(bKey), fromKey(aKey))
}

export function monthGrid(monthDate) {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function prettyDate(key) {
  return format(fromKey(key), 'EEEE, MMMM d')
}

export function prettyShort(key) {
  return format(fromKey(key), 'MMM d')
}

export function monthLabel(monthDate) {
  return format(monthDate, 'MMMM yyyy')
}

export { format }
