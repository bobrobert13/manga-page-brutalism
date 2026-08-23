<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ROUTES } from '@/config/index.config';
import { useConfiguredCatalogService } from '@/composables/services/catalog';
import type { Manga } from '@/types/manga';

const props = defineProps<{
  manga: Manga;
  subtitle?: string;
}>();

const items = ref<readonly Manga[]>([]);

onMounted(async () => {
  const result = await useConfiguredCatalogService().getRelated(props.manga);
  if (result.ok) items.value = result.data;
});
</script>

<template>
  <section v-if="items.length" aria-labelledby="related-heading">
    <div class="flex items-baseline gap-4 mb-6">
      <h2 id="related-heading" class="font-display text-2xl md:text-3xl tracking-tighter">
        RELACIONADOS
      </h2>
      <span class="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">
        {{ props.subtitle ?? 'Si te gusto esta obra' }}
      </span>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <a
        v-for="manga in items"
        :key="manga.slug"
        :href="ROUTES.title(manga.slug)"
        class="group card-hover brutal-border bg-paper overflow-hidden block focus-visible:outline-3"
        :aria-label="`${manga.title} - ${manga.author}`"
      >
        <div
          class="cover-frame aspect-[3/4] relative"
          :style="{ backgroundColor: manga.coverColor }"
          role="img"
          :aria-label="manga.title"
        >
          <div
            class="absolute inset-0 pointer-events-none"
            :class="`pat-${manga.coverPattern}`"
          ></div>
          <div class="absolute inset-0 grid place-items-center">
            <span
              class="font-display text-3xl text-white/20 transition-colors group-hover:text-white/40"
            >
              {{ manga.acronym }}
            </span>
          </div>
        </div>
        <div class="p-2">
          <div class="font-display text-xs leading-none truncate">{{ manga.title }}</div>
          <div class="font-mono text-[8px] uppercase opacity-60 truncate mt-1">
            {{ manga.author }}
          </div>
        </div>
      </a>
    </div>
  </section>
</template>
