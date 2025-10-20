import { ref, watch, watchEffect, type Ref } from 'vue';
import type { ImageItem } from './types';
import type { usePhotoViewer } from './usePhotoViewer';

export type PhotoViewerControllerProps = {
  modelValue: Ref<boolean | undefined>;
  startIndex: Ref<number>;
  images: Ref<ImageItem[]>;
  loop: Ref<boolean>;
};

export type PhotoViewerControllerEmit = {
  (event: 'update:modelValue', value: boolean): void;
  (event: 'change', index: number): void;
  (event: 'close'): void;
  (event: 'imageLoad', index: number): void;
  (event: 'imageError', index: number, error: unknown): void;
};

type UsePhotoViewerReturn = ReturnType<typeof usePhotoViewer>;

type UsePhotoViewerControllerOptions = {
  viewer: UsePhotoViewerReturn;
  props: PhotoViewerControllerProps;
  emit: PhotoViewerControllerEmit;
};

export function usePhotoViewerController({ viewer, props, emit }: UsePhotoViewerControllerOptions) {
  const isImageLoading = ref(false);

  watch(
    props.modelValue,
    (open) => {
      if (open) {
        viewer.open(props.startIndex.value);
      } else {
        viewer.close();
      }
    },
    { immediate: true }
  );

  watch(
    props.images,
    (next) => {
      viewer.setImages(next ?? []);
    },
    { immediate: true }
  );

  watch(
    props.loop,
    (next) => {
      viewer.loop.value = next ?? true;
    },
    { immediate: true }
  );

  watch(
    props.startIndex,
    (next) => {
      if (!viewer.isOpen.value) {
        viewer.goTo(next ?? 0);
      }
    },
    { immediate: true }
  );

  watch(viewer.currentIndex, (index) => {
    emit('change', index);
  });

  watchEffect(() => {
    const currentImage = viewer.currentImage.value;
    const isOpen = viewer.isOpen.value;

    if (!isOpen || !currentImage?.src) {
      isImageLoading.value = false;
      return;
    }

    isImageLoading.value = true;
  });

  function handleImageLoaded() {
    isImageLoading.value = false;
    emit('imageLoad', viewer.currentIndex.value);
  }

  function handleImageError(error: unknown) {
    isImageLoading.value = false;
    emit('imageError', viewer.currentIndex.value, error);
  }

  return {
    isImageLoading,
    handleImageLoaded,
    handleImageError
  } as const;
}
