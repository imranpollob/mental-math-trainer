<template>
  <header class="navbar">
    <div class="navbar__container">
      <div class="navbar__brand">
        <img
          src="/logo.png"
          alt="Imran Pollob Logo"
          class="navbar__logo"
          width="38"
          height="35"
        />
        <div class="navbar__titles">
          <span class="navbar__app-name">Mental Math Trainer</span>
        </div>
      </div>

      <nav class="navbar__actions" aria-label="Quick Actions">
        <!-- Daily Streak Badge -->
        <button
          v-if="streakInfo.currentStreak > 0"
          type="button"
          class="navbar__streak-btn"
          @click="$emit('open-stats')"
          title="Daily Practice Streak"
          aria-label="View streak details"
        >
          <span class="streak-icon">🔥</span>
          <span class="streak-count">{{ streakInfo.currentStreak }}d</span>
        </button>

        <!-- Stats Modal Trigger -->
        <button
          type="button"
          class="navbar__btn"
          @click="$emit('open-stats')"
          title="Lifetime Stats & Personal Bests"
          aria-label="View statistics"
        >
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </button>

        <!-- Sound Toggle -->
        <button
          type="button"
          class="navbar__btn"
          @click="toggleSound"
          :title="isMuted ? 'Unmute sound effects' : 'Mute sound effects'"
          :aria-label="isMuted ? 'Unmute sound' : 'Mute sound'"
        >
          <svg v-if="!isMuted" class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="navbar__btn"
          @click="toggleTheme"
          :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          :aria-label="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <!-- Sun icon for dark mode (click to go light) -->
          <svg v-if="currentTheme === 'dark'" class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <!-- Moon icon for light mode (click to go dark) -->
          <svg v-else class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- GitHub Repo Link -->
        <a
          href="https://github.com/imranpollob/mental-math-trainer"
          target="_blank"
          rel="noopener noreferrer"
          class="navbar__btn navbar__github"
          title="View on GitHub"
          aria-label="GitHub repository"
        >
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>

        <!-- Tools launcher mount (launcher.js swaps this span for the waffle button) -->
        <span data-brand-launcher></span>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStoredTheme, setStoredTheme, getStreakInfo } from '../../utils/storage.js'
import { getMuted, setMuted } from '../../utils/audio.js'

defineEmits(['open-stats'])

const currentTheme = ref('dark')
const isMuted = ref(false)
const streakInfo = ref({ currentStreak: 0 })

onMounted(() => {
  currentTheme.value = getStoredTheme()
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  isMuted.value = getMuted()
  streakInfo.value = getStreakInfo()
})

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  setStoredTheme(currentTheme.value)
}

function toggleSound() {
  isMuted.value = !isMuted.value
  setMuted(isMuted.value)
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(13, 31, 28, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

:root[data-theme="light"] .navbar {
  background: rgba(248, 250, 252, 0.9);
}

.navbar__container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.navbar__logo {
  width: 38px;
  height: 35px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  filter: drop-shadow(0 2px 4px rgba(13, 148, 136, 0.25));
}

.navbar__titles {
  display: flex;
  flex-direction: column;
}

.navbar__brand-name {
  font-family: var(--font-family);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-widest);
  color: var(--color-primary);
}

.navbar__app-name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  line-height: 1.2;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar__streak-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-full);
  color: var(--color-warning);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.navbar__streak-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-1px);
}

.navbar__btn {
  width: 38px;
  height: 38px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.navbar__btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.navbar__github {
  color: var(--color-text-muted);
}

/* Tools launcher toggle: match .navbar__btn exactly. launcher.js swaps
   [data-brand-launcher] for a dynamic .bl-toggle (no scoped attr), so :deep()
   is required. Beats launcher.css (0,1,0) by specificity. */
.navbar__actions :deep(.bl-toggle) {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.navbar__actions :deep(.bl-toggle:hover),
.navbar__actions :deep(.bl-toggle[aria-expanded="true"]) {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.navbar__actions :deep(.bl-toggle svg) {
  width: 20px;
  height: 20px;
}

@media (max-width: 640px) {
  .navbar__container {
    padding: 10px 14px;
  }
  
  .navbar__brand-name {
    font-size: 0.65rem;
  }

  .navbar__app-name {
    font-size: 0.95rem;
  }

  .navbar__logo {
    width: 32px;
    height: 29px;
  }

  .navbar__btn {
    width: 34px;
    height: 34px;
  }

  .navbar__actions :deep(.bl-toggle) {
    width: 34px;
    height: 34px;
  }
}
</style>
