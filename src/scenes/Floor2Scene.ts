import { GAME_HEIGHT, TILE_SIZE, FLOORS } from '../config/gameConfig';
import { LevelScene, LevelConfig } from './LevelScene';

/**
 * Floor 2 — Cloud Team.
 *
 * Single-screen room (Impossible Mission style) with platforms
 * at multiple heights and three in-room elevators.
 */
export class Floor2Scene extends LevelScene {
  constructor() {
    super('Floor2Scene', FLOORS.CLOUD_TEAM);
  }

  protected getLevelConfig(): LevelConfig {
    const G = GAME_HEIGHT - TILE_SIZE;  // ground (full tile visible)
    const T1 = G - 220;                 // tier 1
    const T2 = G - 440;                 // tier 2
    const T3 = G - 660;                 // tier 3 (top)

    return {
      floorId: FLOORS.CLOUD_TEAM,
      playerStart: { x: 150, y: G - 100 },
      exitPosition: { x: 80, y: G - 56 },

      platforms: [
        // Ground — two sections with a gap
        { x: 0, y: G, width: 4 },
        { x: 768, y: G, width: 4 },

        // Tier 1
        { x: 256, y: T1, width: 3 },
        { x: 768, y: T1, width: 3 },

        // Tier 2
        { x: 0, y: T2, width: 3 },
        { x: 512, y: T2, width: 3 },
        { x: 896, y: T2, width: 2 },

        // Tier 3 — top
        { x: 0, y: T3, width: 2 },
        { x: 384, y: T3, width: 3 },
        { x: 768, y: T3, width: 3 },
      ],

      roomElevators: [
        // Left elevator: ground to tier 3
        { x: 200, minY: T3 + 6, maxY: G + 6, startY: G + 6 },
        // Centre elevator: tier 1 to tier 3
        { x: 680, minY: T3 + 6, maxY: T1 + 6, startY: T1 + 6 },
        // Right elevator: ground to tier 2
        { x: 1150, minY: T2 + 6, maxY: G + 6, startY: G + 6 },
      ],

      tokens: [
        // Ground
        { x: 550, y: G - 40 },
        // Tier 1
        { x: 380, y: T1 - 40 },
        { x: 900, y: T1 - 40 },
        // Tier 2
        { x: 150, y: T2 - 40 },
        { x: 640, y: T2 - 40 },
        { x: 960, y: T2 - 40 },
        // Tier 3
        { x: 100, y: T3 - 40 },
        { x: 450, y: T3 - 40 },
        { x: 800, y: T3 - 40 },
        { x: 1000, y: T3 - 40 },
      ],

      infoPoints: [
        {
          x: 900, y: G, contentId: 'cloud-architecture',
          zone: { shape: 'rect', width: 180, height: 220 },
        },
      ],
    };
  }
}
