import { describe, expect, it } from 'vitest';
import type { PatternKey } from '@/types/manga';
import { generatePages, pageSvg } from './page-placeholder';

function svg(overrides: Partial<Parameters<typeof pageSvg>[0]> = {}) {
  return pageSvg({
    coverColor: '#111111',
    coverPattern: 'dots',
    acronym: 'BRK',
    index: 1,
    total: 4,
    chapterTitle: 'Capítulo 1',
    ...overrides,
  });
}

describe('viewer page placeholders', () => {
  it('escapes external text before inserting it into SVG markup', () => {
    const result = svg({ acronym: 'A&B', chapterTitle: '<script>alert("x")</script>' });

    expect(result).toContain('A&amp;B');
    expect(result).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
  });

  it.each(['dots', 'dots-dark', 'lines', 'cross'] satisfies PatternKey[])(
    'renders the %s pattern as a referenced SVG fill',
    (coverPattern) => {
      const result = svg({ coverPattern });

      expect(result).toContain(`id='p-${coverPattern}'`);
      expect(result).toContain(`fill='url(#p-${coverPattern})'`);
    }
  );

  it('renders wash covers without an overlay pattern', () => {
    const result = svg({ coverPattern: 'wash' });

    expect(result).not.toContain('<pattern');
    expect(result).not.toContain("fill='url(#");
  });

  it('selects readable foreground colors for dark and light covers', () => {
    expect(svg({ coverColor: '#000000' })).toContain("fill='#F2EDE4'");
    expect(svg({ coverColor: '#FFFFFF' })).toContain("fill='#0A0A0A'");
  });

  it('generates numbered pages with the requested total', () => {
    const pages = generatePages(3, '#111111', 'dots', 'BRK', 'Capítulo');

    expect(pages.map((page) => page.number)).toEqual([1, 2, 3]);
    expect(pages[2]?.svgContent).toContain('PÁG. 3/3');
  });
});
