<template>
  <div class="active-quiz">
    <!-- Progress Bar -->
    <div class="progress-bar-track" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
      <div
        class="progress-bar-fill"
        :style="{ width: `${progressPercent}%` }"
        :class="{ 'progress-bar-fill--warning': timeLeft <= 10 }"
      ></div>
    </div>

    <div class="quiz-card" :class="feedbackClass">
      <!-- Live Stats Header -->
      <header class="quiz-header">
        <div class="stat-pill timer-pill">
          <span class="pill-label">Time Remaining</span>
          <span class="pill-val time-display">{{ formattedTimeLeft }}</span>
        </div>

        <div class="header-center">
          <span class="skill-tag">{{ currentSkillLabel }}</span>
          <div v-if="currentStreak >= 3" class="streak-pill">
            <span class="flame">🔥</span>
            <span>{{ currentStreak }} streak!</span>
          </div>
        </div>

        <div class="stat-pill score-pill">
          <span class="pill-label">Score / Pace</span>
          <span class="pill-val">{{ correctCount }} <span class="pace">({{ paceQpm }} QPM)</span></span>
        </div>
      </header>

      <!-- Question Prompt -->
      <main class="prompt-area">
        <div class="prompt-text">{{ currentQuestion.prompt }}</div>
      </main>

      <!-- Answer Input Form -->
      <form class="answer-form" novalidate @submit.prevent="submitAnswer">
        <label for="quiz-input" class="visually-hidden">Enter your answer</label>
        <input
          id="quiz-input"
          ref="inputRef"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="userAnswer"
          placeholder="?"
          class="answer-input"
          @input="onInputChange"
          @keydown.enter.prevent.stop="submitAnswer"
        />
        <div class="action-buttons">
          <button type="submit" class="btn-check">Submit (Enter)</button>
          <button type="button" class="btn-skip" @click="skipQuestion" title="Skip question (Space)">
            Skip (Space)
          </button>
        </div>
      </form>

      <!-- Feedback / Helper Text -->
      <footer class="quiz-footer">
        <p v-if="feedbackMsg" class="feedback-text" :class="feedbackStatus">{{ feedbackMsg }}</p>
        <div class="footer-actions">
          <button type="button" class="btn-end" @click="onEndQuiz">
            End Session
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { isCorrectAnswer, formatAnswer } from '../../utils/mathGenerators.js'
import { playCorrect, playStreak, playWrong } from '../../utils/audio.js'

const props = defineProps({
  currentQuestion: { type: Object, required: true },
  currentSkillLabel: { type: String, default: 'Arithmetic' },
  timeLeft: { type: Number, required: true },
  totalTime: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  autoAdvance: { type: Boolean, default: false }
})

const emit = defineEmits(['answer-submitted', 'skip-question', 'end-quiz'])

const userAnswer = ref('')
const feedbackMsg = ref('')
const feedbackStatus = ref('')
const feedbackClass = ref('')
const inputRef = ref(null)

const formattedTimeLeft = computed(() => {
  const m = Math.floor(props.timeLeft / 60)
  const s = props.timeLeft % 60
  return `${m > 0 ? m + ':' : ''}${s < 10 && m > 0 ? '0' : ''}${s}s`
})

const progressPercent = computed(() => {
  if (props.totalTime <= 0) return 0
  return Math.max(0, Math.min(100, (props.timeLeft / props.totalTime) * 100))
})

const paceQpm = computed(() => {
  const elapsed = props.totalTime - props.timeLeft
  if (elapsed <= 0) return '0.0'
  const qpm = (props.correctCount / elapsed) * 60
  return qpm.toFixed(1)
})

watch(
  () => props.currentQuestion,
  () => {
    userAnswer.value = ''
    feedbackMsg.value = ''
    focusInput()
  }
)

onMounted(() => {
  focusInput()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(e) {
  if (e.code === 'Enter') {
    e.preventDefault()
    submitAnswer()
  } else if (e.code === 'Space' && document.activeElement !== inputRef.value) {
    e.preventDefault()
    skipQuestion()
  }
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function onInputChange() {
  feedbackMsg.value = ''
  feedbackClass.value = ''

  if (props.autoAdvance && userAnswer.value.trim() !== '') {
    const num = Number(userAnswer.value.trim())
    if (!Number.isNaN(num) && isCorrectAnswer(num, props.currentQuestion.answer)) {
      submitAnswer()
    }
  }
}

function submitAnswer() {
  const val = userAnswer.value.trim()
  if (val === '') {
    feedbackMsg.value = 'Type a number to submit'
    feedbackStatus.value = 'feedback--hint'
    focusInput()
    return
  }

  const num = Number(val)
  const isCorrect = !Number.isNaN(num) && isCorrectAnswer(num, props.currentQuestion.answer)

  if (isCorrect) {
    feedbackClass.value = 'quiz-card--correct'
    if ((props.currentStreak + 1) % 5 === 0) {
      playStreak()
    } else {
      playCorrect()
    }
    userAnswer.value = ''
    emit('answer-submitted', {
      userAnswer: val,
      correct: true
    })
    focusInput()
    setTimeout(() => {
      feedbackClass.value = ''
    }, 200)
  } else {
    feedbackClass.value = 'quiz-card--wrong'
    playWrong()
    feedbackMsg.value = 'Incorrect, try again!'
    feedbackStatus.value = 'feedback--error'
    emit('answer-submitted', {
      userAnswer: val,
      correct: false
    })
    nextTick(() => {
      inputRef.value?.select()
    })
    setTimeout(() => {
      feedbackClass.value = ''
    }, 350)
  }
}

function skipQuestion() {
  emit('skip-question')
  userAnswer.value = ''
  feedbackMsg.value = `Skipped: answer was ${formatAnswer(props.currentQuestion.answer)}`
  feedbackStatus.value = 'feedback--hint'
  focusInput()
}

function onEndQuiz() {
  emit('end-quiz')
}

defineExpose({ focusInput })
</script>

<style scoped>
.active-quiz {
  max-width: 780px;
  margin: 32px auto 80px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Progress bar */
.progress-bar-track {
  width: 100%;
  height: 6px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-500), var(--brand-400));
  transition: width 1s linear;
}

.progress-bar-fill--warning {
  background: linear-gradient(90deg, var(--color-warning), var(--color-error));
}

/* Card */
.quiz-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  transition: all 0.2s ease;
}

.quiz-card--correct {
  animation: popSuccess 0.2s ease;
  border-color: var(--color-success);
}

.quiz-card--wrong {
  animation: shake 0.35s ease;
  border-color: var(--color-error);
}

/* Header */
.quiz-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pill-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-widest);
  color: var(--color-text-muted);
}

.pill-val {
  font-family: var(--font-mono);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.time-display {
  color: var(--color-primary);
}

.pace {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.skill-tag {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 4px 10px;
  background: rgba(13, 148, 136, 0.12);
  color: var(--color-primary);
  border-radius: var(--radius-full);
}

.streak-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning);
  animation: pulseGlow 1.5s infinite;
}

/* Prompt */
.prompt-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.prompt-text {
  font-family: var(--font-mono);
  font-size: clamp(2.8rem, 8vw, 4.5rem);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.01em;
  color: var(--color-text);
}

/* Form */
.answer-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.answer-input {
  width: 260px;
  max-width: 90%;
  font-family: var(--font-mono);
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: var(--font-weight-bold);
  text-align: center;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  outline: none;
}

.answer-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-check {
  background: var(--color-primary);
  color: white;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.btn-check:hover {
  background: var(--color-primary-hover);
}

.btn-skip {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.btn-skip:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text);
}

/* Footer */
.quiz-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.feedback-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.feedback--error {
  color: var(--color-error);
}

.feedback--hint {
  color: var(--color-text-muted);
}

.btn-end {
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  padding: 6px 12px;
  border-radius: var(--radius);
}

.btn-end:hover {
  color: var(--color-error);
}
</style>
