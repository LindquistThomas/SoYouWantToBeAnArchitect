import type { LevelConfig } from '../_shared/LevelScene';

type EnemyList = NonNullable<LevelConfig['enemies']>;

/**
 * Platform floor enemies. `G` is the walking-surface y used by the scene
 * so enemies share the same ground reference as tokens and props.
 *
 *   - Slime patrols the mid-floor tokens (stompable teach).
 *   - Bureaucracy Bot patrols past the monitoring wall toward the right
 *     edge, so the info dialog at the monitoring wall stays reachable.
 */
export function enemiesForGroundY(G: number): EnemyList {
  return [
    { type: 'slime', x: 560, y: G - 20, minX: 420, maxX: 720, speed: 55 },
    { type: 'bot', x: 1020, y: G - 30, minX: 980, maxX: 1080, speed: 85 },
  ];
}
