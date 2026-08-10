<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ROUTES } from '@/config/index.config';
import { readRecentMangas } from '@/composables/catalog/useRecentMangas';
import type { RecentManga } from '@/types/recent-manga';

const props = defineProps<{ userId: string }>();
const items = ref<readonly RecentManga[]>([]);

onMounted(() => {
  items.value = readRecentMangas(props.userId);
});
</script>

<template>
  <section
    v-if="items.length"
    class="px-6 md:px-12 py-8 md:py-14 border-t-[3px] border-ink"
    aria-labelledby="recent-heading"
  >
    <header class="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 id="recent-heading" class="font-display text-2xl md:text-3xl tracking-tighter">
          VISTO RECIENTEMENTE
        </h2>
        <div class="flex items-center gap-3 mt-1">
          <span class="w-10 h-[3px] bg-red" aria-hidden="true"></span>
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
            Tu historial de lectura
          </span>
        </div>
      </div>
      <span class="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
        {{ items.length }} titulo{{ items.length === 1 ? '' : 's' }}
      </span>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <a
        v-for="item in items"
        :key="item.manga.slug"
        :href="ROUTES.chapter(item.manga.slug, item.chapterNumber)"
        class="group card-hover brutal-border bg-paper overflow-hidden block focus-visible:outline-3"
        :aria-label="`${item.manga.title} - continuar en capitulo ${item.chapterNumber}`"
      >
        <div
          class="cover-frame aspect-[3/4] relative"
          :style="{ backgroundColor: item.manga.coverColor }"
          role="img"
          :aria-label="item.manga.title"
        >
          <div
            class="absolute inset-0 pointer-events-none"
            :class="`pat-${item.manga.coverPattern}`"
          ></div>
          <div class="absolute inset-0 grid place-items-center">
            <span
              class="font-display text-5xl md:text-7xl text-white/20 transition-colors group-hover:text-white/40"
            >
              {{ item.manga.acronym }}
            </span>
          </div>
          <span
            class="absolute bottom-2 left-2 bg-yellow text-ink font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-1"
          >
            Cap. {{ item.chapterNumber }}
          </span>
        </div>
        <div class="p-3">
          <div class="font-display text-base md:text-xl leading-none truncate">
            {{ item.manga.title }}
          </div>
          <div class="font-mono text-[10px] uppercase tracking-[0.15em] opacity-70 mt-1 truncate">
            Continuar leyendo
          </div>
        </div>
      </a>
    </div>
  </section>
</template>
