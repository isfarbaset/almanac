import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getSetting } from './db'
import { buildModel } from './predictions'
import { todayKey } from './lib/date'
import Header from './components/Header'
import PredictionCard from './components/PredictionCard'
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

  // null while Dexie is still resolving the first read.
  if (days === null) {
    return (
      <div className="flex h-full items-center justify-center text-ink-soft">
        <span className="font-display text-2xl">Almanac</span>
      </div>
    )
  }

  const model = buildModel(days, cycleOverride ?? undefined)
  const hasData = days.length > 0

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 pb-24 pt-8 sm:px-6">
      <Header onSettings={() => setShowSettings(true)} />

      {!hasData ? (
        <EmptyState onLogToday={() => setOpenDay(todayKey())} />
      ) : (
        <>
          <PredictionCard model={model} />
          <Calendar model={model} onSelectDay={setOpenDay} />
        </>
      )}

      <button
        onClick={() => setOpenDay(todayKey())}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-wine px-7 py-3.5 font-display text-lg tracking-wide text-cream shadow-lg shadow-wine/25 transition active:scale-95"
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
          model={model}
          cycleOverride={cycleOverride}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
