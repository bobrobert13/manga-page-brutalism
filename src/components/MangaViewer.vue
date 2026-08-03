<script setup lang="ts">
import { computed, ref } from 'vue';
import { useViewerController } from '@/composables/viewer/useViewerController';
import { VIEWER_CONFIG } from '@/config/index.config';
import { generatePages } from '@/lib/viewer/page-placeholder';
import type { ViewerProps, ReadingMode } from '@/types/viewer';
import ViewerHeader from './viewer/ViewerHeader.vue';
import ViewerStage from './viewer/ViewerStage.vue';
import ViewerIndicator from './viewer/ViewerIndicator.vue';
import ViewerControls from './viewer/ViewerControls.vue';
import ViewerOnboarding from './viewer/ViewerOnboarding.vue';
import ViewerFeedback from './viewer/ViewerFeedback.vue';

const props = withDefaults(defineProps<ViewerProps>(), {
  initialMode: VIEWER_CONFIG.defaultMode,
  storageKey: 'default',
});

const emit = defineEmits<{
  close: [];
}>();

// Generate placeholder SVGs
const pages = generatePages(
  props.totalPages,
  props.coverColor,
  props.coverPattern,
  props.acronym,
  props.mangaTitle + ' — ' + props.chapterTitle
);

// Stage ref for gestures — ViewerStage exposes { stageElement }
const stageComp = ref<InstanceType<typeof ViewerStage> | null>(null);
const stageElement = computed(() => stageComp.value?.stageElement ?? null);
const state = useViewerController({
  pages,
  initialMode: props.initialMode as ReadingMode,
  storageKey: props.storageKey,
  stageElement,
});

function onClose() {
  if (history.length > 1) history.back();
  else emit('close');
}
</script>

<template>
  <div class="vp-shell">
    <ViewerHeader
      :manga-title="props.mangaTitle"
      :chapter-title="props.chapterTitle"
      :chapter-number="props.chapterNumber"
      :prev-chapter-href="props.prevChapterHref"
      :next-chapter-href="props.nextChapterHref"
      :prev-chapter-label="props.prevChapterLabel"
      :next-chapter-label="props.nextChapterLabel"
      @close="onClose"
    />

    <main id="stage" class="vp-stage-wrapper" tabindex="-1">
      <span class="vp-stage__counter" aria-hidden="true">
        {{ state.currentIndex.value + 1 }}/{{ state.totalPages.value }}
      </span>
      <ViewerStage ref="stageComp" />
    </main>

    <ViewerIndicator />
    <ViewerControls />
    <ViewerOnboarding />
    <ViewerFeedback />
  </div>
</template>

<style scoped>
.vp-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-paper);
  color: var(--color-ink);
}

.vp-stage-wrapper {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  background: var(--color-paper);
}

.vp-stage__counter {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  padding: 4px 10px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  box-shadow: 3px 3px 0 0 var(--color-ink);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
</style>
