export default function Header({ onSettings }) {
  return (
    <header className="mb-6 flex items-baseline justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Almanac
        </h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Private by design. Stored only on this device.
        </p>
      </div>
      <button
        onClick={onSettings}
        aria-label="Settings"
        className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft transition hover:bg-paper"
      >
        Settings
      </button>
    </header>
  )
}
