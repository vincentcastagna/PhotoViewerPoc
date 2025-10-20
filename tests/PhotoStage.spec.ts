import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PhotoStage from '@/components/photoviewer/PhotoStage.vue';

const image = { src: 'stage.jpg', alt: 'Stage' };

describe('PhotoStage', () => {
  it('zooms and resets correctly', async () => {
    const wrapper = mount(PhotoStage, {
      attachTo: document.body,
      props: {
        image,
        zoomEnabled: true
      }
    });

    const img = wrapper.find('img');
    Object.defineProperty(img.element, 'naturalWidth', { value: 800, configurable: true });
    Object.defineProperty(img.element, 'naturalHeight', { value: 600, configurable: true });

    await img.trigger('load');

    wrapper.vm.zoomIn();
    expect(wrapper.vm.getScale()).toBeGreaterThan(1);

    wrapper.vm.resetZoom();
    expect(wrapper.vm.getScale()).toBe(1);

    wrapper.unmount();
  });

  it('pans when zoomed and handles wheel zoom', async () => {
    const wrapper = mount(PhotoStage, {
      attachTo: document.body,
      props: {
        image,
        zoomEnabled: true
      }
    });

    const img = wrapper.find('img');
    Object.defineProperty(img.element, 'naturalWidth', { value: 800, configurable: true });
    Object.defineProperty(img.element, 'naturalHeight', { value: 600, configurable: true });
    await img.trigger('load');

    wrapper.vm.zoomIn();

    await wrapper.trigger('pointerdown', { pointerId: 1, clientX: 100, clientY: 100 });
    await wrapper.trigger('pointermove', { pointerId: 1, clientX: 120, clientY: 120 });
    await wrapper.trigger('pointerup', { pointerId: 1, clientX: 120, clientY: 120 });

    const style = (img.element as HTMLImageElement).style.transform;
    expect(style.includes('translate3d')).toBe(true);

    const prevent = vi.fn();
    await wrapper.trigger('wheel', { deltaY: -100, preventDefault: prevent });
    expect(prevent).toHaveBeenCalled();

    wrapper.unmount();
  });
});
