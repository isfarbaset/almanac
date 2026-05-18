import { useRef, useState } from 'react'
import { clearAll, exportJSON, importJSON, setSetting } from '../db'

export default function Settings({ cycleOverride, onClose }) {
  const fileRef = useRef(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [msg, setMsg] = useState(null)
  const [override, setOverride] = useState(
    cycleOverride ? String(cycleOverride) : '',
  )

  async function doExport() {
    const data = await exportJSON()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `almanac-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function doImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importJSON(JSON.parse(text))
      setMsg('Backup restored.')
    } catch (err) {
      setMsg(err.message || 'Could not read that file.')
    }
    e.target.value = ''
  }

  async function saveOverride(v) {
    setOverride(v)
    const n = parseInt(v, 10)
    await setSetting(
      'cycleOverride',
      Number.isFinite(n) && n >= 15 && n <= 60 ? n : null,
    )
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/30 animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-t-3xl bg-cream px-6 pb-8 pt-6 shadow-2xl animate-sheet-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <h2 className="font-display text-2xl">Settings</h2>

        <div className="mt-5 rounded-xl bg-sage-soft px-4 py-3 text-sm leading-relaxed text-ink">
          Your data lives only in this browser. Nothing is uploaded, there is
          no account, and there are no trackers. Export regularly so you keep
          your own backup.
        </div>

        <div className="mt-6">
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Predicted cycle length
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Leave blank to let Almanac learn it from your history.
          </p>
          <input
            type="number"
            inputMode="numeric"
            min={15}
            max={60}
            value={override}
            onChange={(e) => saveOverride(e.target.value)}
            placeholder="Auto"
            className="mt-2 w-28 rounded-xl border border-line bg-paper/40 px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={doExport}
            className="w-full rounded-full border border-line py-3 text-ink transition hover:bg-paper"
          >
            Export backup (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-full border border-line py-3 text-ink transition hover:bg-paper"
          >
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={doImport}
          />
        </div>

        {msg && (
          <p className="mt-3 text-center text-sm text-wine">{msg}</p>
        )}

        <div className="mt-6 border-t border-line pt-5">
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full rounded-full border border-wine/40 py-3 text-wine transition hover:bg-wine-soft/30"
            >
              Clear all data
            </button>
          ) : (
            <div className="rounded-xl border border-wine/40 bg-wine-soft/20 p-4 text-center">
              <p className="text-sm text-ink">
                This permanently erases every logged day on this device. It
                cannot be undone.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 rounded-full border border-line py-2.5 text-ink-soft transition hover:bg-paper"
                >
                  Keep my data
                </button>
                <button
                  onClick={async () => {
                    await clearAll()
                    onClose()
                  }}
                  className="flex-1 rounded-full bg-wine py-2.5 text-cream transition active:scale-95"
                >
                  Erase everything
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-ink py-3 font-display text-lg text-cream transition active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  )
}
