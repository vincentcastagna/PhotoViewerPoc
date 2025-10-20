import { computed, ref, unref, watch, type MaybeRef } from 'vue';
import type { ImageItem } from './types';
import { usePreload } from './usePreload';

export type UsePhotoViewerOptions = {
  images: MaybeRef<ImageItem[]>;
  loop?: MaybeRef<boolean>;
  startIndex?: MaybeRef<number | undefined>;
};

export type KeyboardHandlers = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function usePhotoViewer(options: UsePhotoViewerOptions) {
  const { preloadAround } = usePreload();
  const imagesRef = ref<ImageItem[]>([]);
  const loop = ref(true);
  const isOpen = ref(false);
  const currentIndex = ref(0);

  const hasImages = computed(() => imagesRef.value.length > 0);
  const maxIndex = computed(() => (hasImages.value ? imagesRef.value.length - 1 : 0));

  function assignIndex(nextIndex: number) {
    if (!hasImages.value) {
      currentIndex.value = 0;
      return;
    }

    if (loop.value) {
      currentIndex.value = mod(nextIndex, imagesRef.value.length);
    } else {
      currentIndex.value = Math.min(maxIndex.value, Math.max(0, nextIndex));
    }

    preloadAround(currentIndex.value, imagesRef.value, 2);
  }

  function open(index = resolvedStartIndex.value) {
    assignIndex(index);
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function next() {
    if (!hasImages.value) return;
    if (!loop.value && currentIndex.value >= maxIndex.value) return;
    assignIndex(currentIndex.value + 1);
  }

  function prev() {
    if (!hasImages.value) return;
    if (!loop.value && currentIndex.value <= 0) return;
    assignIndex(currentIndex.value - 1);
  }

  function goTo(index: number) {
    assignIndex(index);
  }

  function applyImages(images: ImageItem[]) {
    imagesRef.value = images;
    if (!images.length) {
      currentIndex.value = 0;
      return;
    }

    if (!images[currentIndex.value]) {
      assignIndex(Math.min(currentIndex.value, images.length - 1));
    } else if (isOpen.value) {
      preloadAround(currentIndex.value, images, 2);
    }
  }

  function setImages(images: ImageItem[]) {
    applyImages(images);
  }

  function handleKeydown(event: KeyboardEvent, handlers: KeyboardHandlers = {}) {
    if (!isOpen.value) return;

    const key = event.key;
    switch (key) {
      case 'ArrowRight':
      case 'Right':
        event.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'Left':
        event.preventDefault();
        prev();
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case '+':
      case '=':
        if (handlers.onZoomIn) {
          event.preventDefault();
          handlers.onZoomIn();
        }
        break;
      case '-':
      case '_':
        if (handlers.onZoomOut) {
          event.preventDefault();
          handlers.onZoomOut();
        }
        break;
      case '0':
        if (handlers.onResetZoom) {
          event.preventDefault();
          handlers.onResetZoom();
        }
        break;
      default:
        break;
    }
  }

  const resolvedImages = computed(() => unref(options.images) ?? []);
  const resolvedLoop = computed(() => {
    if (options.loop === undefined) return true;
    const value = unref(options.loop);
    return value ?? true;
  });
  const resolvedStartIndex = computed(() => {
    if (options.startIndex === undefined) return 0;
    const value = unref(options.startIndex);
    return typeof value === 'number' ? value : 0;
  });

  watch(
    resolvedImages,
    (next) => {
      applyImages(next ?? []);
    },
    { immediate: true }
  );

  watch(
    resolvedLoop,
    (next) => {
      loop.value = next ?? true;
    },
    { immediate: true }
  );

  watch(
    resolvedStartIndex,
    (next) => {
      if (!isOpen.value) {
        assignIndex(next);
      }
    },
    { immediate: true }
  );

  const currentImage = computed(() => imagesRef.value[currentIndex.value]);
  const canGoPrev = computed(() => loop.value || currentIndex.value > 0);
  const canGoNext = computed(() => loop.value || currentIndex.value < maxIndex.value);

  return {
    isOpen,
    currentIndex,
    currentImage,
    canGoPrev,
    canGoNext,
    loop,
    open,
    close,
    next,
    prev,
    goTo,
    handleKeydown,
    setImages
  } as const;
}
