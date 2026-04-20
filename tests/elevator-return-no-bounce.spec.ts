import { test, expect } from '@playwright/test';
import {
  waitForGame,
  waitForScene,
  seedFullProgressSave,
  clearStorage,
  attachErrorWatchers,
} from './helpers/playwright';

interface FloorCase {
  /** Phaser scene key of the floor scene. */
  sceneKey: string;
  /** Which side of the shaft the floor is reached from. */
  stepOff: 'left' | 'right';
  /** currentFloor id to ride to. */
  floorId: number;
  /** Total AU to seed so the floor is unlocked. */
  totalAU: number;
  /** List of unlocked floor IDs (beyond lobby). */
  unlocked: number[];
}

const CASES: FloorCase[] = [
  { sceneKey: 'PlatformTeamScene', stepOff: 'left', floorId: 1, totalAU: 50, unlocked: [0, 1] },
];

/**
 * Regression: returning from a team floor must not bounce the player straight
 * back into the floor when they walk toward the cab.
 */
test.describe('elevator return', () => {
  for (const c of CASES) {
    test(`walking back to elevator after ${c.sceneKey} exit does not bounce`, async ({ page }) => {
      await clearStorage(page);
      await seedFullProgressSave(page, {
        totalAU: c.totalAU,
        floorAU: Object.fromEntries(c.unlocked.map((f) => [f, 0])),
      });
      const errors = attachErrorWatchers(page);
      await page.goto('/');
      await waitForGame(page);
      await waitForScene(page, 'MenuScene');

      // Select Continue (second entry) and confirm → ElevatorScene with loadSave=true.
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await waitForScene(page, 'ElevatorScene');

      // Jump directly to the "just returned from floor" state by restarting
      // ElevatorScene with the exact NavigationContext the floor scene would
      // hand back on exit (see LevelScene.returnToElevator). This skips the
      // menu→lobby walk→ride→step-off→walk-back→Enter preamble, which is
      // inherently timing-sensitive over keyboard input and intermittently
      // times out on CI under parallel-worker CPU contention. The regression
      // under test is strictly about what happens AFTER the return — the
      // preamble was never load-bearing.
      await page.evaluate(
        ({ fromFloor, spawnSide }) => {
          const g = window.__game as unknown as {
            scene: {
              getScenes: (active?: boolean) => { sys: { settings: { key: string } } }[];
              start: (key: string, data?: unknown) => void;
            };
          };
          const scene = g.scene
            .getScenes(true)
            .find((s) => s.sys.settings.key === 'ElevatorScene') as unknown as {
              progression: { setCurrentFloor: (id: number) => void };
            };
          // Dock the cab at the returning floor so stepping back onto the
          // floor walking surface is possible (the cab top sits 8 px below
          // the walkway — this is exactly the overlap that used to trigger
          // the bounce).
          scene.progression.setCurrentFloor(fromFloor);
          g.scene.start('ElevatorScene', { fromFloor, spawnSide });
        },
        { fromFloor: c.floorId, spawnSide: c.stepOff },
      );
      await waitForScene(page, 'ElevatorScene');

      // Now walk back toward the cab then pull back — simulating a user who
      // approaches the shaft and pauses/steps back. The bug: the sticky
      // on-elevator latch clears `skipFloorEntry` as soon as the player
      // clips the cab tolerance band (which overlaps the floor walking
      // surface), so stepping back re-triggers floor entry.
      const walkInKey = c.stepOff === 'left' ? 'ArrowRight' : 'ArrowLeft';
      const walkOutKey = c.stepOff === 'left' ? 'ArrowLeft' : 'ArrowRight';
      const samples: string[] = [];
      const snap = async () => {
        const active = await page.evaluate(() => {
          const g = window.__game as unknown as {
            scene: { getScenes: (a?: boolean) => { sys: { settings: { key: string } } }[] };
          };
          return g.scene
            .getScenes(true)
            .map((s) => s.sys.settings.key)
            .filter((k) => k !== 'BootScene' && k !== 'MenuScene')
            .join(',');
        });
        samples.push(active);
      };

      // Repeat a few approach/retreat cycles to cover different stop points
      // within the 90–96 px latch zone.
      for (let i = 0; i < 3; i++) {
        await page.keyboard.down(walkInKey);
        await page.waitForTimeout(350);
        await page.keyboard.up(walkInKey);
        await snap();
        await page.keyboard.down(walkOutKey);
        await page.waitForTimeout(300);
        await page.keyboard.up(walkOutKey);
        await snap();
      }
      // Final steady walk toward the cab.
      await page.keyboard.down(walkInKey);
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(150);
        await snap();
      }
      await page.keyboard.up(walkInKey);

      const bounced = samples.some((s) => s.includes(c.sceneKey));
      expect(
        bounced,
        `Expected to stay in ElevatorScene while walking back to the cab, but observed scene samples: ${samples.join(' | ')}`,
      ).toBe(false);

      errors.assertClean();
    });
  }
});

