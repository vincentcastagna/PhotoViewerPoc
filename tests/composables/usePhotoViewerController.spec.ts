import { describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { usePhotoViewer } from '@/components/photoviewer/usePhotoViewer';
import { usePhotoViewerController } from '@/components/photoviewer/usePhotoViewerController';
import type { ImageItem } from '@/components/photoviewer/types';
import type {
  PhotoViewerControllerEmit,
  PhotoViewerControllerProps
} from '@/components/photoviewer/usePhotoViewerController';

const images: ImageItem[] = [
  { src: 'one.jpg', alt: 'One' },
  { src: 'two.jpg', alt: 'Two' },
  { src: 'three.jpg', alt: 'Three' }
];

describe('usePhotoViewerController', () => {
  it('synchronizes viewer state with reactive props and emits events', async () => {
    const scope = effectScope();
    let props!: PhotoViewerControllerProps;
    let emit!: PhotoViewerControllerEmit;
    let emitSpy!: ReturnType<typeof vi.fn>;
    let viewer!: ReturnType<typeof usePhotoViewer>;
    let isImageLoading!: ReturnType<
      typeof usePhotoViewerController
    >['isImageLoading'];
    let handleImageLoaded!: ReturnType<
      typeof usePhotoViewerController
    >['handleImageLoaded'];
    let handleImageError!: ReturnType<
      typeof usePhotoViewerController
    >['handleImageError'];

    scope.run(() => {
      props = {
        modelValue: ref(false),
        startIndex: ref(1),
        images: ref(images.slice()),
        loop: ref(false)
      };
      emitSpy = vi.fn();
      emit = emitSpy as unknown as PhotoViewerControllerEmit;

      viewer = usePhotoViewer({
        images: props.images,
        loop: props.loop,
        startIndex: props.startIndex
      });

      const controller = usePhotoViewerController({
        viewer,
        props,
        emit
      });

      isImageLoading = controller.isImageLoading;
      handleImageLoaded = controller.handleImageLoaded;
      handleImageError = controller.handleImageError;
    });

    emitSpy.mockReset();

    props.modelValue.value = true;
    await nextTick();

    expect(viewer.isOpen.value).toBe(true);
    expect(viewer.currentIndex.value).toBe(1);
    expect(isImageLoading.value).toBe(true);

    handleImageLoaded();
    expect(isImageLoading.value).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('imageLoad', 1);

    viewer.next();
    await nextTick();
    expect(isImageLoading.value).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('change', 2);

    handleImageError('fail');
    expect(isImageLoading.value).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('imageError', 2, 'fail');

    props.loop.value = true;
    await nextTick();
    expect(viewer.loop.value).toBe(true);

    props.images.value = props.images.value.slice(0, 2);
    await nextTick();
    expect(viewer.currentIndex.value).toBe(1);

    props.modelValue.value = false;
    await nextTick();
    expect(viewer.isOpen.value).toBe(false);
    expect(isImageLoading.value).toBe(false);

    scope.stop();
  });
});
