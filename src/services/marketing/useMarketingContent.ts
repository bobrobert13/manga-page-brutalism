import { DETAIL_STATS, HERO_STATS } from '@/data/marketing/stats.fixture';

export function useMarketingContent() {
  return {
    heroStats: HERO_STATS,
    detailStats: DETAIL_STATS,
  } as const;
}
