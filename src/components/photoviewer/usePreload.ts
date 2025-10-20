import type { ImageItem } from './types';

/**
 * Preloads images around the active index using the browser cache.
 */
export function usePreload() {
  const cache = new Set<string>();

  function preload(src: string | undefined) {
    if (!src || cache.has(src)) return;
    if (typeof Image === 'undefined') return;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    cache.add(src);
  }

  function preloadAround(index: number, images: ImageItem[], radius = 1) {
    for (let offset = 1; offset <= radius; offset += 1) {
      preload(images[index + offset]?.src);
      preload(images[index - offset]?.src);
    }
  }

  return {
    preload,
    preloadAround
  } as const;
}
