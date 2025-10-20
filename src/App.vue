<template>
  <main class="app-shell">
    <header>
      <h1>Photo Viewer Proof of Concept</h1>
      <p>
        A modular Vue 3 photo viewer showcasing accessibility, keyboard navigation, zoom, and
        fullscreen features.
      </p>
    </header>
    <DemoGallery />
  </main>
</template>

<script setup lang="ts">
import DemoGallery from './demo/DemoGallery.vue';
</script>

<style scoped>
.app-shell {
  margin: 0 auto;
  padding: 4rem 1.5rem;
  max-width: 1040px;
  text-align: center;
}

header {
  margin-bottom: 3rem;
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 1rem;
  color: #0f172a;
}

p {
  color: #475569;
  margin: 0;
}
</style>
