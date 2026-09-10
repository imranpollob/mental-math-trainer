<template>
  <div class="settings-container">
    <!-- Hero Banner -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__badge">Adaptive Mental Arithmetic</div>
      <h1 id="hero-title" class="hero__title">Build Lightning-Fast Math Reflexes</h1>
      <p class="hero__subtitle">
        Master rapid arithmetic calculations through focused, interval-based drills designed for precision and speed.
      </p>
    </section>

    <!-- Difficulty Presets -->
    <section class="presets-section" aria-labelledby="presets-title">
      <div class="section-header">
        <h2 id="presets-title" class="section-title">Select Difficulty Level</h2>
        <span class="section-hint">Choose a preset or customize each operation</span>
      </div>

      <div class="preset-cards">
        <button
          v-for="preset in presetList"
          :key="preset.id"
          type="button"
          class="preset-card"
          :class="{ 'preset-card--active': selectedDifficulty === preset.id }"
          @click="selectPreset(preset.id)"
        >
          <div class="preset-card__top">
            <span class="preset-card__title">{{ preset.label }}</span>
            <span class="preset-card__badge">{{ preset.badge }}</span>
          </div>
          <p class="preset-card__desc">{{ preset.description }}</p>
          <div class="preset-card__footer">
            <span class="preset-card__time">⏱ {{ preset.time }}s</span>
            <span v-if="personalBests[preset.id]" class="preset-card__best">
              Best: {{ personalBests[preset.id].score }}
            </span>
          </div>
        </button>

        <!-- Custom Card -->
        <button
          type="button"
          class="preset-card preset-card--custom"
          :class="{ 'preset-card--active': selectedDifficulty === 'custom' }"
          @click="selectPreset('custom')"
        >
          <div class="preset-card__top">
            <span class="preset-card__title">Custom</span>
            <span class="preset-card__badge">Flexible</span>
          </div>
          <p class="preset-card__desc">Fine-tune individual operation ranges, number sizes, and session duration.</p>
          <div class="preset-card__footer">
            <span class="preset-card__time">⚙ Tailored</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Session Options -->
    <section class="config-section" aria-labelledby="config-title">
      <div class="section-header">
        <h2 id="config-title" class="section-title">Session Parameters</h2>
      </div>

      <div class="config-grid">
        <!-- Session Duration -->
        <div class="config-card">
          <label class="config-label" for="session-duration">Session Duration</label>
          <div class="duration-buttons">
            <button
              v-for="t in [30, 60, 90, 120, 180]"
              :key="t"
              type="button"
              class="duration-pill"
              :class="{ 'duration-pill--active': quizTime === t }"
              @click="setDuration(t)"
            >
              {{ t }}s
            </button>
            <div class="custom-time-input">
              <input
                id="session-duration"
                type="number"
                min="15"
                max="600"
                step="15"
                v-model.number="internalQuizTime"
                class="input-number"
                aria-label="Custom seconds"
              />
              <span class="input-unit">sec</span>
            </div>
          </div>
        </div>

        <!-- Instant Advance Option -->
        <div class="config-card config-card--toggle">
          <div>
            <span class="config-label">Instant Advance</span>
            <p class="config-subtext">Automatically advance to next question as soon as correct answer is typed.</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="internalAutoAdvance" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </section>

    <!-- Operations Configuration -->
    <section class="operations-section" aria-labelledby="ops-title">
      <div class="section-header">
        <div class="section-header__text">
          <h2 id="ops-title" class="section-title">Operations &amp; Ranges</h2>
          <span class="section-hint">Select the skills to drill in this session</span>
        </div>
        <div class="operations-summary">
          <span class="active-count">{{ activeOperationsCount }} active</span>
        </div>
      </div>

      <div class="operations-grid">
        <div
          v-for="([key, def]) in operationEntries"
          :key="key"
          class="op-card"
          :class="{ 'op-card--active': operations[key].active }"
        >
          <div class="op-card__header">
            <label class="op-card__toggle">
              <input
                type="checkbox"
                v-model="operations[key].active"
                @change="onOperationToggle"
              />
              <span class="op-symbol">{{ def.symbol }}</span>
              <span class="op-title">{{ def.label }}</span>
            </label>
            <span class="op-status-badge" :class="{ 'op-status-badge--active': operations[key].active }">
              {{ operations[key].active ? 'Active' : 'Off' }}
            </span>
          </div>

          <!-- Range controls when active -->
          <div v-if="operations[key].active" class="op-controls">
            <div
              v-for="control in def.rangeControls"
              :key="`${key}-${control.key}`"
              class="range-field"
            >
              <label class="range-label" :for="`${key}-${control.key}`">
                {{ control.label }}
              </label>
              <select
                :id="`${key}-${control.key}`"
                v-model="operations[key][control.key]"
                class="range-select"
                @change="onRangeChange"
              >
                <option
                  v-for="opt in getRangeOptions(control.type)"
                  :key="opt.id"
                  :value="opt.id"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Example of the operation for the selected option -->
            <div class="op-example">
              <span class="op-example__label">Example:</span>
              <span class="op-example__math">{{ getExampleForOperation(key) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Start Bar -->
    <div class="start-bar">
      <p v-if="errorMessage" class="error-text" role="alert">{{ errorMessage }}</p>
      <button
        type="button"
        class="start-btn"
        @click="onStart"
      >
        <span class="btn-text">Start Training</span>
        <span class="btn-subtext">Space or Enter</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  numberRangeOptions,
  percentRangeOptions,
  operationDefinitions,
  difficultyPresets
} from '../../utils/mathGenerators.js'

const props = defineProps({
  operations: { type: Object, required: true },
  selectedDifficulty: { type: String, required: true },
  quizTime: { type: Number, required: true },
  autoAdvance: { type: Boolean, required: true },
  personalBests: { type: Object, default: () => ({}) },
  errorMessage: { type: String, default: '' }
})

const emit = defineEmits([
  'update:selectedDifficulty',
  'update:quizTime',
  'update:autoAdvance',
  'select-preset',
  'start'
])

const internalQuizTime = computed({
  get: () => props.quizTime,
  set: (val) => {
    emit('update:quizTime', val)
    if (props.selectedDifficulty !== 'custom') {
      emit('update:selectedDifficulty', 'custom')
    }
  }
})

const internalAutoAdvance = computed({
  get: () => props.autoAdvance,
  set: (val) => emit('update:autoAdvance', val)
})

const presetList = Object.values(difficultyPresets)
const operationEntries = Object.entries(operationDefinitions)

const activeOperationsCount = computed(() => {
  return Object.values(props.operations).filter(op => op.active).length
})

function selectPreset(id) {
  emit('select-preset', id)
}

function setDuration(seconds) {
  emit('update:quizTime', seconds)
  if (props.selectedDifficulty !== 'custom') {
    emit('update:selectedDifficulty', 'custom')
  }
}

function onOperationToggle() {
  if (props.selectedDifficulty !== 'custom') {
    emit('update:selectedDifficulty', 'custom')
  }
}

function onRangeChange() {
  if (props.selectedDifficulty !== 'custom') {
    emit('update:selectedDifficulty', 'custom')
  }
}

function getRangeOptions(type) {
  return type === 'percent' ? percentRangeOptions : numberRangeOptions
}

function getExampleForOperation(key) {
  const state = props.operations[key]
  if (!state) return ''

  if (key === 'addition') {
    const a = state.firstRange === 'single' ? 7 : state.firstRange === 'double' ? 48 : state.firstRange === 'triple' ? 342 : 2450
    const b = state.secondRange === 'single' ? 6 : state.secondRange === 'double' ? 27 : state.secondRange === 'triple' ? 185 : 1230
    return `${a} + ${b} = ${a + b}`
  }
  if (key === 'subtraction') {
    const a = state.firstRange === 'single' ? 9 : state.firstRange === 'double' ? 84 : state.firstRange === 'triple' ? 465 : 3200
    const b = state.secondRange === 'single' ? 4 : state.secondRange === 'double' ? 29 : state.secondRange === 'triple' ? 182 : 1150
    return `${a} − ${b} = ${a - b}`
  }
  if (key === 'multiplication') {
    const a = state.firstRange === 'single' ? 8 : state.firstRange === 'double' ? 24 : state.firstRange === 'triple' ? 125 : 1200
    const b = state.secondRange === 'single' ? 7 : state.secondRange === 'double' ? 16 : state.secondRange === 'triple' ? 110 : 1050
    return `${a} × ${b} = ${a * b}`
  }
  if (key === 'division') {
    const q = state.firstRange === 'single' ? 8 : state.firstRange === 'double' ? 24 : state.firstRange === 'triple' ? 120 : 1100
    const d = state.secondRange === 'single' ? 6 : state.secondRange === 'double' ? 12 : state.secondRange === 'triple' ? 15 : 25
    return `${q * d} ÷ ${d} = ${q}`
  }
  if (key === 'percentage') {
    const p = state.firstRange === 'percent-basic' ? 15 : 35
    const base = state.secondRange === 'single' ? 8 : state.secondRange === 'double' ? 60 : state.secondRange === 'triple' ? 240 : 1200
    const raw = (p * base) / 100
    const ans = Number.isInteger(raw) ? raw : raw.toFixed(2)
    return `${p}% of ${base} = ${ans}`
  }
  if (key === 'square') {
    const v = state.firstRange === 'single' ? 8 : state.firstRange === 'double' ? 14 : state.firstRange === 'triple' ? 112 : 1020
    return `${v}² = ${v * v}`
  }
  if (key === 'squareRoot') {
    const r = state.firstRange === 'single' ? 9 : state.firstRange === 'double' ? 16 : state.firstRange === 'triple' ? 25 : 40
    return `√${r * r} = ${r}`
  }
  return ''
}

function onStart() {
  emit('start')
}
</script>

<style scoped>
.settings-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* Hero */
.hero {
  text-align: center;
  margin-bottom: 8px;
}

.hero__badge {
  display: inline-block;
  padding: 4px 14px;
  background: var(--brand-100);
  color: var(--brand-800);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
  margin-bottom: 12px;
}

:root[data-theme="dark"] .hero__badge {
  background: rgba(20, 184, 166, 0.15);
  color: var(--brand-300);
}

.hero__title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  color: var(--color-text);
  margin-bottom: 12px;
}

.hero__subtitle {
  max-width: 640px;
  margin: 0 auto;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.section-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Presets */
.preset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.preset-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.preset-card:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
  transform: translateY(-2px);
}

.preset-card--active {
  border-color: var(--color-primary);
  background: var(--brand-50);
  box-shadow: 0 0 0 2px var(--color-primary);
}

:root[data-theme="dark"] .preset-card--active {
  background: rgba(20, 184, 166, 0.12);
}

.preset-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preset-card__title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.preset-card__badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.preset-card__desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-snug);
  flex: 1;
}

.preset-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  margin-top: 4px;
}

.preset-card__best {
  color: var(--color-warning);
  font-weight: var(--font-weight-bold);
}

/* Config Grid */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.config-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-card--toggle {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.config-label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.config-subtext {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.duration-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.duration-pill {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text);
}

.duration-pill:hover {
  border-color: var(--color-primary);
}

.duration-pill--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.custom-time-input {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.input-number {
  width: 70px;
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  text-align: center;
}

.input-unit {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  transition: 0.2s ease;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s ease;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Operations */
.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.op-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.op-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.12);
}

.op-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.op-card__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.op-symbol {
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  color: var(--color-primary);
  width: 24px;
  text-align: center;
}

.op-title {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.op-status-badge {
  font-size: 0.68rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}

.op-status-badge--active {
  background: rgba(13, 148, 136, 0.15);
  color: var(--color-primary);
}

.op-example {
  margin-top: 6px;
  padding: 8px 12px;
  background: var(--color-background);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.op-example__label {
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-widest);
  color: var(--color-text-muted);
}

.op-example__math {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.op-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.range-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.range-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.range-select {
  padding: 6px 10px;
  font-size: var(--font-size-xs);
  min-width: 170px;
}

/* Start Bar */
.start-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.error-text {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.start-btn {
  background: linear-gradient(135deg, var(--brand-600), var(--brand-500));
  color: white;
  padding: 16px 48px;
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-lg), 0 0 20px rgba(13, 148, 136, 0.3);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.start-btn:hover {
  background: linear-gradient(135deg, var(--brand-700), var(--brand-600));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(13, 148, 136, 0.5);
}

.btn-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-wide);
}

.btn-subtext {
  font-size: var(--font-size-xs);
  opacity: 0.85;
  font-family: var(--font-mono);
}
</style>
