import { useState } from 'react'
import {
  monthGrid,
  monthLabel,
  toKey,
  todayKey,
} from '../lib/date'
import { dayState } from '../predictions'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const FLOW_FILL = {
  spotting: '#c98a93',
  light: '#b05c6b',
  medium: '#8a2e43',
  heavy: '#6a2030',
}

function DayCell({ date, inMonth, state, onClick }) {
  const { flow, predictedPeriod, fertile, ovulation, isToday, hasNote } = state
  const dayNum = date.getDate()

  const fill = flow ? FLOW_FILL[flow] : null

  return (
    <button
      onClick={onClick}
      className="relative flex aspect-square items-center justify-center"
      aria-label={toKey(date)}
    >
      {fertile && !fill && (
        <span className="absolute inset-1 rounded-full bg-sage-soft" />
      )}
      <span
        className={[
          'relative flex h-9 w-9 items-center justify-center rounded-full font-display text-[15px] tnum transition',
          !inMonth && 'opacity-30',
          fill ? 'text-cream' : 'text-ink',
          predictedPeriod && !fill
            ? 'border border-dashed border-wine text-wine'
            : '',
          isToday && !fill ? 'ring-1 ring-ink/40' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={fill ? { backgroundColor: fill } : undefined}
      >
        {dayNum}
        {ovulation && (
          <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-gold" />
        )}
        {hasNote && !ovulation && (
          <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-ink/40" />
        )}
      </span>
    </button>
  )
}

export default function Calendar({ model, onSelectDay }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const grid = monthGrid(cursor)
  const month = cursor.getMonth()

  const shift = (n) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))

  return (
    <section className="rounded-2xl border border-line bg-paper/50 px-3 py-4 sm:px-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-full px-3 py-1 text-ink-soft transition hover:bg-paper"
        >
          ‹
        </button>
        <h2 className="font-display text-xl">{monthLabel(cursor)}</h2>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-full px-3 py-1 text-ink-soft transition hover:bg-paper"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-ink-soft">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="pb-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const key = toKey(date)
          return (
            <DayCell
              key={key}
              date={date}
              inMonth={date.getMonth() === month}
              state={dayState(key, model)}
              onClick={() => onSelectDay(key)}
            />
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-1 pt-3 text-xs text-ink-soft">
        <Legend swatch={<Dot color="#8a2e43" />} label="Logged" />
        <Legend
          swatch={
            <span className="h-3 w-3 rounded-full border border-dashed border-wine" />
          }
          label="Predicted"
        />
        <Legend
          swatch={<span className="h-3 w-3 rounded-full bg-sage-soft" />}
          label="Fertile window"
        />
        <Legend swatch={<Dot color="#b07d2a" small />} label="Ovulation" />
      </div>
      <p className="mt-2 px-1 text-[11px] text-ink-soft">
        Today is {todayKey() === toKey(new Date()) ? 'circled' : 'marked'}.
        Predictions are estimates, not contraception or medical advice.
      </p>
    </section>
  )
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  )
}

function Dot({ color, small }) {
  return (
    <span
      className={small ? 'h-1.5 w-1.5 rounded-full' : 'h-3 w-3 rounded-full'}
      style={{ backgroundColor: color }}
    />
  )
}
