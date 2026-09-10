const THEME_KEY = 'mm_theme_preference'
const BESTS_KEY = 'mm_personal_bests'
const LIFETIME_KEY = 'mm_lifetime_stats'
const STREAK_KEY = 'mm_practice_streak'

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function setStoredTheme(theme) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function getPersonalBests() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(BESTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

export function savePersonalBest(difficulty, stats) {
  if (typeof window === 'undefined') return { isNewBest: false }
  try {
    const bests = getPersonalBests()
    const current = bests[difficulty] || { score: 0, qpm: 0 }
    const isNewBest = stats.score > current.score

    if (isNewBest || !bests[difficulty]) {
      bests[difficulty] = {
        score: Math.max(stats.score, current.score || 0),
        qpm: Math.max(stats.qpm, current.qpm || 0),
        accuracy: stats.accuracy,
        date: new Date().toISOString()
      }
      localStorage.setItem(BESTS_KEY, JSON.stringify(bests))
      return { isNewBest: true, previousBest: current.score }
    }
    return { isNewBest: false, previousBest: current.score }
  } catch (e) {
    return { isNewBest: false }
  }
}

export function getLifetimeStats() {
  if (typeof window === 'undefined') return { totalQuestions: 0, totalCorrect: 0, totalSessions: 0 }
  try {
    const raw = localStorage.getItem(LIFETIME_KEY)
    return raw ? JSON.parse(raw) : { totalQuestions: 0, totalCorrect: 0, totalSessions: 0 }
  } catch (e) {
    return { totalQuestions: 0, totalCorrect: 0, totalSessions: 0 }
  }
}

export function recordSessionLifetime(totalQuestions, correctCount) {
  if (typeof window === 'undefined') return
  try {
    const current = getLifetimeStats()
    const updated = {
      totalQuestions: current.totalQuestions + totalQuestions,
      totalCorrect: current.totalCorrect + correctCount,
      totalSessions: current.totalSessions + 1
    }
    localStorage.setItem(LIFETIME_KEY, JSON.stringify(updated))
    recordDailyStreak()
  } catch (e) {}
}

export function getStreakInfo() {
  if (typeof window === 'undefined') return { currentStreak: 0, bestStreak: 0 }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { currentStreak: 0, bestStreak: 0, lastDate: null }
  } catch (e) {
    return { currentStreak: 0, bestStreak: 0, lastDate: null }
  }
}

export function recordDailyStreak() {
  if (typeof window === 'undefined') return
  try {
    const info = getStreakInfo()
    const today = new Date().toISOString().slice(0, 10)

    if (info.lastDate === today) {
      return // Already recorded today
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = 1

    if (info.lastDate === yesterday) {
      newStreak = (info.currentStreak || 0) + 1
    }

    const bestStreak = Math.max(newStreak, info.bestStreak || 0)
    const updated = {
      currentStreak: newStreak,
      bestStreak,
      lastDate: today
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
  } catch (e) {}
}
