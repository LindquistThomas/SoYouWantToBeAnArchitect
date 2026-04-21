import type { LevelConfig } from '../_shared/LevelScene';

type EnemyList = NonNullable<LevelConfig['enemies']>;

/**
 * Platform floor enemies. `G` is the ground walking-surface y, `C` is the
 * mezzanine (catwalk) walking-surface — `G - 220` — so enemies share the
 * same reference as platforms, tokens, and props.
 *
 * Patrol ranges are chosen so none of them straddle an info-zone centre
 * (forcing the player to kite an enemy out of an info prompt) and so no
 * two enemies' ranges overlap.
 *
 *   - Slime patrols the workstations row on the ground floor, clear of
 *     both the signpost (x≈260) and the central lift shaft (x=640).
 *   - A rogue deploy bot patrols the RIGHT mezzanine near the monitoring
 *     wall (Observability catwalk, x=768..1024).
 *   - A second bot patrols the Edge Security ground zone near the WAF
 *     panel (x≈1080..1260), thematically "traffic arriving from the
 *     internet".
 */
export function enemiesForGroundY(G: number): EnemyList {
  // Catwalk walking-surface — must match `C` in PlatformTeamScene.getLevelConfig().
  const C = G - 220;
  return [
    // Ground workstations lane slime — kept to the left of the central lift
    // (x=640) so it doesn't block the lift boarding zone.
    { type: 'slime', x: 520, y: G - 20, minX: 380, maxX: 600, speed: 55 },
    // Rogue deploy bot patrols the RIGHT mezzanine (Observability catwalk).
    { type: 'bot', x: 896, y: C - 30, minX: 790, maxX: 1000, speed: 75 },
    // Ground bot guards the WAF zone — traffic "at the edge" thematically.
    { type: 'bot', x: 1180, y: G - 30, minX: 1080, maxX: 1260, speed: 85 },
  ];
}
