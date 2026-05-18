import { getSetting, setSetting } from './db'
import { todayKey, addDaysKey } from './lib/date'
import { FLOWS } from './predictions'

// Honest constraint: this app has no server, so there is no true background
// push. Reminders are evaluated whenever the app is opened or refocused.
// That keeps the privacy promise intact (nothing leaves the device) at the
// cost of needing the app to be opened sometime around the relevant day.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function enableReminders() {
  if (!notificationsSupported()) return 'unsupported'
  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  if (perm === 'granted') {
    await setSetting('remindersOn', true)
    return 'granted'
  }
  await setSetting('remindersOn', false)
  return perm // 'denied'
}

export async function disableReminders() {
  await setSetting('remindersOn', false)
}

function bledWithin(model, days) {
  const bleeding = new Set(FLOWS)
  for (let i = 0; i <= days; i++) {
    const rec = model.daysMap.get(addDaysKey(todayKey(), -i))
    if (rec && bleeding.has(rec.flow)) return true
  }
  return false
}

function pickMessage(model) {
  const p = model.prediction
  if (!p) return null
  const due = p.daysUntil

  if (due < 0 && !bledWithin(model, 1)) {
    const n = Math.abs(due)
    return {
      id: 'late',
      title: 'Almanac',
      body: `Your period is ${n} ${n === 1 ? 'day' : 'days'} late. Cycles shift for many reasons. Log it whenever it starts.`,
    }
  }
  if (due === 0) {
    return { id: 'today', title: 'Almanac', body: 'Your period is likely to start today.' }
  }
  if (due === 1) {
    return { id: 'tomorrow', title: 'Almanac', body: 'Heads up: your period is likely tomorrow.' }
  }

  const p2 = model.prediction
  const fertileStart = p2 ? addDaysKey(p2.ovulationDay, -5) : null
  if (fertileStart && fertileStart === todayKey()) {
    return { id: 'fertile', title: 'Almanac', body: 'Your estimated fertile window starts today.' }
  }
  return null
}

// Returns the message shown (for in-app fallback) or null.
export async function checkReminders(model) {
  const on = await getSetting('remindersOn', false)
  if (!on) return null

  const msg = pickMessage(model)
  if (!msg) return null

  // Fire each distinct message at most once per day.
  const stamp = `${todayKey()}:${msg.id}`
  const last = await getSetting('lastReminderStamp', null)
  if (last === stamp) return null
  await setSetting('lastReminderStamp', stamp)

  if (notificationsSupported() && Notification.permission === 'granted') {
    try {
      new Notification(msg.title, { body: msg.body, tag: 'almanac-' + msg.id })
    } catch {
      // Some browsers require a service worker registration to construct
      // Notification directly; the in-app banner below is the fallback.
    }
  }
  return msg
}
