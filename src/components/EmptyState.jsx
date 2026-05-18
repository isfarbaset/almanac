import { seedDemo } from '../demo'

export default function EmptyState({ onLogToday }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-line bg-paper/60 px-6 py-12 text-center animate-fade-in">
      <div className="font-display text-5xl text-wine">✶</div>
      <h2 className="mt-4 font-display text-2xl">Start your record</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        Log the first day of your period and Almanac begins learning your
        rhythm. After two cycles you get real predictions, not a generic
        28 day guess.
      </p>
      <button
        onClick={onLogToday}
        className="mt-6 rounded-full bg-wine px-6 py-3 font-display text-lg text-cream transition active:scale-95"
      >
        Log today
      </button>
      <button
        onClick={() => seedDemo()}
        className="mt-3 text-sm text-ink-soft underline underline-offset-4 transition hover:text-ink"
      >
        Or explore with sample data
      </button>
    </div>
  )
}
