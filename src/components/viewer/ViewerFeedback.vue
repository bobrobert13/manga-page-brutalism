<script setup lang="ts">
import { useInjectedViewer } from '@/composables/viewer/useViewerState';

const state = useInjectedViewer();
</script>

<template>
  <Transition name="toast">
    <div
      v-if="state.feedbackMessage.value"
      class="vp-feedback"
      :class="{
        'vp-feedback--error': state.feedbackType.value === 'error',
        'vp-feedback--success': state.feedbackType.value === 'success',
      }"
      role="status"
      aria-live="polite"
    >
      {{ state.feedbackMessage.value }}
    </div>
  </Transition>
</template>

<style scoped>
.vp-feedback {
  position: fixed;
  left: 50%;
  bottom: 140px;
  transform: translateX(-50%);
  z-index: 300;
  padding: 10px 16px;
  background: var(--color-ink);
  color: var(--color-paper);
  border: 3px solid var(--color-ink);
  box-shadow: 4px 4px 0 0 var(--color-red);
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  white-space: nowrap;
  pointer-events: none;
}

.vp-feedback--error {
  background: var(--color-red);
  border-color: var(--color-red);
}

.vp-feedback--success {
  box-shadow: 4px 4px 0 0 var(--color-yellow);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
