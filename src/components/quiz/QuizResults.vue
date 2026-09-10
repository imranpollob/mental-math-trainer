<template>
  <div class="results-container">
    <div class="results-card">
      <!-- Header -->
      <div class="results-header">
        <div v-if="isNewBest" class="new-record-pill">
          🎉 New Personal Record!
        </div>
        <h2 class="results-title">Session Complete</h2>
        <p class="results-subtitle">
          {{ difficultyLabel }} Mode • {{ sessionDuration }} seconds
        </p>
      </div>

      <!-- Core Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-box">
          <span class="metric-label">Total Score</span>
          <span class="metric-val metric-val--primary">{{ correctCount }}</span>
          <span class="metric-sub">correct answers</span>
        </div>

        <div class="metric-box">
          <span class="metric-label">Pace (Speed)</span>
          <span class="metric-val">{{ qpm.toFixed(1) }}</span>
          <span class="metric-sub">questions / min</span>
        </div>

        <div class="metric-box">
          <span class="metric-label">Accuracy</span>
          <span class="metric-val" :class="accuracyColorClass">{{ accuracyPercent }}%</span>
          <span class="metric-sub">{{ correctCount }} of {{ totalAttempted }}</span>
        </div>

        <div class="metric-box">
          <span class="metric-label">Avg Time</span>
          <span class="metric-val">{{ avgTime.toFixed(1) }}s</span>
          <span class="metric-sub">per question</span>
        </div>
      </div>

      <!-- Operation Performance Breakdown -->
      <div v-if="operationStats.length" class="breakdown-section">
        <h3 class="breakdown-title">Performance by Operation</h3>
        <div class="breakdown-list">
          <div
            v-for="item in operationStats"
            :key="item.name"
            class="breakdown-item"
          >
            <div class="breakdown-header">
              <span class="breakdown-name">{{ item.name }}</span>
              <span class="breakdown-score">
                {{ item.correct }}/{{ item.total }} ({{ item.percent }}%)
              </span>
            </div>
            <div class="breakdown-bar-track">
              <div
                class="breakdown-bar-fill"
                :style="{ width: `${item.percent}%` }"
                :class="item.percent >= 80 ? 'fill--high' : item.percent >= 50 ? 'fill--mid' : 'fill--low'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-row">
        <button type="button" class="btn-play-again" @click="$emit('play-again')">
          <span>Play Again</span>
          <span class="btn-hint">Enter</span>
        </button>

        <button type="button" class="btn-secondary" @click="$emit('change-settings')">
          Change Settings
        </button>

        <button type="button" class="btn-secondary" @click="copyShareCard">
          <span>{{ copied ? '✓ Copied to Clipboard!' : 'Share Results' }}</span>
        </button>
      </div>

      <!-- Detailed Question Log -->
      <div class="log-section">
        <div class="log-header">
          <h3 class="log-title">Question Log ({{ logs.length }})</h3>
          <span class="log-hint">Detailed breakdown of each question</span>
        </div>

        <div v-if="logs.length" class="table-wrap">
          <table class="log-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Prompt</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, idx) in logs"
                :key="idx"
                :class="{ 'row--wrong': !log.correct }"
              >
                <td class="col-num">{{ logs.length - idx }}</td>
                <td class="col-prompt">{{ log.prompt }}</td>
                <td class="col-user">{{ log.userAnswer }}</td>
                <td class="col-ans">{{ log.correctAnswer }}</td>
                <td class="col-time">{{ log.time }}s</td>
                <td class="col-result">
                  <span :class="log.correct ? 'badge--correct' : 'badge--wrong'">
                    {{ log.correct ? '✓' : '✕' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-text">No questions attempted during this drill.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { playComplete } from '../../utils/audio.js'

const props = defineProps({
  logs: { type: Array, required: true },
  sessionDuration: { type: Number, required: true },
  difficultyLabel: { type: String, default: 'Custom' },
  isNewBest: { type: Boolean, default: false }
})

defineEmits(['play-again', 'change-settings'])

const copied = ref(false)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if (e.code === 'Enter') {
    e.preventDefault()
  }
}

const totalAttempted = computed(() => props.logs.length)

const correctCount = computed(() => {
  return props.logs.filter(l => l.correct).length
})

const accuracyPercent = computed(() => {
  if (!totalAttempted.value) return 0
  return Math.round((correctCount.value / totalAttempted.value) * 100)
})

const accuracyColorClass = computed(() => {
  if (accuracyPercent.value >= 90) return 'text--success'
  if (accuracyPercent.value >= 70) return 'text--warning'
  return 'text--error'
})

const qpm = computed(() => {
  if (props.sessionDuration <= 0) return 0
  return (correctCount.value / props.sessionDuration) * 60
})

const avgTime = computed(() => {
  if (!totalAttempted.value) return 0
  const totalSeconds = props.logs.reduce((sum, l) => sum + (l.time || 0), 0)
  return totalSeconds / totalAttempted.value
})

const operationStats = computed(() => {
  const map = {}
  props.logs.forEach(l => {
    const key = l.operatorLabel || 'General'
    if (!map[key]) {
      map[key] = { name: key, correct: 0, total: 0 }
    }
    map[key].total += 1
    if (l.correct) map[key].correct += 1
  })

  return Object.values(map).map(item => ({
    ...item,
    percent: Math.round((item.correct / item.total) * 100)
  }))
})

async function copyShareCard() {
  const text = [
    '🧠 Mental Math Trainer — Imran Pollob',
    `⚡ ${props.difficultyLabel} Mode (${props.sessionDuration}s)`,
    `🎯 Score: ${correctCount.value} correct (${accuracyPercent.value}% accuracy)`,
    `⏱ Pace: ${qpm.value.toFixed(1)} QPM (avg ${avgTime.value.toFixed(1)}s/question)`,
    '👉 https://imranpollob.github.io/mental-math-trainer/'
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (e) {
    // Fallback
  }
}
</script>

<style scoped>
.results-container {
  max-width: 860px;
  margin: 32px auto 80px;
  padding: 0 16px;
}

.results-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 36px 28px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header */
.results-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.new-record-pill {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  animation: pulseGlow 1.2s infinite;
}

.results-title {
  font-size: var(--font-size-2xl);
  color: var(--color-text);
}

.results-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.metric-box {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.metric-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-widest);
  color: var(--color-text-muted);
}

.metric-val {
  font-family: var(--font-mono);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.metric-val--primary {
  color: var(--color-primary);
}

.metric-sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.text--success { color: var(--color-success); }
.text--warning { color: var(--color-warning); }
.text--error { color: var(--color-error); }

/* Breakdown */
.breakdown-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-title {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.breakdown-bar-track {
  height: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.breakdown-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
}

.fill--high { background: var(--color-success); }
.fill--mid { background: var(--color-warning); }
.fill--low { background: var(--color-error); }

/* Actions */
.actions-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-play-again {
  background: var(--color-primary);
  color: white;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-md);
}

.btn-play-again:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-hint {
  font-size: 0.65rem;
  opacity: 0.8;
  font-family: var(--font-mono);
}

.btn-secondary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Log Table */
.log-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.log-title {
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.log-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-xs);
  text-align: left;
}

.log-table th,
.log-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
}

.log-table th {
  background: var(--color-background);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
}

.col-prompt {
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.col-user,
.col-ans,
.col-time {
  font-family: var(--font-mono);
}

.badge--correct {
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

.badge--wrong {
  color: var(--color-error);
  font-weight: var(--font-weight-bold);
}

.row--wrong {
  background: rgba(220, 38, 38, 0.04);
}

.empty-text {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: 24px;
}
</style>
