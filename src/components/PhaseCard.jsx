import { useState } from 'react'
import { currentPhase, PHASES, PHASE_ORDER } from '../phase'

const PHASE_COLOR = {
  menstrual: '#8a2e43',
  follicular: '#b07d2a',
  ovulation: '#8fa68a',
  luteal: '#6a5f54',
}

export default function PhaseCard({ model }) {
  const [open, setOpen] = useState(false)
  const phase = currentPhase(model)

  if (phase.key === 'unknown') return null

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-paper/70">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            {phase.tag}
          </div>
          <div className="mt-1 font-display text-2xl">
            {phase.label} phase
          </div>
        </div>
        <span className="text-ink-soft">{open ? '–' : '+'}</span>
      </button>

      <div className="flex gap-1 px-5 pb-4">
        {PHASE_ORDER.map((k) => (
          <span
            key={k}
            className="h-1.5 flex-1 rounded-full transition"
            style={{
              backgroundColor: PHASE_COLOR[k],
              opacity: k === phase.key ? 1 : 0.22,
            }}
          />
        ))}
      </div>

      {open && (
        <div className="border-t border-line px-5 py-4 animate-fade-in">
          <p className="text-sm leading-relaxed text-ink">{phase.blurb}</p>
          <div className="mt-4 space-y-3 border-t border-line pt-4">
            {PHASE_ORDER.map((k) => (
              <div key={k} className="flex gap-3">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PHASE_COLOR[k] }}
                />
                <div>
                  <div className="font-display text-base">
                    {PHASES[k].label}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {PHASES[k].blurb}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
            Phases are estimated from your own averages and shift as you log
            more. General information, not medical advice.
          </p>
        </div>
      )}
    </section>
  )
}
