import { computed, ref, type Ref } from 'vue';
import { vi } from 'vitest';
import { AUTO_SCROLL_MOTION, type AutoScrollMotion } from '@/config/index.config';
import { CHROME_VISIBLE_KEY } from '@/composables/viewer/useViewerChromeVisible';
import {
  VIEWER_AUTO_SCROLL_KEY,
  type ViewerAutoScroll,
} from '@/composables/viewer/useViewerAutoScroll';
import { VIEWER_STATE_KEY, type ViewerState } from '@/composables/viewer/useViewerState';
import type { AutoScrollPauseReason } from '@/types/viewer';

export function createViewerAutoScrollMock(): ViewerAutoScroll {
  const status = ref<'stopped' | 'playing' | 'paused' | 'completed'>('stopped');
  const pauseReason = ref<AutoScrollPauseReason | null>(null);
  const intervalMs = ref(3000);
  const motion = ref<AutoScrollMotion>(AUTO_SCROLL_MOTION.direct);
  const isPanelOpen = ref(false);
  const prefersReducedMotion = ref(false);

  return {
    status,
    pauseReason,
    intervalMs,
    motion,
    isPanelOpen,
    prefersReducedMotion,
    effectiveMotion: computed(() => motion.value),
    isPlaying: computed(() => status.value === 'playing'),
    canPlay: computed(() => true),
    play: vi.fn(() => {
      status.value = 'playing';
    }),
    pause: vi.fn(() => {
      status.value = 'paused';
    }),
    toggle: vi.fn(),
    setIntervalMs: vi.fn((value: number) => {
      intervalMs.value = value;
    }),
    setMotion: vi.fn((value: AutoScrollMotion) => {
      motion.value = value;
    }),
    setPanelOpen: vi.fn((value: boolean) => {
      isPanelOpen.value = value;
    }),
  };
}

export function viewerProvide(
  state: ViewerState,
  chromeVisible: Ref<boolean> = ref(true),
  autoScroll: ViewerAutoScroll = createViewerAutoScrollMock()
) {
  return {
    [VIEWER_STATE_KEY as symbol]: state,
    [CHROME_VISIBLE_KEY as symbol]: chromeVisible,
    [VIEWER_AUTO_SCROLL_KEY as symbol]: autoScroll,
  };
}
