import type { Stat } from '@/types/manga';

export const HERO_STATS = [
  { label: 'Títulos en biblioteca', value: '12.4K', tone: 'ink' },
  { label: 'Idiomas disponibles', value: '48', tone: 'paper' },
  { label: 'Lectores activos', value: '2.4M', tone: 'yellow' },
  { label: 'Satisfacción', value: '98%', tone: 'paper' },
] as const satisfies readonly Stat[];

export const DETAIL_STATS = [
  { label: 'Capítulos', value: '374+', tone: 'ink', hint: 'Actualizado · Jul 2026' },
  { label: 'Volúmenes', value: '41+', tone: 'paper', hint: 'Tankōbon · En curso' },
  { label: 'Calificación', value: '★ 9.6', tone: 'yellow', hint: 'Top 3 · Todos los tiempos' },
  { label: 'Lectores', value: '2.4M', tone: 'paper', hint: '+12% este mes' },
] as const satisfies readonly Stat[];
