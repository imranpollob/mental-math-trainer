<template>
  <main class="page-main">
    <!-- Active Quiz Mode -->
    <QuizActive
      v-if="quizRunning"
      ref="activeQuizRef"
      :current-question="currentQuestion"
      :current-skill-label="currentOperationLabel"
      :time-left="currentQuizTime"
      :total-time="quizTime"
      :correct-count="currentCorrectCount"
      :attempt-count="logs.length"
      :current-streak="currentStreak"
      :auto-advance="autoAdvance"
      @answer-submitted="handleAnswerSubmitted"
      @skip-question="handleSkipQuestion"
      @end-quiz="stopQuiz"
    />

    <!-- Quiz Results Screen -->
    <QuizResults
      v-else-if="showResults"
      :logs="logs"
      :session-duration="quizTime"
      :difficulty-label="currentDifficultyLabel"
      :is-new-best="isNewBest"
      @play-again="playAgain"
      @change-settings="changeSettings"
    />

    <!-- Settings / Lobby Screen -->
    <QuizSettings
      v-else
      :operations="operations"
      :selected-difficulty="selectedDifficulty"
      :quiz-time="quizTime"
      :auto-advance="autoAdvance"
      :personal-bests="personalBests"
      :error-message="setupError"
      @update:selected-difficulty="val => selectedDifficulty = val"
      @update:quiz-time="val => quizTime = val"
      @update:auto-advance="val => autoAdvance = val"
      @select-preset="applyPreset"
      @start="startQuiz"
    />

    <!-- Lifetime Stats Modal -->
    <StatsModal
      v-if="showStatsModal"
      @close="showStatsModal = false"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import QuizSettings from '../components/quiz/QuizSettings.vue'
import QuizActive from '../components/quiz/QuizActive.vue'
import QuizResults from '../components/quiz/QuizResults.vue'
import StatsModal from '../components/quiz/StatsModal.vue'

import {
  operationDefinitions,
  difficultyPresets,
  formatAnswer,
  randomInt
} from '../utils/mathGenerators.js'

import {
  getPersonalBests,
  savePersonalBest,
  recordSessionLifetime
} from '../utils/storage.js'

import { playStart, playEnd } from '../utils/audio.js'

const props = defineProps({
  showStats: { type: Boolean, default: false }
})

const showStatsModal = ref(false)
const selectedDifficulty = ref('easy')
const quizTime = ref(difficultyPresets.easy.time)
const autoAdvance = ref(false)

const operations = reactive(createInitialOperations())
const quizRunning = ref(false)
const showResults = ref(false)
const setupError = ref('')
const isNewBest = ref(false)
const personalBests = ref(getPersonalBests())

const currentQuizTime = ref(quizTime.value)
const individualTime = ref(0)
const quizTimer = ref(null)
const individualTimer = ref(null)

const activeQuizRef = ref(null)
const logs = ref([])
const currentStreak = ref(0)

const currentQuestion = reactive({
  key: '',
  prompt: '',
  operator: '',
  first: null,
  second: null,
  answer: null
})

applyPreset('easy')

onMounted(() => {
  window.addEventListener('open-stats-modal', () => {
    showStatsModal.value = true
  })

  window.addEventListener('keydown', handleGlobalKey)
})

onBeforeUnmount(() => {
  clearInterval(quizTimer.value)
  clearInterval(individualTimer.value)
  window.removeEventListener('keydown', handleGlobalKey)
})

function handleGlobalKey(e) {
  if (!quizRunning.value && !showResults.value && !showStatsModal.value) {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault()
      startQuiz()
    } else if (e.code === 'Enter' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault()
      startQuiz()
    }
  } else if (showResults.value) {
    if (e.code === 'Enter') {
      e.preventDefault()
      playAgain()
    }
  }
}

const currentOperationLabel = computed(() => {
  if (!currentQuestion.key) return 'Arithmetic'
  return operationDefinitions[currentQuestion.key]?.label ?? 'Arithmetic'
})

const currentDifficultyLabel = computed(() => {
  if (selectedDifficulty.value === 'custom') return 'Custom'
  return difficultyPresets[selectedDifficulty.value]?.label ?? 'Standard'
})

const currentCorrectCount = computed(() => {
  return logs.value.filter(l => l.correct).length
})

function createInitialOperations() {
  const initial = {}
  for (const [key, def] of Object.entries(operationDefinitions)) {
    initial[key] = {
      active: false,
      ...def.defaultState
    }
  }
  return initial
}

function applyPreset(id) {
  selectedDifficulty.value = id
  if (id === 'custom') return

  const preset = difficultyPresets[id]
  if (!preset) return

  // Reset all to inactive
  for (const [key, def] of Object.entries(operationDefinitions)) {
    operations[key].active = false
    Object.assign(operations[key], def.defaultState)
  }

  quizTime.value = preset.time
  currentQuizTime.value = preset.time

  Object.entries(preset.operations).forEach(([key, config]) => {
    if (!operations[key]) return
    operations[key].active = config.active ?? true
    if (config.firstRange) operations[key].firstRange = config.firstRange
    if (config.secondRange) operations[key].secondRange = config.secondRange
  })
}

function startQuiz() {
  const activeCount = Object.values(operations).filter(op => op.active).length
  if (!activeCount) {
    setupError.value = 'Please select at least one operation to start training.'
    return
  }
  if (!quizTime.value || quizTime.value < 15) {
    setupError.value = 'Please set quiz length to at least 15 seconds.'
    return
  }

  setupError.value = ''
  logs.value = []
  currentStreak.value = 0
  isNewBest.value = false
  showResults.value = false
  quizRunning.value = true
  currentQuizTime.value = Math.round(quizTime.value)

  playStart()
  setNextQuestion()
  startQuizTimer()
}

function stopQuiz() {
  finishQuiz()
}

function finishQuiz() {
  playEnd()
  quizRunning.value = false
  showResults.value = true
  clearInterval(quizTimer.value)
  clearInterval(individualTimer.value)

  // Calculate stats & save
  const correct = currentCorrectCount.value
  const total = logs.value.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const qpm = quizTime.value > 0 ? (correct / quizTime.value) * 60 : 0

  const res = savePersonalBest(selectedDifficulty.value, {
    score: correct,
    qpm,
    accuracy
  })
  isNewBest.value = res.isNewBest
  personalBests.value = getPersonalBests()

  recordSessionLifetime(total, correct)
}

function playAgain() {
  startQuiz()
}

function changeSettings() {
  showResults.value = false
  quizRunning.value = false
  logs.value = []
  currentStreak.value = 0
  setupError.value = ''
}

function startQuizTimer() {
  clearInterval(quizTimer.value)
  quizTimer.value = window.setInterval(() => {
    currentQuizTime.value = Math.max(0, currentQuizTime.value - 1)
    if (currentQuizTime.value <= 0) {
      finishQuiz()
    }
  }, 1000)
}

function startIndividualTimer() {
  clearInterval(individualTimer.value)
  individualTime.value = 0
  individualTimer.value = window.setInterval(() => {
    individualTime.value += 1
  }, 1000)
}

function setNextQuestion() {
  const q = generateQuestion()
  if (!q) {
    finishQuiz()
    return
  }
  currentQuestion.key = q.key
  currentQuestion.prompt = q.prompt
  currentQuestion.operator = q.operator ?? ''
  currentQuestion.first = q.first ?? null
  currentQuestion.second = q.second ?? null
  currentQuestion.answer = q.answer
  startIndividualTimer()
}

function generateQuestion() {
  const activeKeys = Object.entries(operations)
    .filter(([, v]) => v.active)
    .map(([k]) => k)

  if (!activeKeys.length) return null

  const selectedKey = activeKeys[randomInt(0, activeKeys.length - 1)]
  const def = operationDefinitions[selectedKey]
  const state = operations[selectedKey]
  if (!def || !state) return null

  const gen = def.generate(state)
  return {
    ...gen,
    key: selectedKey
  }
}

function handleAnswerSubmitted({ userAnswer, correct }) {
  logs.value.unshift({
    prompt: currentQuestion.prompt,
    operatorLabel: currentOperationLabel.value,
    userAnswer,
    correctAnswer: formatAnswer(currentQuestion.answer),
    time: individualTime.value,
    correct
  })

  if (correct) {
    currentStreak.value += 1
    setNextQuestion()
  } else {
    currentStreak.value = 0
  }
}

function handleSkipQuestion() {
  logs.value.unshift({
    prompt: currentQuestion.prompt,
    operatorLabel: currentOperationLabel.value,
    userAnswer: 'Skipped',
    correctAnswer: formatAnswer(currentQuestion.answer),
    time: individualTime.value,
    correct: false
  })
  currentStreak.value = 0
  setNextQuestion()
}
</script>

<style scoped>
.page-main {
  flex: 1;
  width: 100%;
}
</style>
