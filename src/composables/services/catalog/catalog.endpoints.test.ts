import { describe, expect, it } from 'vitest';
import { CATALOG_ENDPOINTS } from './catalog.endpoints';

describe('catalog endpoints', () => {
  it('exposes stable collection endpoints', () => {
    expect(CATALOG_ENDPOINTS.mangas).toBe('/mangas');
    expect(CATALOG_ENDPOINTS.genres).toBe('/genres');
  });

  it('encodes dynamic path segments', () => {
    expect(CATALOG_ENDPOINTS.manga('one piece')).toBe('/mangas/one%20piece');
    expect(CATALOG_ENDPOINTS.chapters('dandadan/es')).toBe('/mangas/dandadan%2Fes/chapters');
    expect(CATALOG_ENDPOINTS.chapterPageCount('one piece', '1/2')).toBe(
      '/mangas/one%20piece/chapters/1%2F2/page-count'
    );
  });
});
