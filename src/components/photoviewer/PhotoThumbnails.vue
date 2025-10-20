<template>
  <div
    v-if="show && images.length"
    class="pv-thumbnail-rail"
    role="listbox"
    :data-placement="placement"
    aria-label="Photo thumbnails"
    @keydown="onKeydown"
  >
    <div
      class="pv-thumbnail-window"
      :style="windowStyle"
      :data-at-start="isAtStart"
      :data-at-end="isAtEnd"
    >
      <div class="pv-thumbnail-track" :style="trackStyle">
        <button
          v-for="thumb in thumbnails"
          :key="`${thumb.index}-${thumb.image.src}`"
          class="pv-thumbnail"
          role="option"
          :aria-selected="thumb.index === currentIndex"
          :aria-hidden="thumb.visible ? 'false' : 'true'"
          :tabindex="thumb.visible ? 0 : -1"
          type="button"
          @click="emit('select', thumb.index)"
          :ref="(el) => setItemRef(el, thumb.index)"
          :data-visible="thumb.visible"
        >
          <img
            :src="thumb.image.src"
            :alt="thumb.image.alt || `Thumbnail ${thumb.index + 1}`"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ImageItem } from './types';

const props = defineProps<{
  images: ImageItem[];
  currentIndex: number;
  show: boolean;
  placement: 'bottom' | 'left';
}>();

const emit = defineEmits<{ (e: 'select', index: number): void }>();

const MAX_VISIBLE_THUMBS = 6;

const total = computed(() => props.images.length);
const limit = computed(() => (props.placement === 'left' ? total.value : MAX_VISIBLE_THUMBS));
const visibleCount = computed(() => Math.min(limit.value, total.value));

const halfWindow = computed(() => Math.floor(Math.max(visibleCount.value - 1, 0) / 2));

const windowStart = computed(() => {
  if (visibleCount.value === 0 || visibleCount.value >= total.value) {
    return 0;
  }

  let start = props.currentIndex - halfWindow.value;
  const maxStart = total.value - visibleCount.value;

  if (start < 0) {
    start = 0;
  } else if (start > maxStart) {
    start = maxStart;
  }

  return start;
});

const visibleIndices = computed(() =>
  Array.from({ length: visibleCount.value }, (_, offset) => windowStart.value + offset)
);

const visibleSet = computed(() => new Set(visibleIndices.value));

const thumbnails = computed(() =>
  props.images.map((image, index) => ({
    image,
    index,
    visible: visibleSet.value.has(index)
  }))
);

const itemRefs = ref<Record<number, HTMLElement>>({});

watch(
  () => props.images,
  () => {
    itemRefs.value = {};
  }
);

const windowStyle = computed(() => ({
  '--pv-visible-count': visibleCount.value.toString(),
  '--pv-visible-gap': Math.max(visibleCount.value - 1, 0).toString()
}));

const trackStyle = computed(() => ({
  '--pv-thumb-offset': props.placement === 'bottom' ? windowStart.value.toString() : '0'
}));

const isAtStart = computed(() => windowStart.value === 0);
const isAtEnd = computed(
  () => windowStart.value + visibleCount.value >= total.value || visibleCount.value === 0
);

function setItemRef(el: HTMLElement | null, index: number) {
  if (!el) {
    delete itemRefs.value[index];
    return;
  }
  itemRefs.value[index] = el;
}

function onKeydown(event: KeyboardEvent) {
  const key = event.key;
  const indices = visibleIndices.value;
  if (!indices.length) {
    return;
  }

  const currentVisibleIndex = Math.max(0, indices.indexOf(props.currentIndex));

  if (key === 'Enter' || key === ' ') {
    event.preventDefault();
    const current = indices[currentVisibleIndex] ?? indices[0];
    if (typeof current === 'number') {
      emit('select', current);
    }
    return;
  }

  let nextVisibleIndex = currentVisibleIndex;

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    nextVisibleIndex = Math.min(indices.length - 1, currentVisibleIndex + 1);
  } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
    nextVisibleIndex = Math.max(0, currentVisibleIndex - 1);
  } else if (key === 'Home') {
    nextVisibleIndex = 0;
  } else if (key === 'End') {
    nextVisibleIndex = indices.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  const targetIndex = indices[nextVisibleIndex];
  const el = itemRefs.value[targetIndex];
  el?.focus({ preventScroll: true });

  if (typeof targetIndex === 'number' && targetIndex !== props.currentIndex) {
    emit('select', targetIndex);
  }
}
</script>
