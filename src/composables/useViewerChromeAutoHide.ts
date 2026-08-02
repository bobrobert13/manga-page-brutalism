/**
 * Auto-hide viewer chrome (header, controls, indicator) when in fullscreen.
 * After 3s of inactivity, chrome fades out. Any mouse/touch/keyboard activity
 * brings it back. Outside fullscreen, chrome is always visible.
 */
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';

export function useViewerChromeAutoHide(isFullscreen: Ref<boolean>, idleMs = 3000): Ref<boolean> {
  const isChromeVisible = ref(true);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show() {
    if (isChromeVisible.value) return;
    isChromeVisible.value = true;
  }

  function scheduleHide() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      isChromeVisible.value = false;
    }, idleMs);
  }

  function onActivity() {
    if (!isFullscreen.value) return;
    show();
    scheduleHide();
  }

  function bind() {
    document.addEventListener('mousemove', onActivity);
    document.addEventListener('touchstart', onActivity, { passive: true });
    document.addEventListener('keydown', onActivity);
    document.addEventListener('wheel', onActivity, { passive: true });
  }

  function unbind() {
    document.removeEventListener('mousemove', onActivity);
    document.removeEventListener('touchstart', onActivity);
    document.removeEventListener('keydown', onActivity);
    document.removeEventListener('wheel', onActivity);
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  watch(isFullscreen, (fs) => {
    if (fs) {
      show();
      scheduleHide();
      bind();
    } else {
      isChromeVisible.value = true;
      unbind();
    }
  });

  onMounted(() => {
    if (isFullscreen.value) bind();
  });

  onUnmounted(() => unbind());

  return isChromeVisible;
}