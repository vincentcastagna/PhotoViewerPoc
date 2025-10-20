import { describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { usePhotoViewer } from '@/components/photoviewer/usePhotoViewer';
import type { ImageItem } from '@/components/photoviewer/types';

const images: ImageItem[] = [
  { src: 'a.jpg' },
  { src: 'b.jpg' },
  { src: 'c.jpg' }
];

describe('usePhotoViewer', () => {
  it('wraps indices when loop is enabled', () => {
    const scope = effectScope();
    scope.run(() => {
      const viewer = usePhotoViewer({ images, loop: true });
      viewer.open(images.length - 1);
      viewer.next();
      expect(viewer.currentIndex.value).toBe(0);
    });
    scope.stop();
  });

  it('clamps indices when loop is disabled', () => {
    const scope = effectScope();
    scope.run(() => {
      const viewer = usePhotoViewer({ images, loop: false });
      viewer.open(0);
      viewer.goTo(10);
      expect(viewer.currentIndex.value).toBe(images.length - 1);
    });
    scope.stop();
  });

  it('reacts to reactive options changes', async () => {
    const scope = effectScope();
    const imagesRef = ref(images.slice());
    const loopRef = ref(false);
    const startIndexRef = ref(1);
    let viewer: ReturnType<typeof usePhotoViewer> | null = null;

    scope.run(() => {
      viewer = usePhotoViewer({ images: imagesRef, loop: loopRef, startIndex: startIndexRef });
    });

    expect(viewer).not.toBeNull();
    expect(viewer!.currentIndex.value).toBe(1);

    loopRef.value = true;
    await nextTick();
    expect(viewer!.loop.value).toBe(true);

    startIndexRef.value = 2;
    await nextTick();
    expect(viewer!.currentIndex.value).toBe(2);

    viewer!.open();
    expect(viewer!.currentIndex.value).toBe(2);

    imagesRef.value = images.slice(0, 2);
    await nextTick();
    expect(viewer!.currentIndex.value).toBe(1);

    scope.stop();
  });
});
