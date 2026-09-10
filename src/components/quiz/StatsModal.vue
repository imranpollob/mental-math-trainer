<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="stats-title">
      <div class="modal-header">
        <div>
          <h2 id="stats-title" class="modal-title">Personal Records &amp; Stats</h2>
          <p class="modal-subtitle">Saved locally on this device • Zero tracking</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" aria-label="Close modal">
          ✕
        </button>
      </div>

      <!-- Streak & Overview Banner -->
      <div class="stats-overview">
        <div class="overview-item">
          <span class="overview-icon">🔥</span>
          <div class="overview-data">
            <span class="overview-value">{{ streak.currentStreak }} days</span>
            <span class="overview-label">Current Streak</span>
          </div>
        </div>

        <div class="overview-item">
          <span class="overview-icon">⚡</span>
          <div class="overview-data">
            <span class="overview-value">{{ lifetime.totalQuestions }}</span>
            <span class="overview-label">Total Answered</span>
          </div>
        </div>

        <div class="overview-item">
          <span class="overview-icon">🎯</span>
          <div class="overview-data">
            <span class="overview-value">{{ lifetimeAccuracy }}%</span>
            <span class="overview-label">Lifetime Accuracy</span>
          </div>
        </div>
      </div>

      <!-- Personal Bests Table -->
      <h3 class="section-title">Personal Bests by Difficulty</h3>
      <div class="records-grid">
        <div
          v-for="(preset, key) in difficulties"
          :key="key"
          class="record-item"
        >
          <div class="record-header">
            <span class="record-name">{{ preset.label }}</span>
            <span class="record-badge">{{ preset.time }}s</span>
          </div>
          <div class="record-stats">
            <div class="record-stat">
              <span class="stat-number">{{ bests[key]?.score ?? 0 }}</span>
              <span class="stat-tag">Best Score</span>
            </div>
            <div class="record-stat">
              <span class="stat-number">{{ bests[key]?.qpm ? bests[key].qpm.toFixed(1) : '—' }}</span>
              <span class="stat-tag">Top QPM</span>
            </div>
            <div class="record-stat">
              <span class="stat-number">{{ bests[key]?.accuracy !== undefined ? bests[key].accuracy + '%' : '—' }}</span>
              <span class="stat-tag">Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-primary" @click="$emit('close')">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { difficultyPresets } from '../../utils/mathGenerators.js'
import { getPersonalBests, getLifetimeStats, getStreakInfo } from '../../utils/storage.js'

defineEmits(['close'])

const difficulties = difficultyPresets
const bests = getPersonalBests()
const lifetime = getLifetimeStats()
const streak = getStreakInfo()

const lifetimeAccuracy = computed(() => {
  if (!lifetime.totalQuestions) return 0
  return Math.round((lifetime.totalCorrect / lifetime.totalQuestions) * 100)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 47, 46, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 580px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-title {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin-bottom: 4px;
}

.modal-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.close-btn {
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.overview-item {
  background: var(--brand-50);
  border: 1px solid var(--brand-200);
  border-radius: var(--radius);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

:root[data-theme="dark"] .overview-item {
  background: rgba(20, 184, 166, 0.08);
  border-color: rgba(20, 184, 166, 0.2);
}

.overview-icon {
  font-size: 1.5rem;
}

.overview-data {
  display: flex;
  flex-direction: column;
}

.overview-value {
  font-family: var(--font-mono);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.overview-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.section-title {
  font-size: var(--font-size-md);
  margin-bottom: 12px;
  color: var(--color-text);
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 520px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  .records-grid {
    grid-template-columns: 1fr;
  }
}

.record-item {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.record-badge {
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  background: var(--brand-100);
  color: var(--brand-800);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

:root[data-theme="dark"] .record-badge {
  background: var(--brand-900);
  color: var(--brand-300);
}

.record-stats {
  display: flex;
  justify-content: space-between;
}

.record-stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.stat-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 8px 20px;
  border-radius: var(--radius);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}
</style>
