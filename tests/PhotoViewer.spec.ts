import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import PhotoViewer from '@/components/photoviewer/PhotoViewer.vue';
import type { ImageItem } from '@/components/photoviewer/types';

const images: ImageItem[] = [
  { src: 'one.jpg', alt: 'One' },
  { src: 'two.jpg', alt: 'Two' },
  { src: 'three.jpg', alt: 'Three' }
];

describe('PhotoViewer', () => {
  it('opens and closes with v-model and restores focus', async () => {
    const opener = document.createElement('button');
    opener.id = 'opener';
    document.body.appendChild(opener);
    opener.focus();

    const wrapper = mount(PhotoViewer, {
      attachTo: document.body,
      props: {
        images,
        modelValue: false
      },
      global: {
        stubs: { teleport: false }
      }
    });

    await wrapper.setProps({ modelValue: true });
    await nextTick();

    expect(document.querySelector('.pv-dialog')).toBeTruthy();

    await wrapper.setProps({ modelValue: false });
    await nextTick();

    expect(document.activeElement).toBe(opener);
    wrapper.unmount();
    opener.remove();
  });

  it('responds to arrow keys and emits change events', async () => {
    const wrapper = mount(PhotoViewer, {
      attachTo: document.body,
      props: {
        images,
        modelValue: false
      },
      global: {
        stubs: { teleport: false }
      }
    });

    await wrapper.setProps({ modelValue: true });
    await nextTick();
    const dialog = document.querySelector('.pv-dialog') as HTMLElement | null;
    expect(dialog).toBeTruthy();

    const prevent = vi.fn();
    const fireKey = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true });
      Object.defineProperty(event, 'preventDefault', {
        value: prevent,
        writable: true
      });
      dialog?.dispatchEvent(event);
    };

    fireKey('ArrowRight');
    await nextTick();
    fireKey('ArrowLeft');

    const changeEvents = wrapper.emitted('change') ?? [];
    expect(changeEvents.length).toBeGreaterThan(0);

    wrapper.unmount();
  });

  it('keeps a stable title id for accessibility', async () => {
    const wrapper = mount(PhotoViewer, {
      attachTo: document.body,
      props: {
        images,
        modelValue: false
      },
      global: {
        stubs: { teleport: false }
      }
    });

    await wrapper.setProps({ modelValue: true });
    await nextTick();

    const dialog = document.querySelector('.pv-dialog') as HTMLElement | null;
    expect(dialog).toBeTruthy();

    const labelTarget = dialog?.getAttribute('aria-labelledby');
    expect(labelTarget).toBeTruthy();

    const title = dialog?.querySelector('.pv-counter') as HTMLElement | null;
    expect(title).toBeTruthy();
    expect(title?.id).toBe(labelTarget);

    const initialId = title?.id;
    expect(initialId).toBeTruthy();

    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();

    const titleAfterRerender = dialog?.querySelector('.pv-counter') as HTMLElement | null;
    expect(titleAfterRerender?.id).toBe(initialId);

    wrapper.unmount();
  });
});
