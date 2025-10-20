import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PhotoThumbnails from '@/components/photoviewer/PhotoThumbnails.vue';
import type { ImageItem } from '@/components/photoviewer/types';

const images: ImageItem[] = [
  { src: 'thumb-1.jpg', alt: 'One' },
  { src: 'thumb-2.jpg', alt: 'Two' }
];

describe('PhotoThumbnails', () => {
  it('emits select when clicking thumbnails', async () => {
    const wrapper = mount(PhotoThumbnails, {
      props: {
        images,
        currentIndex: 0,
        show: true,
        placement: 'bottom'
      }
    });

    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual([1]);
  });

  it('sets aria-selected on active thumbnail', () => {
    const wrapper = mount(PhotoThumbnails, {
      props: {
        images,
        currentIndex: 1,
        show: true,
        placement: 'bottom'
      }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[1].attributes('aria-selected')).toBe('true');
  });
});
