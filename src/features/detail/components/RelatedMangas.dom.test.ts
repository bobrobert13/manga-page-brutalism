import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { CatalogService } from '@/composables/services/catalog/catalog-service.contract';
import type { Manga } from '@/types/manga';
import RelatedMangas from './RelatedMangas.vue';

vi.mock('@/composables/services/catalog', () => ({
  useConfiguredCatalogService: vi.fn(),
}));

import { useConfiguredCatalogService } from '@/composables/services/catalog';

const useConfiguredCatalogServiceMock = vi.mocked(useConfiguredCatalogService);

function createMockService(related = [] as readonly Manga[]): CatalogService {
  return {
    getRelated: vi.fn().mockResolvedValue({ ok: true as const, data: related }),
    getBySlug: vi.fn(),
    getAll: vi.fn(),
    getGenres: vi.fn(),
    getChapters: vi.fn(),
    getChapterPageCount: vi.fn(),
    getFeatured: vi.fn(),
    getTrending: vi.fn(),
  };
}

describe('RelatedMangas', () => {
  const wrappers = new Set<VueWrapper>();

  function setup(related = [MANGAS[0], MANGAS[1]]) {
    const mockService = createMockService(related);
    useConfiguredCatalogServiceMock.mockReturnValue(mockService);
    const wrapper = mount(RelatedMangas, {
      props: { manga: MANGAS[2] },
    });
    wrappers.add(wrapper);
    return { wrapper, mockService };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    vi.clearAllMocks();
  });

  it('does not render heading when no related mangas', () => {
    useConfiguredCatalogServiceMock.mockReturnValue(createMockService([]));
    const wrapper = mount(RelatedMangas, {
      props: { manga: MANGAS[0] },
    });
    wrappers.add(wrapper);

    expect(wrapper.find('section').exists()).toBe(false);
  });

  it('renders related manga cards with links', async () => {
    const { wrapper } = setup([MANGAS[0], MANGAS[1]]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const links = wrapper.findAll('a[href^="/titulo/"]');
    expect(links).toHaveLength(2);
    expect(links[0].attributes('href')).toBe('/titulo/one-piece');
    expect(links[1].attributes('href')).toBe('/titulo/berserk');
  });

  it('shows author names on each card', async () => {
    const { wrapper } = setup([MANGAS[0]]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(MANGAS[0].author);
  });

  it('accepts a custom subtitle prop', async () => {
    const mockService = createMockService([MANGAS[0]]);
    useConfiguredCatalogServiceMock.mockReturnValue(mockService);
    const wrapper = mount(RelatedMangas, {
      props: { manga: MANGAS[0], subtitle: 'Obras similares' },
    });
    wrappers.add(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Obras similares');
  });

  it('does not render the section when getRelated returns empty', async () => {
    const mockService = createMockService([]);
    useConfiguredCatalogServiceMock.mockReturnValue(mockService);
    const wrapper = mount(RelatedMangas, {
      props: { manga: MANGAS[0] },
    });
    wrappers.add(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.find('section').exists()).toBe(false);
  });
});
