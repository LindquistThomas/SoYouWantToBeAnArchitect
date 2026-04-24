import * as Phaser from 'phaser';

/**
 * Floating mover platform — 96×18. Visually distinct from static catwalks
 * (warmer amber trim, repeating hazard chevrons) so the player reads it
 * as "this moves" at a glance. Width is fixed here; {@link MovingPlatform}
 * scales horizontally to match the configured width.
 */
export function generateMovingPlatformSprite(scene: Phaser.Scene): void {
  const W = 96;
  const H = 18;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x3a3024, 1).fillRect(0, 0, W, H);
  g.fillStyle(0xc98a2e, 1).fillRect(0, 0, W, 3);
  g.fillStyle(0x2a2218, 1).fillRect(0, H - 2, W, 2);

  g.fillStyle(0x7a5a2a, 1);
  for (let x = 4; x < W - 8; x += 10) {
    g.fillTriangle(x, H - 5, x + 5, 5, x + 10, H - 5);
  }

  g.fillStyle(0xffd88a, 1);
  for (let rx = 6; rx < W - 4; rx += 28) {
    g.fillRect(rx, 5, 2, 2);
    g.fillRect(rx, H - 7, 2, 2);
  }

  g.generateTexture('moving_platform', W, H);
  g.destroy();
}
