import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSetting } from './db'
import { buildModel } from './predictions'
import { todayKey } from './lib/date'
import { checkReminders } from './reminders'
import Header from './components/Header'
import PredictionCard from './components/PredictionCard'
import PhaseCard from './components/PhaseCard'
import Calendar from './components/Calendar'
import DaySheet from './components/DaySheet'
import Settings from './components/Settings'
import EmptyState from './components/EmptyState'

export default function App() {
  const days = useLiveQuery(() => db.days.orderBy('date').toArray(), [], null)
  const cycleOverride = useLiveQuery(
    () => getSetting('cycleOverride', null),
    [],
    null,
  )

  const [openDay, setOpenDay] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [banner, setBanner] = useState(null)

  const ready = days !== null
  const model = ready ? buildModel(days, cycleOverride ?? undefined) : null

  // Evaluate reminders on open and whenever the app is refocused.
  useEffect(() => {
    if (!model) return
    let active = true
    const run = () =>
      checkReminders(model).then((m) => active && m && setBanner(m.body))
    run()
    const onVis = () => document.visibilityState === 'visible' && run()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [model])

  // null while Dexie is still resolving the first read.
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-ink-soft">
        <span className="font-display text-2xl">Almanac</span>
      </div>
    )
  }

  const hasData = days.length > 0

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-32 pt-8 sm:px-6">
      <Header onSettings={() => setShowSettings(true)} />

      {banner && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-wine/30 bg-wine-soft/30 px-4 py-3 text-sm text-ink animate-fade-in">
          <span className="leading-relaxed">{banner}</span>
          <button
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
            className="shrink-0 text-ink-soft transition hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}

      {!hasData ? (
        <EmptyState onLogToday={() => setOpenDay(todayKey())} />
      ) : (
        <>
          <PredictionCard model={model} />
          <PhaseCard model={model} />
          <Calendar model={model} onSelectDay={setOpenDay} />
        </>
      )}

      <button
        onClick={() => setOpenDay(todayKey())}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
        className="fixed left-1/2 -translate-x-1/2 rounded-full bg-wine px-7 py-3.5 font-display text-lg tracking-wide text-cream shadow-lg shadow-wine/25 transition active:scale-95"
      >
        Log today
      </button>

      {openDay && (
        <DaySheet
          dateKey={openDay}
          record={model.daysMap.get(openDay) || null}
          onClose={() => setOpenDay(null)}
        />
      )}

      {showSettings && (
        <Settings
          cycleOverride={cycleOverride}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
