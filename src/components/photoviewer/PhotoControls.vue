<template>
  <div class="pv-controls">
    <div
      v-if="showNavigation"
      class="pv-controls-nav"
      role="group"
      aria-label="Photo navigation"
    >
      <button
        type="button"
        @click="$emit('prev')"
        :disabled="!canPrev"
        aria-label="Previous photo"
      >
        ‹
      </button>
      <button
        type="button"
        @click="$emit('next')"
        :disabled="!canNext"
        aria-label="Next photo"
      >
        ›
      </button>
    </div>
    <div class="pv-controls-tools" role="group" aria-label="Viewer actions">
      <button
        v-if="zoomEnabled"
        type="button"
        @click="$emit('zoom-out')"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        v-if="zoomEnabled"
        type="button"
        @click="$emit('zoom-in')"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        v-if="zoomEnabled"
        type="button"
        @click="$emit('zoom-reset')"
        aria-label="Reset zoom"
      >
        1×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

const props = withDefaults(
  defineProps<{
    canPrev: boolean;
    canNext: boolean;
    zoomEnabled: boolean;
    showNavigation?: boolean;
  }>(),
  {
    showNavigation: true
  }
);

defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
  (e: 'zoom-in'): void;
  (e: 'zoom-out'): void;
  (e: 'zoom-reset'): void;
}>();

const { canPrev, canNext, zoomEnabled, showNavigation } = toRefs(props);
</script>

<style scoped>
.pv-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pv-controls-nav,
.pv-controls-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
