import { reactive } from 'vue';
import type { ZoomState } from './types';

export type ZoomPanDimensions = {
  containerWidth: number;
  containerHeight: number;
  contentWidth: number;
  contentHeight: number;
};

export type ZoomPanOptions = {
  minScale?: number;
  maxScale?: number;
};

export type Point = {
  x: number;
  y: number;
};

const DEFAULT_MIN_SCALE = 1;
const DEFAULT_MAX_SCALE = 4;

/**
 * Provides imperative zoom and pan controls for the photo stage.
 */
export function useZoomPan(options: ZoomPanOptions = {}) {
  const minScale = options.minScale ?? DEFAULT_MIN_SCALE;
  const maxScale = options.maxScale ?? DEFAULT_MAX_SCALE;

  const state = reactive<ZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  let dimensions: ZoomPanDimensions | null = null;
  let panStart: (Point & { translateX: number; translateY: number }) | null = null;

  function setDimensions(next: ZoomPanDimensions) {
    dimensions = next;
    clampTranslate();
  }

  function clampTranslate() {
    if (!dimensions || state.scale <= 1) {
      state.translateX = 0;
      state.translateY = 0;
      return;
    }

    const scaledWidth = dimensions.contentWidth * state.scale;
    const scaledHeight = dimensions.contentHeight * state.scale;
    const maxTranslateX = Math.max(0, (scaledWidth - dimensions.containerWidth) / 2);
    const maxTranslateY = Math.max(0, (scaledHeight - dimensions.containerHeight) / 2);

    state.translateX = Math.min(maxTranslateX, Math.max(-maxTranslateX, state.translateX));
    state.translateY = Math.min(maxTranslateY, Math.max(-maxTranslateY, state.translateY));
  }

  function zoomTo(targetScale: number) {
    const clamped = Math.min(maxScale, Math.max(minScale, Number.isFinite(targetScale) ? targetScale : 1));
    state.scale = clamped;
    clampTranslate();
  }

  function zoomBy(delta: number) {
    zoomTo(state.scale + delta);
  }

  function resetZoom() {
    state.scale = 1;
    state.translateX = 0;
    state.translateY = 0;
  }

  function startPan(point: Point) {
    if (state.scale <= 1) return;
    panStart = { ...point, translateX: state.translateX, translateY: state.translateY };
  }

  function movePan(point: Point) {
    if (!panStart || !dimensions) return;
    const dx = point.x - panStart.x;
    const dy = point.y - panStart.y;
    state.translateX = panStart.translateX + dx;
    state.translateY = panStart.translateY + dy;
    clampTranslate();
  }

  function endPan() {
    panStart = null;
  }

  return {
    state,
    setDimensions,
    zoomTo,
    zoomBy,
    resetZoom,
    startPan,
    movePan,
    endPan
  } as const;
}
