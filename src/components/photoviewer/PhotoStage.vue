<template>
  <div
    ref="containerRef"
    class="pv-stage-container"
    @dblclick="onDoubleClick"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel="onWheel"
  >
    <div v-if="image?.placeholder" class="pv-stage-placeholder" :style="placeholderStyle" />
    <img
      v-if="image"
      ref="imageRef"
      :src="image.src"
      :alt="image.alt || 'Displayed photo'"
      loading="eager"
      decoding="async"
      :style="imageStyle"
      @load="onLoad"
      @error="onError"
      draggable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useZoomPan } from './useZoomPan';
import type { ImageItem } from './types';

const props = defineProps<{
  image?: ImageItem;
  zoomEnabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'loaded'): void;
  (e: 'error', error: unknown): void;
  (e: 'zoom-change', scale: number): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);
const zoomPan = useZoomPan();
const resizeObserver = ref<ResizeObserver | null>(null);

const imageStyle = computed(() => ({
  transform: `translate3d(${zoomPan.state.translateX}px, ${zoomPan.state.translateY}px, 0) scale(${zoomPan.state.scale})`,
  transition: zoomPan.state.scale === 1 ? 'transform 0.15s ease' : undefined,
  cursor: props.zoomEnabled && zoomPan.state.scale > 1 ? 'grab' : 'zoom-in',
  userSelect: 'none',
  touchAction: zoomPan.state.scale > 1 ? 'none' : 'auto',
  maxWidth: '100%',
  maxHeight: '100%'
}));

const placeholderStyle = computed(() => ({
  backgroundImage: props.image?.placeholder ? `url(${props.image.placeholder})` : undefined,
  backgroundSize: 'cover',
  filter: 'blur(32px)'
}));

function updateDimensions() {
  const container = containerRef.value;
  const img = imageRef.value;
  if (!container || !img) return;

  const rect = container.getBoundingClientRect();
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  if (!naturalWidth || !naturalHeight) return;

  const containerRatio = rect.width / rect.height;
  const imageRatio = naturalWidth / naturalHeight;
  let width = rect.width;
  let height = rect.height;

  if (imageRatio > containerRatio) {
    height = rect.width / imageRatio;
  } else {
    width = rect.height * imageRatio;
  }

  zoomPan.setDimensions({
    containerWidth: rect.width,
    containerHeight: rect.height,
    contentWidth: width,
    contentHeight: height
  });
}

function onLoad() {
  updateDimensions();
  emit('loaded');
}

function onError(event: Event) {
  emit('error', event);
}

function onDoubleClick() {
  if (!props.zoomEnabled) return;
  if (zoomPan.state.scale > 1) {
    zoomPan.resetZoom();
  } else {
    zoomPan.zoomTo(2);
  }
  emit('zoom-change', zoomPan.state.scale);
}

let activePointerId: number | null = null;

function onPointerDown(event: PointerEvent) {
  if (!props.zoomEnabled || zoomPan.state.scale <= 1) return;
  activePointerId = event.pointerId;
  (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  zoomPan.startPan({ x: event.clientX, y: event.clientY });
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;
  zoomPan.movePan({ x: event.clientX, y: event.clientY });
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;
  zoomPan.endPan();
  activePointerId = null;
  (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
}

function onWheel(event: WheelEvent) {
  if (!props.zoomEnabled) return;
  if (event.ctrlKey || Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.25 : 0.25;
    zoomPan.zoomBy(direction);
    emit('zoom-change', zoomPan.state.scale);
  }
}

watch(
  () => zoomPan.state.scale,
  (scale) => emit('zoom-change', scale)
);

watch(
  () => props.image?.src,
  () => {
    zoomPan.resetZoom();
    activePointerId = null;
  }
);

onMounted(() => {
  if (containerRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.value.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect();
});

defineExpose({
  zoomIn: () => {
    zoomPan.zoomBy(0.5);
  },
  zoomOut: () => {
    zoomPan.zoomBy(-0.5);
  },
  resetZoom: () => {
    zoomPan.resetZoom();
  },
  getScale: () => zoomPan.state.scale
});
</script>
