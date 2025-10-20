import { nextTick, watch, type Ref } from 'vue';

type DialogAccessibilityOptions = {
  isOpen: Ref<boolean>;
  dialogRef: Ref<HTMLElement | null>;
  focusStart: Ref<HTMLElement | null>;
  focusEnd: Ref<HTMLElement | null>;
  onOpened?: () => void;
  onClosed?: () => void;
};

export function useDialogAccessibility({
  isOpen,
  dialogRef,
  focusStart,
  focusEnd,
  onOpened,
  onClosed
}: DialogAccessibilityOptions) {
  // The composable can be evaluated during SSR where `window`/`document` are not
  // defined; in that case we must skip the DOM side effects that follow.
  const hasDOM =
    typeof window !== 'undefined' && typeof document !== 'undefined';

  let removeFocusTrap: (() => void) | null = null;
  let previouslyFocused: HTMLElement | null = null;
  let previousBodyOverflow: string | null = null;

  function trapFocus() {
    if (!hasDOM) return;
    if (removeFocusTrap) return;

    const dialog = dialogRef.value;
    if (!dialog) return;

    const focusListener = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) {
        event.stopPropagation();
        dialog.focus();
      }
    };

    const handleStart = () => dialog.focus();
    const handleEnd = () => dialog.focus();

    document.addEventListener('focusin', focusListener);
    focusStart.value?.addEventListener('focus', handleStart);
    focusEnd.value?.addEventListener('focus', handleEnd);

    removeFocusTrap = () => {
      document.removeEventListener('focusin', focusListener);
      focusStart.value?.removeEventListener('focus', handleStart);
      focusEnd.value?.removeEventListener('focus', handleEnd);
      removeFocusTrap = null;
    };
  }

  function releaseFocus() {
    removeFocusTrap?.();
  }

  function lockScroll() {
    if (!hasDOM) return;
    if (previousBodyOverflow !== null) return;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    if (!hasDOM) return;
    if (previousBodyOverflow === null) return;

    if (previousBodyOverflow) {
      document.body.style.overflow = previousBodyOverflow;
    } else {
      document.body.style.removeProperty('overflow');
    }

    previousBodyOverflow = null;
  }

  if (hasDOM) {
    // All logic inside this watcher touches the DOM (focus management and
    // scroll locking). Guarding the watcher keeps SSR evaluation safe while
    // preserving the browser behavior unchanged.
    watch(isOpen, async (open) => {
      if (open) {
        previouslyFocused = document.activeElement as HTMLElement;
        await nextTick();
        dialogRef.value?.focus();
        trapFocus();
        lockScroll();
        onOpened?.();
      } else {
        releaseFocus();
        previouslyFocused?.focus({ preventScroll: true });
        previouslyFocused = null;
        unlockScroll();
        onClosed?.();
      }
    });
  }

  return {
    trapFocus,
    releaseFocus,
    lockScroll,
    unlockScroll
  };
}
