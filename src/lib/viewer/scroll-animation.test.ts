import { describe, expect, it, vi } from 'vitest';
import { animateElementScroll, easeInOutCubic } from './scroll-animation';

describe('viewer scroll animation', () => {
  it('uses a bounded ease-in-out curve', () => {
    expect(easeInOutCubic(-1)).toBe(0);
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.25)).toBeCloseTo(0.0625);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(0.75)).toBeCloseTo(0.9375);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(2)).toBe(1);
  });

  it('interpolates to the requested offset over the configured duration', () => {
    const callbacks: FrameRequestCallback[] = [];
    const target = { scrollLeft: 0, scrollTop: 100 };
    const cancelFrame = vi.fn();
    const onComplete = vi.fn();
    animateElementScroll(target, {
      axis: 'y',
      targetOffset: 500,
      durationMs: 800,
      scheduler: {
        now: () => 1_000,
        requestFrame: (callback) => {
          callbacks.push(callback);
          return callbacks.length;
        },
        cancelFrame,
      },
      onComplete,
    });

    callbacks.shift()?.(1_400);
    expect(target.scrollTop).toBe(300);
    callbacks.shift()?.(1_800);
    expect(target.scrollTop).toBe(500);
    expect(cancelFrame).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('cancels a pending animation without forcing its destination', () => {
    const callbacks: FrameRequestCallback[] = [];
    const target = { scrollLeft: 10, scrollTop: 0 };
    const cancelFrame = vi.fn();
    const cancel = animateElementScroll(target, {
      axis: 'x',
      targetOffset: 200,
      durationMs: 700,
      scheduler: {
        now: () => 0,
        requestFrame: (callback) => {
          callbacks.push(callback);
          return 7;
        },
        cancelFrame,
      },
    });

    cancel();
    callbacks.shift()?.(700);

    expect(cancelFrame).toHaveBeenCalledWith(7);
    expect(target.scrollLeft).toBe(10);
  });
});
