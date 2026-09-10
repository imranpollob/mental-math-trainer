let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

let isMuted = false

export function setMuted(muted) {
  isMuted = Boolean(muted)
  if (typeof window !== 'undefined') {
    localStorage.setItem('mm_sound_muted', isMuted ? '1' : '0')
  }
}

export function getMuted() {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem('mm_sound_muted')
    if (val !== null) {
      isMuted = val === '1'
    }
  }
  return isMuted
}

export function playTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.15) {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // Ignore audio errors in restricted browser environments
  }
}

export function playCorrect() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14) // A5

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch (e) { }
}

export function playStreak() {
  if (isMuted) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'sine', 0.18, 0.14)
    }, idx * 60)
  })
}

export function playWrong() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, now) // A3
    osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.18) // D3

    gain.gain.setValueAtTime(0.14, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  } catch (e) { }
}

export function playStart() {
  if (isMuted) return
  const notes = [440, 554.37, 659.25] // A4, C#5, E5 rising chime
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'sine', 0.14, 0.16)
    }, idx * 75)
  })
}

export function playEnd() {
  if (isMuted) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 completion chime
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 'sine', 0.3, 0.15)
    }, i * 85)
  })
}

export function playComplete() {
  playEnd()
}
