import { describe, expect, it } from 'vitest';
import PhotoViewerDefault, {
  PhotoViewer,
  useDialogAccessibility,
  usePhotoViewer,
  usePhotoViewerController,
  usePreload,
  useZoomPan
} from '../src';
import SubpathDefault, { usePhotoViewer as subpathUsePhotoViewer } from '../src/components/photoviewer';

import type { ImageItem, PhotoViewerProps } from '../src';

describe('library entry point exports', () => {
  it('exposes the component as both default and named exports', () => {
    expect(PhotoViewerDefault).toBeDefined();
    expect(PhotoViewer).toBeDefined();
    expect(PhotoViewerDefault).toBe(PhotoViewer);
  });

  it('mirrors the component export on the subpath', () => {
    expect(SubpathDefault).toBe(PhotoViewer);
  });

  it('provides the documented composables', () => {
    expect(typeof usePhotoViewer).toBe('function');
    expect(typeof usePhotoViewerController).toBe('function');
    expect(typeof useDialogAccessibility).toBe('function');
    expect(typeof usePreload).toBe('function');
    expect(typeof useZoomPan).toBe('function');
    expect(subpathUsePhotoViewer).toBe(usePhotoViewer);
  });

  it('exports the documented TypeScript helpers', () => {
    const props: PhotoViewerProps = {
      images: [{ src: 'pikachu.png' }],
      modelValue: true
    };

    const image: ImageItem = props.images[0];

    expect(image.src).toBe('pikachu.png');
  });
});
