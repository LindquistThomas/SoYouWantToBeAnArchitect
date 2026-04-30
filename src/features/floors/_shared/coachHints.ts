import { FLOORS, type FloorId } from '../../../config/gameConfig';

/**
 * Per-floor first-visit coaching hint messages.
 *
 * Shown once via the HUD toast widget the first time the player enters a
 * floor. Omitting a floor ID from this map means no hint is shown there.
 */
const FLOOR_HINTS: Partial<Record<FloorId, string>> = {
  [FLOORS.LOBBY]:
    'Walk to a glowing \u25ba icon and press \u2191 or Enter to read it.',
  [FLOORS.PLATFORM_TEAM]:
    'Hold a direction and press Space to jump across gaps.',
  [FLOORS.BUSINESS]:
    'Answer quiz questions to earn AU and unlock new floors.',
  [FLOORS.EXECUTIVE]:
    'Answer quiz questions to earn AU and unlock new floors.',
  [FLOORS.PRODUCTS]:
    'Answer quiz questions to earn AU and unlock new floors.',
};

/**
 * Return the coaching hint for `floorId`, or `null` when none is defined
 * or when the hint should be suppressed.
 *
 * @param floorId      The floor the player just entered.
 * @param isFirstVisit True when `ProgressionSystem.isFirstVisit(floorId)` was true **before** `markFloorVisited` was called.
 * @param hideTutorials When true the player has opted out of coaching toasts.
 */
export function getCoachHint(
  floorId: FloorId,
  isFirstVisit: boolean,
  hideTutorials: boolean,
): string | null {
  if (!isFirstVisit) return null;
  if (hideTutorials) return null;
  return FLOOR_HINTS[floorId] ?? null;
}
