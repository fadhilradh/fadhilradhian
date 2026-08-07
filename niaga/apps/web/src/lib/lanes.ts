import type { Lane } from '@niaga/contracts';

import type { Translate } from './i18n.js';

/** Lane copy lives in one place so a chip, a legend and a filter never disagree. */
export function laneLabel(lane: Lane, t: Translate): string {
  return t(`lane.${lane}` as const);
}

export function laneMeaning(lane: Lane, t: Translate): string {
  return t(`lane.${lane}.meaning` as const);
}
