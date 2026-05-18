import Dexie from 'dexie'

// Local-only storage. Nothing here ever leaves the device: no network calls,
// no accounts, no analytics. This is the core privacy guarantee of the app.
export const db = new Dexie('almanac')

db.version(1).stores({
  // A day is only stored if the user logged something on it.
  // key: "YYYY-MM-DD" (local date). flow: null | spotting | light | medium | heavy.
  days: '&date',
  // Single-row key/value bag for app settings.
  settings: '&key',
})

export async function setDay(date, patch) {
  const existing = await db.days.get(date)
  const next = {
    date,
    flow: null,
    symptoms: [],
    note: '',
    ...existing,
    ...patch,
  }
  const empty =
    !next.flow && (!next.symptoms || next.symptoms.length === 0) && !next.note
  if (empty) {
    await db.days.delete(date)
    return null
  }
  await db.days.put(next)
  return next
}

export async function getSetting(key, fallback) {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value })
}

export async function clearAll() {
  await db.transaction('rw', db.days, db.settings, async () => {
    await db.days.clear()
    await db.settings.clear()
  })
}

export async function exportJSON() {
  const days = await db.days.orderBy('date').toArray()
  const settings = await db.settings.toArray()
  return {
    app: 'almanac-period-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    days,
    settings,
  }
}

export async function importJSON(payload) {
  if (!payload || !Array.isArray(payload.days)) {
    throw new Error('This file does not look like an Almanac backup.')
  }
  await db.transaction('rw', db.days, db.settings, async () => {
    await db.days.clear()
    await db.settings.clear()
    await db.days.bulkPut(
      payload.days.map((d) => ({
        date: d.date,
        flow: d.flow ?? null,
        symptoms: Array.isArray(d.symptoms) ? d.symptoms : [],
        note: typeof d.note === 'string' ? d.note : '',
      })),
    )
    if (Array.isArray(payload.settings)) {
      await db.settings.bulkPut(payload.settings)
    }
  })
}
