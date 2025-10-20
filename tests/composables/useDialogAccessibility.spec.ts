import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useDialogAccessibility } from '@/components/photoviewer/useDialogAccessibility';

describe('useDialogAccessibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not throw when initialized with modelValue=true without document', () => {
    vi.stubGlobal('window', undefined as unknown as Window & typeof globalThis);
    vi.stubGlobal('document', undefined as unknown as Document);

    expect(() =>
      useDialogAccessibility({
        isOpen: ref(true),
        dialogRef: ref(null),
        focusStart: ref(null),
        focusEnd: ref(null)
      })
    ).not.toThrow();
  });
});
