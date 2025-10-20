import PhotoViewer from './PhotoViewer.vue';

export type { ImageItem, PhotoViewerProps, ZoomState } from './types';
export type { UsePhotoViewerOptions, KeyboardHandlers } from './usePhotoViewer';
export type {
  PhotoViewerControllerProps,
  PhotoViewerControllerEmit
} from './usePhotoViewerController';

export { usePhotoViewer } from './usePhotoViewer';
export { usePhotoViewerController } from './usePhotoViewerController';
export { useDialogAccessibility } from './useDialogAccessibility';
export { usePreload } from './usePreload';
export { useZoomPan } from './useZoomPan';

export { PhotoViewer };
export default PhotoViewer;
