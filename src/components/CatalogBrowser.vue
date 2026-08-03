<script setup lang="ts">
import { CATALOG_SORT_OPTIONS, ROUTES, SERIES_STATUS } from '@/config/index.config';
import { useCatalogFilters } from '@/composables/catalog/useCatalogFilters';
import type { Genre, Manga } from '@/types/manga';

const props = defineProps<{
  initialMangas: readonly Manga[];
  genres: readonly Genre[];
}>();

const { query, selectedGenre, sortBy, allGenres, filtered } = useCatalogFilters(
  props.initialMangas,
  props.genres
);

const patternClass = (key: Manga['coverPattern']) => `pat-${key}`;
const badgeSize = 'text-[9px] px-2 py-0.5';
const statusClasses: Record<Manga['status'], string> = {
  [SERIES_STATUS.ongoing]: 'bg-yellow text-ink',
  [SERIES_STATUS.completed]: 'bg-yellow text-ink',
  [SERIES_STATUS.hiatus]: 'bg-red text-paper',
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Filter row -->
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 max-w-md relative">
        <span
          class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm opacity-60"
          aria-hidden="true"
          >⌕</span
        >
        <input
          v-model="query"
          type="search"
          placeholder="Buscar por título, autor, género…"
          class="w-full brutal-border bg-paper px-9 py-3 font-mono text-sm uppercase tracking-[0.12em] outline-none focus:bg-ink focus:text-paper transition-colors placeholder:text-[color:var(--color-ink-alpha-40)]"
        />
      </div>
      <div class="flex items-center gap-3 text-xs md:text-sm font-mono uppercase tracking-[0.15em]">
        <span class="opacity-60 hidden md:inline">Ordenar:</span>
        <select
          v-model="sortBy"
          class="brutal-border bg-paper px-3 py-2 outline-none cursor-pointer"
        >
          <option v-for="opt in CATALOG_SORT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Genre chips -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="genre in allGenres"
        :key="genre"
        type="button"
        :aria-pressed="selectedGenre === genre"
        :class="[
          'chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]',
          selectedGenre === genre && 'bg-ink text-paper',
        ]"
        @click="selectedGenre = genre"
      >
        {{ genre }}
      </button>
    </div>

    <!-- Result count -->
    <div
      class="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em]"
    >
      <span>
        Mostrando <strong class="text-[var(--color-red)]">{{ filtered.length }}</strong> de
        {{ initialMangas.length }} resultados
      </span>
      <div class="hidden md:flex items-center gap-2">
        <span class="inline-block w-2 h-2 bg-red animate-pulse"></span>
        <span>{{ initialMangas.length }} títulos · demo</span>
      </div>
    </div>

    <!-- Card grid -->
    <div
      v-if="filtered.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    >
      <a
        v-for="m in filtered"
        :key="m.slug"
        :href="ROUTES.title(m.slug)"
        class="group card-hover brutal-border bg-paper overflow-hidden block"
      >
        <div class="cover-frame aspect-[3/4]" :style="{ backgroundColor: m.coverColor }">
          <div :class="['absolute inset-0 pointer-events-none', patternClass(m.coverPattern)]" />
          <span
            :class="[
              'absolute top-2 left-2 z-10 bg-ink text-paper font-mono uppercase tracking-[0.15em]',
              badgeSize,
            ]"
            >{{ m.type }}</span
          >
          <span
            :class="[
              'absolute top-2 right-2 z-10 font-mono uppercase tracking-[0.15em]',
              statusClasses[m.status],
              badgeSize,
            ]"
            >{{ m.status }}</span
          >
          <div class="absolute inset-0 grid place-items-center">
            <span
              class="font-display text-5xl md:text-7xl text-white/20 transition-colors group-hover:text-white/40"
              >{{ m.acronym }}</span
            >
          </div>
        </div>
        <div class="p-3 md:p-4">
          <h3
            class="font-display text-base md:text-xl leading-tight transition-colors group-hover:text-[var(--color-red)]"
          >
            {{ m.title }}
          </h3>
          <p class="font-mono text-[10px] uppercase tracking-[0.15em] opacity-70 mt-0.5">
            {{ m.author }}
          </p>
          <div class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="g in m.genres.slice(0, 3)"
              :key="g"
              class="bg-[color:var(--color-ink-alpha-10)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
              >{{ g }}</span
            >
          </div>
          <div
            class="flex items-center justify-between mt-2 font-mono text-[9px] uppercase tracking-[0.15em] opacity-60"
          >
            <span>{{ m.volumeCount }}</span>
            <span>★ {{ m.rating }}</span>
          </div>
        </div>
      </a>
    </div>
    <p v-else class="font-mono text-sm uppercase tracking-[0.18em] opacity-60 text-center py-12">
      Sin resultados. Probá quitar algún filtro.
    </p>

    <!-- Pagination (visual stub) -->
    <nav
      v-if="filtered.length > 0"
      aria-label="Paginación"
      class="flex items-center justify-center gap-3 mt-8 md:mt-12 font-mono text-xs uppercase tracking-[0.18em]"
    >
      <span class="brutal-border px-4 py-2 opacity-30 cursor-not-allowed">← Anterior</span>
      <span class="brutal-border bg-ink text-paper px-4 py-2">1</span>
      <a class="brutal-border px-4 py-2 btn-invert" href="#">2</a>
      <a class="brutal-border px-4 py-2 btn-invert" href="#">3</a>
      <span class="opacity-40 px-2">…</span>
      <a class="brutal-border px-4 py-2 btn-invert" href="#">24</a>
      <a class="brutal-border px-4 py-2 btn-invert" href="#">Siguiente →</a>
    </nav>
  </div>
</template>
