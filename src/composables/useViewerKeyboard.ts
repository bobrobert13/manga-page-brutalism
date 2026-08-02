/**
 * Keyboard shortcuts for the manga viewer.
 * Attaches/detaches a global keydown listener.
 */
import { onMounted, onUnmounted } from 'vue';
import type { ViewerState } from './useViewerState';

export function useViewerKeyboard(state: ViewerState): void {
  let _enabled = true;

  function handler(e: KeyboardEvent) {
    if (!_enabled) return;

    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (state.mode.value === 'page') {
          if (state.goNext()) state.showFeedback(`Pg ${state.currentIndex.value + 1}/${state.totalPages.value}`);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (state.mode.value === 'page') {
          if (state.goPrev()) state.showFeedback(`Pg ${state.currentIndex.value + 1}/${state.totalPages.value}`);
        }
        break;
      case 'Home':
        e.preventDefault();
        if (state.mode.value === 'page') {
          state.goToPage(0);
          state.showFeedback(`Pg 1/${state.totalPages.value}`);
        }
        break;
      case 'End':
        e.preventDefault();
        if (state.mode.value === 'page') {
          state.goToPage(state.totalPages.value - 1);
          state.showFeedback(`Pg ${state.totalPages.value}/${state.totalPages.value}`);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (state.isOnboardingVisible.value) {
          state.dismissOnboarding();
        } else if (state.isFullscreen.value) {
          state.toggleFullscreen();
        } else {
          history.back();
        }
        break;
      case '?':
        e.preventDefault();
        state.isOnboardingVisible.value = true;
        break;
      case 'f':
        e.preventDefault();
        state.toggleFullscreen();
        state.showFeedback(state.isFullscreen.value ? 'Pantalla completa' : 'Pantalla normal');
        break;
      case 't':
        e.preventDefault();
        state.toggleTheme();
        state.showFeedback('Tema ' + (state.isDark.value ? 'oscuro' : 'claro'));
        break;
      case 'z':
        e.preventDefault();
        state.toggleZoom();
        state.showFeedback(state.isZoomed.value ? 'Zoom 2×' : 'Zoom 1×');
        break;
      case '[':
        e.preventDefault();
        if (typeof window !== 'undefined') {
          const prev = document.querySelector<HTMLAnchorElement>('.vp-header__chapter[title="Capítulo anterior"]');
          prev?.click();
        }
        break;
      case ']':
        e.preventDefault();
        if (typeof window !== 'undefined') {
          const next = document.querySelector<HTMLAnchorElement>('.vp-header__chapter[title="Capítulo siguiente"]');
          next?.click();
        }
        break;
      case '1':
        e.preventDefault();
        state.setMode('cascade');
        state.showFeedback('Modo cascada');
        break;
      case '2':
        e.preventDefault();
        state.setMode('page');
        state.showFeedback('Modo página');
        break;
      case '3':
        e.preventDefault();
        state.setMode('slider');
        state.showFeedback('Modo slider');
        break;
      case 'g':
      case 'G':
        e.preventDefault();
        if (e.shiftKey) {
          state.goToPage(state.totalPages.value - 1);
          if (state.mode.value === 'page') state.showFeedback(`Pg ${state.totalPages.value}/${state.totalPages.value}`);
        } else {
          state.goToPage(0);
          if (state.mode.value === 'page') state.showFeedback(`Pg 1/${state.totalPages.value}`);
        }
        break;
    }
  }

  onMounted(() => document.addEventListener('keydown', handler));
  onUnmounted(() => document.removeEventListener('keydown', handler));
}
