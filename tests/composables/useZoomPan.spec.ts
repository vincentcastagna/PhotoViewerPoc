import { describe, expect, it } from 'vitest';
import { useZoomPan } from '@/components/photoviewer/useZoomPan';

describe('useZoomPan', () => {
  it('clamps translation inside bounds', () => {
    const zoomPan = useZoomPan();
    zoomPan.setDimensions({
      containerWidth: 400,
      containerHeight: 300,
      contentWidth: 400,
      contentHeight: 300
    });

    zoomPan.zoomTo(3);
    zoomPan.startPan({ x: 0, y: 0 });
    zoomPan.movePan({ x: 200, y: 150 });
    zoomPan.endPan();

    const maxX = (400 * zoomPan.state.scale - 400) / 2;
    const maxY = (300 * zoomPan.state.scale - 300) / 2;

    expect(Math.abs(zoomPan.state.translateX)).toBeLessThanOrEqual(maxX + 0.5);
    expect(Math.abs(zoomPan.state.translateY)).toBeLessThanOrEqual(maxY + 0.5);

    zoomPan.resetZoom();
    expect(zoomPan.state.translateX).toBe(0);
    expect(zoomPan.state.translateY).toBe(0);
  });
});
