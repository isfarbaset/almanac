import { seedDemo } from '../demo'

// No entrance animation here: this is the first thing a visitor sees, and a
// fade that starts at opacity 0 stays frozen there whenever the page loads in
// a background tab or a hidden pane, leaving the card looking disabled.
export default function EmptyState({ onLogToday }) {
  return (
    <section className="mt-4 flex flex-col items-center rounded-3xl border border-wine/15 bg-paper px-6 py-12 text-center shadow-sm shadow-ink/5 sm:mt-8 sm:px-10 sm:py-14">
      <div
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-wine-soft/40 font-display text-4xl leading-none text-wine"
      >
        ✶
      </div>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
        Start your record
      </h2>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
        Log the first day of your period and Almanac begins learning your
        rhythm. After two cycles you get real predictions, not a generic
        28 day guess.
      </p>
      <button
        onClick={onLogToday}
        className="mt-8 w-full max-w-xs rounded-full bg-wine px-7 py-3.5 font-display text-lg tracking-wide text-cream shadow-lg shadow-wine/25 transition hover:bg-wine/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine active:scale-95"
      >
        Log today
      </button>
      <button
        onClick={() => seedDemo()}
        className="mt-4 rounded text-sm text-ink-soft underline decoration-ink-soft/40 underline-offset-4 transition hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
      >
        Or explore with sample data
      </button>
    </section>
  )
}
