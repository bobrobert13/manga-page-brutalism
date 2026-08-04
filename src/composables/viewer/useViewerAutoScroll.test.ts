import { describe, expect, it, vi } from 'vitest';
import { AUTO_SCROLL_CONFIG, AUTO_SCROLL_MOTION } from '@/config/index.config';
import {
  createAutoScrollPlayback,
  createAutoScrollTimer,
  normalizeAutoScrollInterval,
  parseStoredAutoScrollInterval,
  parseStoredAutoScrollMotion,
} from './useViewerAutoScroll';

describe('auto-scroll preference codecs', () => {
  it('normalizes intervals to the configured range and step', () => {
    expect(normalizeAutoScrollInterval(8_400)).toBe(8_000);
    expect(normalizeAutoScrollInterval(8_600)).toBe(9_000);
    expect(normalizeAutoScrollInterval(1_000)).toBe(AUTO_SCROLL_CONFIG.minIntervalMs);
    expect(normalizeAutoScrollInterval(90_000)).toBe(AUTO_SCROLL_CONFIG.maxIntervalMs);
    expect(normalizeAutoScrollInterval(Number.NaN)).toBe(AUTO_SCROLL_CONFIG.defaultIntervalMs);
  });

  it('accepts only stored intervals inside the supported range', () => {
    expect(parseStoredAutoScrollInterval('8000')).toBe(8_000);
    expect(parseStoredAutoScrollInterval('8500')).toBe(9_000);
    expect(parseStoredAutoScrollInterval('1000')).toBeNull();
    expect(parseStoredAutoScrollInterval('8s')).toBeNull();
    expect(parseStoredAutoScrollInterval(null)).toBeNull();
  });

  it('accepts only known motion preferences', () => {
    expect(parseStoredAutoScrollMotion(AUTO_SCROLL_MOTION.direct)).toBe('direct');
    expect(parseStoredAutoScrollMotion(AUTO_SCROLL_MOTION.smooth)).toBe('smooth');
    expect(parseStoredAutoScrollMotion('cinematic')).toBeNull();
    expect(parseStoredAutoScrollMotion(null)).toBeNull();
  });
});

describe('auto-scroll timer', () => {
  it('runs an armed callback once after its delay', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const timer = createAutoScrollTimer();

    timer.arm(1_000, callback);
    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it('replaces an existing timer instead of stacking callbacks', () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    const timer = createAutoScrollTimer();

    timer.arm(1_000, first);
    timer.arm(500, second);
    vi.runAllTimers();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('cancels a pending callback idempotently', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const timer = createAutoScrollTimer();

    timer.arm(1_000, callback);
    timer.cancel();
    timer.cancel();
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('auto-scroll playback', () => {
  it('advances once per delay and completes when advance returns false', () => {
    vi.useFakeTimers();
    const advance = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    const onComplete = vi.fn();
    const playback = createAutoScrollPlayback({
      timer: createAutoScrollTimer(),
      getDelayMs: () => 1_000,
      advance,
      onComplete,
    });

    playback.play();
    vi.advanceTimersByTime(1_000);
    expect(advance).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    expect(advance).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('pauses without running a pending advance', () => {
    vi.useFakeTimers();
    const advance = vi.fn(() => true);
    const playback = createAutoScrollPlayback({
      timer: createAutoScrollTimer(),
      getDelayMs: () => 1_000,
      advance,
      onComplete: vi.fn(),
    });

    playback.play();
    playback.pause();
    vi.runAllTimers();

    expect(advance).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('restarts the countdown when rescheduled', () => {
    vi.useFakeTimers();
    let delayMs = 1_000;
    const advance = vi.fn(() => true);
    const playback = createAutoScrollPlayback({
      timer: createAutoScrollTimer(),
      getDelayMs: () => delayMs,
      advance,
      onComplete: vi.fn(),
    });

    playback.play();
    vi.advanceTimersByTime(750);
    delayMs = 2_000;
    playback.reschedule();
    vi.advanceTimersByTime(1_999);
    expect(advance).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(advance).toHaveBeenCalledOnce();

    playback.pause();
    vi.useRealTimers();
  });
});
