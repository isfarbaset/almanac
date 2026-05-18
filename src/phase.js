// Maps the current cycle day onto the four menstrual phases. Boundaries are
// derived from the user's own averages, so they shift as their data does.
// Tone is deliberately calm and non-clinical.

export const PHASES = {
  menstrual: {
    label: 'Menstrual',
    tag: 'Bleeding phase',
    blurb:
      'Your period. Hormones are at their lowest, which is why energy often dips. Rest is reasonable, not lazy.',
  },
  follicular: {
    label: 'Follicular',
    tag: 'Building up',
    blurb:
      'After your period, estrogen rises and an egg matures. Energy and mood usually climb through this stretch.',
  },
  ovulation: {
    label: 'Ovulation',
    tag: 'Fertile peak',
    blurb:
      'An egg is released around now. This is the most fertile part of the cycle and often the highest energy.',
  },
  luteal: {
    label: 'Luteal',
    tag: 'Winding down',
    blurb:
      'After ovulation, progesterone rises. PMS-type symptoms tend to show up in the days just before your period.',
  },
  unknown: {
    label: 'Getting started',
    tag: 'Learning your rhythm',
    blurb:
      'Log a period and Almanac can place you within your cycle and explain what is typically happening.',
  },
}

export const PHASE_ORDER = ['menstrual', 'follicular', 'ovulation', 'luteal']

export function currentPhase(model) {
  const { cycleDay, stats } = model
  if (!cycleDay || !stats) {
    return { key: 'unknown', ...PHASES.unknown, dayInCycle: null }
  }

  const periodLen = Math.max(2, stats.avgPeriodLen)
  // Ovulation lands roughly 14 days before the next period (luteal length).
  const ovDay = Math.max(periodLen + 1, stats.avgCycle - 14)

  let key
  if (cycleDay <= periodLen) {
    key = 'menstrual'
  } else if (cycleDay >= ovDay - 1 && cycleDay <= ovDay + 1) {
    key = 'ovulation'
  } else if (cycleDay < ovDay - 1) {
    key = 'follicular'
  } else {
    key = 'luteal'
  }

  return { key, ...PHASES[key], dayInCycle: cycleDay }
}
