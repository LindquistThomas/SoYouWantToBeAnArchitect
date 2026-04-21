import type { LevelConfig } from '../_shared/LevelScene';

type EnemyList = NonNullable<LevelConfig['enemies']>;

/**
 * Platform floor enemies. `G` is the ground walking-surface y, `C` is the
 * mezzanine (catwalk) walking-surface — `G - 220` — so enemies share the
 * same reference as platforms, tokens, and props.
 *
 *   - Slime patrols the workstations row on the ground floor.
 *   - A rogue deploy bot patrols the right mezzanine near the monitoring
 *     wall (Observability station).
 *   - A second bot patrols the ground in the Edge Security / WAF zone,
 *     thematically "traffic arriving from the internet".
 */
export function enemiesForGroundY(G: number): EnemyList {
  // Catwalk walking-surface — must match `C` in PlatformTeamScene.getLevelConfig().
  const C = G - 220;
  return [
    { type: 'slime', x: 620, y: G - 20, minX: 500, maxX: 780, speed: 55 },
    // Rogue deploy bot patrols the RIGHT mezzanine (Observability catwalk).
    { type: 'bot', x: 1028, y: C - 30, minX: 940, maxX: 1130, speed: 75 },
    // Ground bot guards the WAF zone — traffic "at the edge" thematically.
    { type: 'bot', x: 1100, y: G - 30, minX: 1000, maxX: 1240, speed: 85 },
  ];
}
