import { afterEach, describe, expect, it } from 'vitest';
import { CATALOG_CONFIG, CATALOG_SORT } from '@/config/index.config';
import { GENRES } from '@/data/catalog/genres.fixture';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import { mountComposable } from '../../../tests/harness/mountComposable';
import { useCatalogFilters } from './useCatalogFilters';

describe('useCatalogFilters', () => {
  const mounted = new Set<ReturnType<typeof mountComposable>['wrapper']>();

  function setup() {
    const harness = mountComposable(() => useCatalogFilters(MANGAS, GENRES));
    mounted.add(harness.wrapper);
    return harness.result;
  }

  afterEach(() => {
    mounted.forEach((wrapper) => wrapper.unmount());
    mounted.clear();
  });

  it('starts with every manga and the all-genres option', () => {
    const state = setup();

    expect(state.filtered.value).toHaveLength(MANGAS.length);
    expect(state.selectedGenre.value).toBe(CATALOG_CONFIG.allGenresLabel);
    expect(state.allGenres.value).toEqual([CATALOG_CONFIG.allGenresLabel, ...GENRES]);
  });

  it('matches normalized title, author, and genre queries', () => {
    const state = setup();

    state.query.value = '  berserk  ';
    expect(state.filtered.value.map((manga) => manga.slug)).toEqual(['berserk']);

    state.query.value = 'miura';
    expect(state.filtered.value.map((manga) => manga.slug)).toContain('berserk');

    state.query.value = 'terror';
    expect(state.filtered.value).not.toHaveLength(0);
    expect(state.filtered.value.every((manga) => manga.genres.includes('Terror'))).toBe(true);
  });

  it('combines the selected genre with the text query', () => {
    const state = setup();
    const manga = MANGAS.find((item) => item.slug === 'berserk');
    if (!manga) throw new Error('Berserk fixture is required for this test.');
    const matchingGenre = manga.genres[0];
    const mangaGenres = new Set<string>(manga.genres);
    const nonMatchingGenre = GENRES.find((genre) => !mangaGenres.has(genre));
    if (!matchingGenre || !nonMatchingGenre) {
      throw new Error('The fixture requires matching and non-matching genres.');
    }

    state.selectedGenre.value = matchingGenre;
    state.query.value = 'berserk';

    expect(state.filtered.value.map((manga) => manga.slug)).toEqual(['berserk']);

    state.selectedGenre.value = nonMatchingGenre;
    expect(state.filtered.value).toEqual([]);
  });

  it('reacts to sorting changes without mutating the fixtures', () => {
    const state = setup();
    const original = [...MANGAS];

    state.sortBy.value = CATALOG_SORT.titleDescending;

    expect(state.filtered.value.map((manga) => manga.title)).toEqual(
      [...MANGAS].sort((a, b) => b.title.localeCompare(a.title)).map((manga) => manga.title)
    );
    expect(MANGAS).toEqual(original);
  });
});
