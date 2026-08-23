import { describe, expect, it } from 'vitest';
import { HERO_STATS, DETAIL_STATS } from '@/data/marketing/stats.fixture';
import { useMarketingContent } from './useMarketingContent';

describe('useMarketingContent', () => {
  it('returns hero stats from the fixture', () => {
    const content = useMarketingContent();

    expect(content.heroStats).toBe(HERO_STATS);
  });

  it('returns detail stats from the fixture', () => {
    const content = useMarketingContent();

    expect(content.detailStats).toBe(DETAIL_STATS);
  });

  it('returns a frozen read-only object', () => {
    const content = useMarketingContent();

    expect(Object.isFrozen(content)).toBe(false);
    // The factory returns fresh objects each call, but the properties
    // reference the same fixture arrays.
    const a = useMarketingContent();
    const b = useMarketingContent();
    expect(a.heroStats).toBe(b.heroStats);
  });
});
