import * as Phaser from 'phaser';
import { theme } from '../../style/theme';

/** Door textures: unlocked (green), locked (red), exit (blue with arrow). */
export function generateDoorSprites(scene: Phaser.Scene): void {
  const dw = 80;
  const dh = 112;

  const baseDoor = (
    key: string,
    fill: number,
    inner: number,
    detail: (g: Phaser.GameObjects.Graphics) => void,
  ) => {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(fill);  g.fillRect(0, 0, dw, dh);
    g.fillStyle(inner); g.fillRect(4, 4, dw - 8, dh - 8);
    g.fillStyle(fill);  g.fillRect(dw / 2 - 1, 0, 2, dh);
    detail(g);
    g.generateTexture(key, dw, dh);
    g.destroy();
  };

  baseDoor('door_unlocked', theme.color.status.unlocked, 0x6bc46b, (g) => {
    g.fillStyle(theme.color.ui.token); g.fillCircle(dw - 18, dh / 2, 5);
  });

  baseDoor('door_locked', theme.color.status.locked, 0xa52a2a, (g) => {
    g.fillStyle(0xff0000); g.fillRect(dw / 2 - 8, dh / 2 - 8, 16, 16);
  });

  baseDoor('door_exit', 0x4a90d9, 0x6ab0f9, (g) => {
    g.fillStyle(0xffffff);
    g.fillTriangle(dw / 2, dh / 2 - 12, dw / 2 - 10, dh / 2 + 6, dw / 2 + 10, dh / 2 + 6);
  });

  // Ajar variants: same footprint + frame, but the inner panel pulls
  // aside to reveal a dark doorway. Used when the player is within
  // interaction range so the door visually telegraphs "walk through me".
  const ajarDoor = (
    key: string,
    frame: number,
    panel: number,
    detail?: (g: Phaser.GameObjects.Graphics) => void,
  ) => {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    // Frame.
    g.fillStyle(frame); g.fillRect(0, 0, dw, dh);
    // Dark doorway visible through the opening.
    g.fillStyle(0x0a0a12); g.fillRect(4, 4, dw - 8, dh - 8);
    // Panel swung to the left, occupying ~40% of the opening.
    const panelW = Math.floor((dw - 8) * 0.4);
    g.fillStyle(panel); g.fillRect(4, 4, panelW, dh - 8);
    // Slim highlight on the leading edge of the open panel.
    g.fillStyle(frame); g.fillRect(4 + panelW - 1, 4, 1, dh - 8);
    detail?.(g);
    g.generateTexture(key, dw, dh);
    g.destroy();
  };

  ajarDoor('door_open', theme.color.status.unlocked, 0x6bc46b, (g) => {
    // Small handle on the swung-open panel, mirrored from the closed state.
    const panelW = Math.floor((dw - 8) * 0.4);
    g.fillStyle(theme.color.ui.token); g.fillCircle(4 + panelW - 6, dh / 2, 3);
  });

  ajarDoor('door_exit_open', 0x4a90d9, 0x6ab0f9, (g) => {
    // Keep an arrow hint inside the now-visible doorway.
    g.fillStyle(0xffffff);
    const cx = (dw - 8) * 0.4 + 4 + (dw - (4 + (dw - 8) * 0.4)) / 2;
    g.fillTriangle(cx, dh / 2 - 10, cx - 8, dh / 2 + 5, cx + 8, dh / 2 + 5);
  });
}
