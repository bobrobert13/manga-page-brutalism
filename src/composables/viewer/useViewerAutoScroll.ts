import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue';
import {
  AUTO_SCROLL_CONFIG,
  AUTO_SCROLL_MOTION,
  STORAGE_KEYS,
  type AutoScrollMotion,
} from '@/config/index.config';
import type {
  AutoScrollPauseReason,
  AutoScrollStatus,
  ViewerAutoScrollPreferences,
} from '@/types/viewer';
import type { ViewerState } from './useViewerState';

interface AutoScrollTimer {
  arm: (delayMs: number, callback: () => void) => void;
  cancel: () => void;
}

interface AutoScrollPlayback {
  play: () => void;
  pause: () => void;
  reschedule: () => void;
}

interface AutoScrollPlaybackOptions {
  timer: AutoScrollTimer;
  getDelayMs: () => number;
  advance: () => boolean;
  onComplete: () => void;
}

export interface ViewerAutoScroll {
  status: Ref<AutoScrollStatus>;
  pauseReason: Ref<AutoScrollPauseReason | null>;
  intervalMs: Ref<number>;
  motion: Ref<AutoScrollMotion>;
  prefersReducedMotion: Ref<boolean>;
  effectiveMotion: ComputedRef<AutoScrollMotion>;
  isPlaying: ComputedRef<boolean>;
  canPlay: ComputedRef<boolean>;
  play: () => void;
  pause: (reason?: AutoScrollPauseReason, announce?: boolean) => void;
  toggle: () => void;
  setIntervalMs: (value: number) => void;
  setMotion: (value: AutoScrollMotion) => void;
}

export const VIEWER_AUTO_SCROLL_KEY: InjectionKey<ViewerAutoScroll> = Symbol('viewerAutoScroll');

export function normalizeAutoScrollInterval(value: number): number {
  if (!Number.isFinite(value)) return AUTO_SCROLL_CONFIG.defaultIntervalMs;
  const stepped =
    Math.round(value / AUTO_SCROLL_CONFIG.intervalStepMs) * AUTO_SCROLL_CONFIG.intervalStepMs;
  return Math.min(
    AUTO_SCROLL_CONFIG.maxIntervalMs,
    Math.max(AUTO_SCROLL_CONFIG.minIntervalMs, stepped)
  );
}

export function parseStoredAutoScrollInterval(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < AUTO_SCROLL_CONFIG.minIntervalMs ||
    parsed > AUTO_SCROLL_CONFIG.maxIntervalMs
  ) {
    return null;
  }
  return normalizeAutoScrollInterval(parsed);
}

export function parseStoredAutoScrollMotion(value: string | null): AutoScrollMotion | null {
  return Object.values(AUTO_SCROLL_MOTION).includes(value as AutoScrollMotion)
    ? (value as AutoScrollMotion)
    : null;
}

export function createAutoScrollTimer(
  setTimer: typeof setTimeout = setTimeout,
  clearTimer: typeof clearTimeout = clearTimeout
): AutoScrollTimer {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function cancel(): void {
    if (timer === null) return;
    clearTimer(timer);
    timer = null;
  }

  function arm(delayMs: number, callback: () => void): void {
    cancel();
    timer = setTimer(() => {
      timer = null;
      callback();
    }, delayMs);
  }

  return { arm, cancel };
}

export function createAutoScrollPlayback(options: AutoScrollPlaybackOptions): AutoScrollPlayback {
  let isRunning = false;

  function schedule(): void {
    options.timer.cancel();
    if (!isRunning) return;
    options.timer.arm(options.getDelayMs(), tick);
  }

  function tick(): void {
    if (!isRunning) return;
    if (!options.advance()) {
      isRunning = false;
      options.timer.cancel();
      options.onComplete();
      return;
    }
    schedule();
  }

  function play(): void {
    if (isRunning) return;
    isRunning = true;
    schedule();
  }

  function pause(): void {
    isRunning = false;
    options.timer.cancel();
  }

  return { play, pause, reschedule: schedule };
}

export function useViewerAutoScroll(
  state: ViewerState,
  stageElement: Ref<HTMLElement | null>
): ViewerAutoScroll {
  const status = ref<AutoScrollStatus>('stopped');
  const pauseReason = ref<AutoScrollPauseReason | null>(null);
  const intervalMs = ref<number>(AUTO_SCROLL_CONFIG.defaultIntervalMs);
  const motion = ref<AutoScrollMotion>(AUTO_SCROLL_CONFIG.defaultMotion);
  const prefersReducedMotion = ref(false);
  const timer = createAutoScrollTimer();
  let mediaQuery: MediaQueryList | null = null;
  let boundStage: HTMLElement | null = null;
  let isRestoring = true;

  const isPlaying = computed(() => status.value === 'playing');
  const canPlay = computed(
    () =>
      state.totalPages.value > 1 &&
      state.currentIndex.value < state.totalPages.value - 1 &&
      !state.isZoomed.value &&
      !state.isOnboardingVisible.value
  );
  const effectiveMotion = computed<AutoScrollMotion>(() =>
    prefersReducedMotion.value ? AUTO_SCROLL_MOTION.direct : motion.value
  );

  const playback = createAutoScrollPlayback({
    timer,
    getDelayMs: () => intervalMs.value,
    advance: () => state.goNext() && state.currentIndex.value < state.totalPages.value - 1,
    onComplete: complete,
  });

  function writePreferences(): void {
    if (isRestoring) return;
    const preferences: ViewerAutoScrollPreferences = {
      intervalMs: intervalMs.value,
      motion: motion.value,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.viewerAutoScroll, JSON.stringify(preferences));
    } catch {
      // Auto-scroll remains usable when persistence is unavailable.
    }
  }

  function complete(): void {
    status.value = 'completed';
    pauseReason.value = null;
    state.showFeedback('Fin del capítulo', 'success');
  }

  function play(): void {
    if (!canPlay.value) {
      if (state.currentIndex.value >= state.totalPages.value - 1) complete();
      return;
    }
    status.value = 'playing';
    pauseReason.value = null;
    state.showFeedback('Auto-scroll iniciado');
    playback.play();
  }

  function pause(reason: AutoScrollPauseReason = 'manual', announce = true): void {
    if (!isPlaying.value) return;
    playback.pause();
    status.value = 'paused';
    pauseReason.value = reason;
    if (announce) state.showFeedback('Auto-scroll pausado');
  }

  function toggle(): void {
    if (isPlaying.value) pause();
    else play();
  }

  function setIntervalMs(value: number): void {
    intervalMs.value = normalizeAutoScrollInterval(value);
    if (isPlaying.value) playback.reschedule();
  }

  function setMotion(value: AutoScrollMotion): void {
    if (!Object.values(AUTO_SCROLL_MOTION).includes(value)) return;
    motion.value = value;
  }

  function restorePreferences(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.viewerAutoScroll);
      if (!raw) return;
      const stored = JSON.parse(raw) as Partial<Record<keyof ViewerAutoScrollPreferences, unknown>>;
      const storedInterval = parseStoredAutoScrollInterval(
        typeof stored.intervalMs === 'number' ? String(stored.intervalMs) : null
      );
      const storedMotion = parseStoredAutoScrollMotion(
        typeof stored.motion === 'string' ? stored.motion : null
      );
      if (storedInterval !== null) intervalMs.value = storedInterval;
      if (storedMotion !== null) motion.value = storedMotion;
    } catch {
      // Invalid or unavailable storage falls back to defaults.
    }
  }

  function onReducedMotionChange(event: MediaQueryListEvent | MediaQueryList): void {
    prefersReducedMotion.value = event.matches;
  }

  function onVisibilityChange(): void {
    if (document.hidden) pause('hidden', false);
  }

  function onStageInteraction(event: Event): void {
    if (event.isTrusted) pause('interaction');
  }

  watch(intervalMs, writePreferences);
  watch(motion, writePreferences);
  watch(state.mode, () => pause('mode-change', false));
  watch(state.isZoomed, (isZoomed) => {
    if (isZoomed) pause('zoom', false);
  });
  watch(state.isOnboardingVisible, (isVisible) => {
    if (isVisible) pause('onboarding', false);
  });

  onMounted(() => {
    restorePreferences();
    isRestoring = false;

    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    onReducedMotionChange(mediaQuery);
    mediaQuery.addEventListener('change', onReducedMotionChange);

    boundStage = stageElement.value;
    boundStage?.addEventListener('pointerdown', onStageInteraction, { passive: true });
    boundStage?.addEventListener('touchstart', onStageInteraction, { passive: true });
    boundStage?.addEventListener('wheel', onStageInteraction, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onUnmounted(() => {
    playback.pause();
    mediaQuery?.removeEventListener('change', onReducedMotionChange);
    boundStage?.removeEventListener('pointerdown', onStageInteraction);
    boundStage?.removeEventListener('touchstart', onStageInteraction);
    boundStage?.removeEventListener('wheel', onStageInteraction);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  const autoScroll: ViewerAutoScroll = {
    status,
    pauseReason,
    intervalMs,
    motion,
    prefersReducedMotion,
    effectiveMotion,
    isPlaying,
    canPlay,
    play,
    pause,
    toggle,
    setIntervalMs,
    setMotion,
  };

  provide(VIEWER_AUTO_SCROLL_KEY, autoScroll);
  return autoScroll;
}

export function useInjectedViewerAutoScroll(): ViewerAutoScroll {
  const autoScroll = inject(VIEWER_AUTO_SCROLL_KEY);
  if (!autoScroll) {
    throw new Error('useInjectedViewerAutoScroll() must be called within a <MangaViewer> tree');
  }
  return autoScroll;
}
