<template>
  <Teleport to="body">
    <div v-if="viewer.isOpen.value" class="pv-backdrop" @click="onBackdropClick">
      <div
        class="pv-dialog pv-dialog--immersive"
        :data-thumbs="thumbsPlacement"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        ref="dialogRef"
        @keydown="onKeydown"
      >
        <div class="pv-main">
          <header class="pv-header">
            <div class="pv-header-info">
              <h2 class="pv-counter" :id="titleId">
                {{ viewer.currentIndex.value + 1 }} / {{ images.length }}
              </h2>
              <p v-if="currentCaption" class="pv-caption">{{ currentCaption }}</p>
            </div>
            <div class="pv-header-actions">
              <PhotoControls
                :can-prev="viewer.canGoPrev.value"
                :can-next="viewer.canGoNext.value"
                :zoom-enabled="zoomEnabled"
                :show-navigation="false"
                @prev="viewer.prev"
                @next="viewer.next"
                @zoom-in="() => stageRef?.zoomIn()"
                @zoom-out="() => stageRef?.zoomOut()"
                @zoom-reset="() => stageRef?.resetZoom()"
              />
              <button type="button" class="pv-close-btn" @click="handleClose" aria-label="Close viewer">
                ✕
              </button>
            </div>
          </header>
          <div class="pv-stage-wrapper">
            <button
              type="button"
              class="pv-stage-nav pv-stage-nav--prev"
              :disabled="!viewer.canGoPrev.value"
              aria-label="Previous photo"
              @click="viewer.prev"
            >
              ‹
            </button>
            <PhotoStage
              ref="stageRef"
              :image="viewer.currentImage.value"
              :zoom-enabled="zoomEnabled"
              @loaded="handleImageLoaded"
              @error="handleImageError"
              @zoom-change="onZoomChange"
            />
            <Transition name="pv-loader-fade">
              <div v-if="isImageLoading" class="pv-stage-loader" role="status" aria-live="polite" aria-label="Loading image">
                <span class="pv-stage-loader__track">
                  <span class="pv-stage-loader__bar" />
                </span>
              </div>
            </Transition>
            <button
              type="button"
              class="pv-stage-nav pv-stage-nav--next"
              :disabled="!viewer.canGoNext.value"
              aria-label="Next photo"
              @click="viewer.next"
            >
              ›
            </button>
          </div>
          <PhotoThumbnails
            v-if="showThumbnails"
            :images="images"
            :current-index="viewer.currentIndex.value"
            :show="showThumbnails"
            :placement="thumbsPlacement"
            @select="viewer.goTo"
          />
        </div>
        <span tabindex="0" ref="focusStart" aria-hidden="true" />
        <span tabindex="0" ref="focusEnd" aria-hidden="true" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRefs, useId } from 'vue';
import PhotoControls from './PhotoControls.vue';
import PhotoStage from './PhotoStage.vue';
import PhotoThumbnails from './PhotoThumbnails.vue';
import { usePhotoViewer } from './usePhotoViewer';
import { usePhotoViewerController } from './usePhotoViewerController';
import type { ImageItem } from './types';
import { useDialogAccessibility } from './useDialogAccessibility';
import './styles.css';

const props = withDefaults(
  defineProps<{
    images: ImageItem[];
    modelValue?: boolean;
    startIndex?: number;
    loop?: boolean;
    showThumbnails?: boolean;
    keyboard?: boolean;
    zoomEnabled?: boolean;
    thumbsPlacement?: 'bottom' | 'left';
  }>(),
  {
    modelValue: false,
    startIndex: 0,
    loop: true,
    showThumbnails: true,
    keyboard: true,
    zoomEnabled: true,
    thumbsPlacement: 'bottom'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', open: boolean): void;
  (e: 'change', index: number): void;
  (e: 'close'): void;
  (e: 'imageLoad', index: number): void;
  (e: 'imageError', index: number, error: unknown): void;
}>();

const propRefs = toRefs(props);
const { images, loop, startIndex, modelValue } = propRefs;

const viewer = usePhotoViewer({
  images,
  loop,
  startIndex
});

const dialogRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<InstanceType<typeof PhotoStage> | null>(null);
const focusStart = ref<HTMLSpanElement | null>(null);
const focusEnd = ref<HTMLSpanElement | null>(null);
const titleId = useId();

const { isImageLoading, handleImageLoaded, handleImageError } =
  usePhotoViewerController({
    viewer,
    props: {
      images,
      loop,
      startIndex,
      modelValue
    },
    emit
  });

const { releaseFocus, unlockScroll } = useDialogAccessibility({
  isOpen: viewer.isOpen,
  dialogRef,
  focusStart,
  focusEnd,
  onOpened: () => {
    emit('update:modelValue', true);
  },
  onClosed: () => {
    emit('update:modelValue', false);
    isImageLoading.value = false;
    emit('close');
  }
});

function onZoomChange() {
  // placeholder hook for external consumers
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

function handleClose() {
  viewer.close();
}

onBeforeUnmount(() => {
  releaseFocus();
  unlockScroll();
});

function onKeydown(event: KeyboardEvent) {
  if (!props.keyboard) return;
  viewer.handleKeydown(event, {
    onZoomIn: () => stageRef.value?.zoomIn(),
    onZoomOut: () => stageRef.value?.zoomOut(),
    onResetZoom: () => stageRef.value?.resetZoom()
  });
}

const showThumbnails = computed(
  () => (props.showThumbnails ?? true) && images.value.length > 1
);
const zoomEnabled = computed(() => props.zoomEnabled ?? true);
const thumbsPlacement = computed(() => props.thumbsPlacement ?? 'bottom');
const currentImage = computed(() => viewer.currentImage.value ?? null);
const currentCaption = computed(() => {
  if (!images.value.length) return '';
  return currentImage.value?.alt || `Photo ${viewer.currentIndex.value + 1}`;
});

defineExpose({
  open: viewer.open,
  close: viewer.close,
  next: viewer.next,
  prev: viewer.prev,
  goTo: viewer.goTo
});
</script>
