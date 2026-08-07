import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { CATALOG_SORT } from '@/config/index.config';
import { GENRES } from '@/data/catalog/genres.fixture';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import CatalogBrowser from './CatalogBrowser.vue';

describe('CatalogBrowser', () => {
  const wrappers = new Set<VueWrapper>();

  function setup() {
    const wrapper = mount(CatalogBrowser, {
      props: { initialMangas: MANGAS, genres: GENRES },
    });
    wrappers.add(wrapper);
    return wrapper;
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('renders catalog cards with application routes', () => {
    const wrapper = setup();
    const cards = wrapper.findAll('a[href^="/titulo/"]');

    expect(cards).toHaveLength(MANGAS.length);
    expect(cards.map((card) => card.attributes('href')).sort()).toEqual(
      MANGAS.map((manga) => `/titulo/${manga.slug}`).sort()
    );
    expect(wrapper.text()).toContain(`Mostrando ${MANGAS.length} de ${MANGAS.length} resultados`);
  });

  it('filters visible cards from the search control', async () => {
    const wrapper = setup();

    await wrapper.get('input[type="search"]').setValue('berserk');

    expect(wrapper.findAll('a[href^="/titulo/"]')).toHaveLength(1);
    expect(wrapper.text()).toContain('BERSERK');
  });

  it('combines genre selection with accessible pressed state', async () => {
    const wrapper = setup();
    const genre = 'Terror';
    const button = wrapper.findAll('button').find((item) => item.text() === genre);
    if (!button) throw new Error(`Missing ${genre} filter button.`);

    await button.trigger('click');

    expect(button.attributes('aria-pressed')).toBe('true');
    expect(
      wrapper.findAll('a[href^="/titulo/"]').every((card) => card.text().includes(genre))
    ).toBe(true);
  });

  it('updates card order from the sort selector', async () => {
    const wrapper = setup();

    await wrapper.get('select').setValue(CATALOG_SORT.titleDescending);

    const titles = wrapper.findAll('a[href^="/titulo/"] h3').map((heading) => heading.text());
    expect(titles).toEqual([...titles].sort((a, b) => b.localeCompare(a)));
  });

  it('renders an empty state and removes pagination when nothing matches', async () => {
    const wrapper = setup();

    await wrapper.get('input[type="search"]').setValue('missing title');

    expect(wrapper.text()).toContain('Sin resultados. Probá quitar algún filtro.');
    expect(wrapper.find('[aria-label="Paginación"]').exists()).toBe(false);
  });
});
