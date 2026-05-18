import { prettyShort } from '../lib/date'

function Stat({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl leading-none tnum">
        {children}
      </div>
    </div>
  )
}

export default function PredictionCard({ model }) {
  const { prediction: p, cycleDay, stats, irregular } = model

  if (!p) {
    return (
      <section className="mb-6 rounded-2xl border border-line bg-paper/60 px-5 py-5 text-sm text-ink-soft">
        Log a period to begin predictions.
      </section>
    )
  }

  const due = p.daysUntil
  const headline =
    due === 0
      ? 'Period likely today'
      : due > 0
        ? `Next period in ${due} ${due === 1 ? 'day' : 'days'}`
        : `Period ${Math.abs(due)} ${Math.abs(due) === 1 ? 'day' : 'days'} late`

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-paper/70">
      <div className="border-b border-line px-5 py-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-wine">
          Forecast
        </div>
        <div className="mt-1.5 font-display text-3xl leading-tight">
          {headline}
        </div>
        <div className="mt-1 text-sm text-ink-soft">
          Around {prettyShort(p.nextStart)}, give or take {p.confidence}{' '}
          {p.confidence === 1 ? 'day' : 'days'}
          {!p.reliable && ' — based on limited data so far'}.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <Stat label="Cycle day">{cycleDay ?? '—'}</Stat>
        <Stat label="Avg cycle">
          {stats.avgCycle}
          <span className="text-sm text-ink-soft"> d</span>
        </Stat>
        <Stat label="Avg period">
          {stats.avgPeriodLen}
          <span className="text-sm text-ink-soft"> d</span>
        </Stat>
      </div>

      {irregular && (
        <div className="border-t border-line bg-wine-soft/40 px-5 py-3 text-sm leading-relaxed text-ink">
          Your recent cycles vary by more than a week (
          {stats.minCycle} to {stats.maxCycle} days). That can be normal, but
          if it is new for you it is worth mentioning to a clinician.
        </div>
      )}
    </section>
  )
}
