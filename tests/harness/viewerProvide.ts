import { ref, type Ref } from 'vue';
import { CHROME_VISIBLE_KEY } from '@/composables/viewer/useViewerChromeVisible';
import { VIEWER_STATE_KEY, type ViewerState } from '@/composables/viewer/useViewerState';

export function viewerProvide(state: ViewerState, chromeVisible: Ref<boolean> = ref(true)) {
  return {
    [VIEWER_STATE_KEY as symbol]: state,
    [CHROME_VISIBLE_KEY as symbol]: chromeVisible,
  };
}
