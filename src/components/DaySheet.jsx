import { useState } from 'react'
import { setDay } from '../db'
import { prettyDate } from '../lib/date'
import { FLOWS } from '../predictions'

const SYMPTOMS = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'mood',
  'tender breasts',
  'nausea',
  'acne',
]

const FLOW_LABEL = {
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
}

export default function DaySheet({ dateKey, record, onClose }) {
  const [flow, setFlow] = useState(record?.flow ?? null)
  const [symptoms, setSymptoms] = useState(record?.symptoms ?? [])
  const [note, setNote] = useState(record?.note ?? '')
  const [saving, setSaving] = useState(false)

  const toggleSymptom = (s) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )

  async function save() {
    setSaving(true)
    await setDay(dateKey, { flow, symptoms, note: note.trim() })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-ink/30 animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
        className="w-full max-w-xl rounded-t-3xl bg-cream px-6 pt-6 shadow-2xl animate-sheet-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <h2 className="font-display text-2xl">{prettyDate(dateKey)}</h2>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Flow
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip active={flow === null} onClick={() => setFlow(null)}>
              None
            </Chip>
            {FLOWS.map((f) => (
              <Chip key={f} active={flow === f} onClick={() => setFlow(f)}>
                {FLOW_LABEL[f]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Symptoms
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <Chip
                key={s}
                active={symptoms.includes(s)}
                onClick={() => toggleSymptom(s)}
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Anything worth remembering"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-paper/40 px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-line py-3 text-ink-soft transition hover:bg-paper"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-full bg-wine py-3 font-display text-lg text-cream transition active:scale-95 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-1.5 text-sm capitalize transition',
        active
          ? 'border-wine bg-wine text-cream'
          : 'border-line bg-paper/40 text-ink hover:border-wine/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
