export type ScrollAxis = 'x' | 'y';

export interface ScrollAnimationTarget {
  scrollLeft: number;
  scrollTop: number;
}

interface AnimationScheduler {
  now: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
}

interface ScrollAnimationOptions {
  axis: ScrollAxis;
  targetOffset: number;
  durationMs: number;
  scheduler?: AnimationScheduler;
}

export function easeInOutCubic(progress: number): number {
  const bounded = Math.min(1, Math.max(0, progress));
  return bounded < 0.5 ? 4 * bounded * bounded * bounded : 1 - Math.pow(-2 * bounded + 2, 3) / 2;
}

export function animateElementScroll(
  target: ScrollAnimationTarget,
  options: ScrollAnimationOptions
): () => void {
  const scheduler =
    options.scheduler ??
    ({
      now: () => performance.now(),
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (id) => cancelAnimationFrame(id),
    } satisfies AnimationScheduler);
  const property = options.axis === 'x' ? 'scrollLeft' : 'scrollTop';
  const startOffset = target[property];
  const distance = options.targetOffset - startOffset;

  if (options.durationMs <= 0 || Math.abs(distance) < 1) {
    target[property] = options.targetOffset;
    return () => undefined;
  }

  const startedAt = scheduler.now();
  let frameId: number | null = null;
  let cancelled = false;

  function step(timestamp: number): void {
    if (cancelled) return;
    const progress = Math.min(1, (timestamp - startedAt) / options.durationMs);
    target[property] = startOffset + distance * easeInOutCubic(progress);

    if (progress < 1) {
      frameId = scheduler.requestFrame(step);
    } else {
      target[property] = options.targetOffset;
      frameId = null;
    }
  }

  frameId = scheduler.requestFrame(step);

  return () => {
    cancelled = true;
    if (frameId !== null) scheduler.cancelFrame(frameId);
    frameId = null;
  };
}
