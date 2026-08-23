import { describe, expect, it } from 'vitest';
import { parseStoredMode, parseStoredPage } from './useViewerPersistence';

describe('viewer persistence codecs', () => {
  it('parses only supported reading modes', () => {
    expect(parseStoredMode('cascade')).toBe('cascade');
    expect(parseStoredMode('invalid')).toBeNull();
    expect(parseStoredMode(null)).toBeNull();
  });

  it('parses page indexes without relying on implicit coercion', () => {
    expect(parseStoredPage('12')).toBe(12);
    expect(parseStoredPage('-1')).toBeNull();
    expect(parseStoredPage('3px')).toBeNull();
  });
});
