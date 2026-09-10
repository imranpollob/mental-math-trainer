export const numberRangeOptions = [
  { id: 'single', label: 'Single-digit (1–9)', min: 1, max: 9 },
  { id: 'double', label: 'Two-digit (10–99)', min: 10, max: 99 },
  { id: 'triple', label: 'Three-digit (100–999)', min: 100, max: 999 },
  { id: 'quad', label: 'Four-digit (1000–9999)', min: 1000, max: 9999 }
]

export const percentRangeOptions = [
  { id: 'percent-basic', label: '5% – 50% (step 5)', min: 5, max: 50, step: 5 },
  { id: 'percent-advanced', label: '5% – 95% (step 5)', min: 5, max: 95, step: 5 }
]

export const numberRangeMap = numberRangeOptions.reduce((acc, opt) => {
  acc[opt.id] = opt
  return acc
}, {})

export const percentRangeMap = percentRangeOptions.reduce((acc, opt) => {
  acc[opt.id] = opt
  return acc
}, {})

export const operationDefinitions = {
  addition: {
    label: 'Addition',
    symbol: '+',
    description: 'Combine numbers rapidly and reinforce mental number grouping.',
    rangeControls: [
      { key: 'firstRange', label: 'First number', type: 'number' },
      { key: 'secondRange', label: 'Second number', type: 'number' }
    ],
    defaultState: { firstRange: 'double', secondRange: 'double' },
    generate: state => {
      const first = pickNumber(state.firstRange)
      const second = pickNumber(state.secondRange)
      return {
        prompt: `${first} + ${second}`,
        operator: '+',
        first,
        second,
        answer: first + second
      }
    }
  },
  subtraction: {
    label: 'Subtraction',
    symbol: '−',
    description: 'Strengthen subtraction fluency with controlled ranges.',
    rangeControls: [
      { key: 'firstRange', label: 'Starting number', type: 'number' },
      { key: 'secondRange', label: 'Number to subtract', type: 'number' }
    ],
    defaultState: { firstRange: 'double', secondRange: 'double' },
    generate: state => {
      let first = pickNumber(state.firstRange)
      let second = pickNumber(state.secondRange)
      if (second > first) {
        ;[first, second] = [second, first]
      }
      return {
        prompt: `${first} − ${second}`,
        operator: '−',
        first,
        second,
        answer: first - second
      }
    }
  },
  multiplication: {
    label: 'Multiplication',
    symbol: '×',
    description: 'Train rapid recall of products in your chosen ranges.',
    rangeControls: [
      { key: 'firstRange', label: 'First factor', type: 'number' },
      { key: 'secondRange', label: 'Second factor', type: 'number' }
    ],
    defaultState: { firstRange: 'single', secondRange: 'double' },
    generate: state => {
      const first = pickNumber(state.firstRange)
      const second = pickNumber(state.secondRange)
      return {
        prompt: `${first} × ${second}`,
        operator: '×',
        first,
        second,
        answer: first * second
      }
    }
  },
  division: {
    label: 'Division',
    symbol: '÷',
    description: 'Master clean quotients for fast, exact mental calculations.',
    rangeControls: [
      { key: 'firstRange', label: 'Quotient range', type: 'number' },
      { key: 'secondRange', label: 'Divisor range', type: 'number' }
    ],
    defaultState: { firstRange: 'single', secondRange: 'double' },
    generate: state => {
      const quotient = pickNumber(state.firstRange)
      let divisor = pickNumber(state.secondRange)
      if (divisor === 0) divisor = 1
      const dividend = quotient * divisor
      return {
        prompt: `${dividend} ÷ ${divisor}`,
        operator: '÷',
        first: dividend,
        second: divisor,
        answer: quotient
      }
    }
  },
  percentage: {
    label: 'Percentages',
    symbol: '%',
    description: 'Calculate percentages with real-world friendly round figures.',
    rangeControls: [
      { key: 'firstRange', label: 'Percent range', type: 'percent' },
      { key: 'secondRange', label: 'Base number', type: 'number' }
    ],
    defaultState: { firstRange: 'percent-basic', secondRange: 'double' },
    generate: state => {
      const percent = pickPercent(state.firstRange)
      const base = pickNumber(state.secondRange)
      const raw = (percent * base) / 100
      const answer = Number.isInteger(raw) ? raw : Number(raw.toFixed(2))
      return {
        prompt: `${percent}% of ${base}`,
        operator: '%',
        first: percent,
        second: base,
        answer
      }
    }
  },
  square: {
    label: 'Squares',
    symbol: '²',
    description: 'Lock in memory of key square numbers for lightning recall.',
    rangeControls: [{ key: 'firstRange', label: 'Number range', type: 'number' }],
    defaultState: { firstRange: 'single' },
    generate: state => {
      const value = pickNumber(state.firstRange)
      return {
        prompt: `${value}²`,
        operator: '²',
        first: value,
        second: null,
        answer: value * value
      }
    }
  },
  squareRoot: {
    label: 'Square Roots',
    symbol: '√',
    description: 'Instantly identify perfect square roots.',
    rangeControls: [{ key: 'firstRange', label: 'Root range', type: 'number' }],
    defaultState: { firstRange: 'single' },
    generate: state => {
      const root = pickNumber(state.firstRange)
      const radicand = root * root
      return {
        prompt: `√${radicand}`,
        operator: '√',
        first: radicand,
        second: null,
        answer: root
      }
    }
  }
}

export const difficultyPresets = {
  easy: {
    id: 'easy',
    label: 'Easy',
    badge: 'Beginner',
    description: 'Single-digit addition & subtraction in a 60s drill.',
    time: 60,
    operations: {
      addition: { active: true, firstRange: 'single', secondRange: 'single' },
      subtraction: { active: true, firstRange: 'single', secondRange: 'single' }
    }
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    badge: 'Intermediate',
    description: 'Two-digit addition/subtraction, 1×2 digit multiplication, and squares (90s).',
    time: 90,
    operations: {
      addition: { active: true, firstRange: 'double', secondRange: 'double' },
      subtraction: { active: true, firstRange: 'double', secondRange: 'double' },
      multiplication: { active: true, firstRange: 'single', secondRange: 'double' },
      square: { active: true, firstRange: 'single' }
    }
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    badge: 'Advanced',
    description: 'Full arithmetic mix: products, clean quotients, percentages, and squares (120s).',
    time: 120,
    operations: {
      addition: { active: true, firstRange: 'double', secondRange: 'double' },
      subtraction: { active: true, firstRange: 'double', secondRange: 'double' },
      multiplication: { active: true, firstRange: 'double', secondRange: 'double' },
      division: { active: true, firstRange: 'single', secondRange: 'double' },
      percentage: { active: true, firstRange: 'percent-basic', secondRange: 'double' },
      square: { active: true, firstRange: 'double' }
    }
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    badge: 'Mastery',
    description: '3-digit arithmetic, double multiplication, roots, and advanced percentages (150s).',
    time: 150,
    operations: {
      addition: { active: true, firstRange: 'triple', secondRange: 'triple' },
      subtraction: { active: true, firstRange: 'triple', secondRange: 'triple' },
      multiplication: { active: true, firstRange: 'double', secondRange: 'double' },
      division: { active: true, firstRange: 'double', secondRange: 'double' },
      percentage: { active: true, firstRange: 'percent-advanced', secondRange: 'triple' },
      square: { active: true, firstRange: 'double' },
      squareRoot: { active: true, firstRange: 'double' }
    }
  }
}

export function pickNumber(rangeId) {
  const range = numberRangeMap[rangeId] || numberRangeOptions[0]
  return randomInt(range.min, range.max)
}

export function pickPercent(rangeId) {
  const range = percentRangeMap[rangeId] || percentRangeOptions[0]
  const step = range.step ?? 1
  const choices = Math.floor((range.max - range.min) / step)
  const offset = randomInt(0, choices)
  return range.min + offset * step
}

export function randomInt(min, max) {
  const low = Math.ceil(min)
  const high = Math.floor(max)
  return Math.floor(Math.random() * (high - low + 1)) + low
}

export function isCorrectAnswer(userValue, expectedValue) {
  if (Number.isInteger(expectedValue)) {
    return Math.round(userValue) === expectedValue
  }
  return Math.abs(userValue - expectedValue) <= 0.01
}

export function formatAnswer(value) {
  if (value === null || value === undefined) return ''
  if (Number.isInteger(value)) {
    return value.toString()
  }
  return value.toFixed(2)
}
