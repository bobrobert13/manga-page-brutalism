/**
 * Traps keyboard focus within a container element while active.
 */
import { onUnmounted, watch, type Ref } from 'vue';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, isActive: Ref<boolean>): void {
  let previousFocus: HTMLElement | null = null;

  function getFocusable(): HTMLElement[] {
    if (!containerRef.value) return [];
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
  }

  function trap(e: KeyboardEvent) {
    if (!isActive.value || e.key !== 'Tab') return;
    const els = getFocusable();
    if (els.length === 0) return;

    const first = els[0];
    const last = els[els.length - 1];
    const focused = document.activeElement;

    if (e.shiftKey) {
      if (focused === first || !containerRef.value?.contains(focused)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (focused === last || !containerRef.value?.contains(focused)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  watch(isActive, (active) => {
    if (active) {
      previousFocus = document.activeElement as HTMLElement;
      setTimeout(() => {
        const els = getFocusable();
        els[0]?.focus();
      }, 50);
      document.addEventListener('keydown', trap);
    } else {
      document.removeEventListener('keydown', trap);
      previousFocus?.focus();
      previousFocus = null;
    }
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', trap);
    previousFocus?.focus();
  });
}
