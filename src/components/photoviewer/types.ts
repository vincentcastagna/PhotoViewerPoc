export type ImageItem = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  placeholder?: string;
};

export type PhotoViewerProps = {
  images: ImageItem[];
  modelValue?: boolean;
  startIndex?: number;
  loop?: boolean;
  showThumbnails?: boolean;
  keyboard?: boolean;
  zoomEnabled?: boolean;
  fullscreenEnabled?: boolean;
  thumbsPlacement?: 'bottom' | 'left';
};

export type ZoomState = {
  scale: number;
  translateX: number;
  translateY: number;
};
