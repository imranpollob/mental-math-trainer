<template>
  <div class="app-layout">
    <AppNavbar @open-stats="openStatsModal" />
    <router-view />
    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'

function openStatsModal() {
  window.dispatchEvent(new CustomEvent('open-stats-modal'))
}
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

