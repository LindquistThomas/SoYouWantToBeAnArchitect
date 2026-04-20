import * as Phaser from 'phaser';
import { theme } from '../../style/theme';

/**
 * Decorative reception / waiting-area props for the ground-floor lobby
 * visible in the elevator shaft preview. All sprites are drawn with a
 * default 0.5/0.5 origin and pixel-art palette consistent with the rest
 * of the game's procedural art.
 */
export function generateLobbyPropSprites(scene: Phaser.Scene): void {
  generateReceptionDesk(scene);
  // Note: the company logo ('lobby_logo') is loaded as an SVG in BootScene
  // from public/brand/norconsult-digital-white.svg rather than generated.
  generateSofa(scene);
  generateCoffeeTable(scene);
  generateFloorLamp(scene);
  // Note: the lobby wall clock is a live analog+digital clock built at
  // runtime in ElevatorSceneLayout.createLobbyClock rather than a sprite.
  generateWelcomeMat(scene);
}

function generateReceptionDesk(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 160, h = 90;

  // Desk body (dark wood)
  g.fillStyle(0x5d4037);
  g.fillRect(6, 30, w - 12, h - 30);
  // Top counter (lighter wood)
  g.fillStyle(0x8d6e63);
  g.fillRect(4, 26, w - 8, 8);
  // Front panel stripe (brand accent)
  g.fillStyle(0x1a237e);
  g.fillRect(10, 46, w - 20, 6);
  g.fillStyle(theme.color.ui.accent);
  g.fillRect(10, 52, w - 20, 2);
  // Lower kick-plate shadow
  g.fillStyle(0x3e2723);
  g.fillRect(6, h - 6, w - 12, 6);
  // Small monitor on the counter (desktop screen)
  g.fillStyle(0x212121);
  g.fillRect(110, 10, 30, 18);
  g.fillStyle(0x00d4ff);
  g.fillRect(112, 12, 26, 14);
  g.fillStyle(0x263238);
  g.fillRect(122, 28, 6, 3);
  // Bell (reception bell) on the left of the counter
  g.fillStyle(0xb8860b);
  g.fillCircle(26, 22, 6);
  g.fillStyle(0xdaa520);
  g.fillCircle(26, 20, 4);
  g.fillStyle(0x5d4037);
  g.fillRect(22, 26, 8, 2);

  g.generateTexture('reception_desk', w, h);
  g.destroy();
}

function generateSofa(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 160, h = 60;

  // Wooden legs
  g.fillStyle(0x3e2723);
  g.fillRect(8, h - 8, 6, 8);
  g.fillRect(w - 14, h - 8, 6, 8);
  // Base frame
  g.fillStyle(0x1a237e);
  g.fillRect(4, 30, w - 8, h - 38);
  // Backrest
  g.fillStyle(0x283593);
  g.fillRect(6, 6, w - 12, 28);
  // Three seat cushions
  g.fillStyle(0x3949ab);
  const cushionW = (w - 16) / 3 - 4;
  for (let i = 0; i < 3; i++) {
    const cx = 10 + i * ((w - 20) / 3);
    g.fillRect(cx, 26, cushionW, 16);
  }
  // Cushion highlights
  g.fillStyle(0x5c6bc0, 0.6);
  for (let i = 0; i < 3; i++) {
    const cx = 10 + i * ((w - 20) / 3);
    g.fillRect(cx + 2, 28, cushionW - 4, 2);
  }
  // Arms
  g.fillStyle(0x1a237e);
  g.fillRect(0, 20, 8, h - 28);
  g.fillRect(w - 8, 20, 8, h - 28);
  g.fillStyle(0x283593);
  g.fillRect(0, 16, 8, 6);
  g.fillRect(w - 8, 16, 8, 6);

  g.generateTexture('sofa', w, h);
  g.destroy();
}

function generateCoffeeTable(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 48, h = 28;

  // Glass top
  g.fillStyle(0x455a64);
  g.fillRect(0, 6, w, 6);
  g.fillStyle(0x607d8b, 0.6);
  g.fillRect(2, 7, w - 4, 2);
  // Top edge
  g.fillStyle(0x263238);
  g.fillRect(0, 4, w, 2);
  // Legs
  g.fillStyle(0x3e2723);
  g.fillRect(4, 12, 4, h - 12);
  g.fillRect(w - 8, 12, 4, h - 12);
  // Lower shelf
  g.fillStyle(0x5d4037);
  g.fillRect(6, 20, w - 12, 3);

  g.generateTexture('coffee_table', w, h);
  g.destroy();
}

function generateFloorLamp(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 24, h = 96;

  // Base
  g.fillStyle(0x263238);
  g.fillRect(4, h - 6, w - 8, 6);
  g.fillStyle(0x455a64);
  g.fillRect(8, h - 8, w - 16, 2);
  // Pole
  g.fillStyle(0x37474f);
  g.fillRect(w / 2 - 1, 24, 2, h - 32);
  // Shade
  g.fillStyle(0xe6c37a);
  g.fillTriangle(w / 2, 4, 2, 26, w - 2, 26);
  g.fillStyle(0xffe0a3, 0.8);
  g.fillTriangle(w / 2, 8, 6, 24, w - 6, 24);
  // Warm glow hint
  g.fillStyle(0xffcc66, 0.4);
  g.fillRect(4, 26, w - 8, 2);

  g.generateTexture('floor_lamp', w, h);
  g.destroy();
}

function generateWelcomeMat(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 100, h = 16;

  // Base
  g.fillStyle(0x3e2723);
  g.fillRect(0, 2, w, h - 4);
  // Stitched border
  g.lineStyle(1, 0x6d4c41, 0.9);
  g.strokeRect(2, 4, w - 4, h - 8);
  // Centre stripe
  g.fillStyle(0x5d4037);
  g.fillRect(6, 7, w - 12, 2);
  // Tassels
  g.fillStyle(0x8d6e63);
  for (let x = 4; x < w; x += 6) {
    g.fillRect(x, 0, 2, 2);
    g.fillRect(x, h - 2, 2, 2);
  }

  g.generateTexture('welcome_mat', w, h);
  g.destroy();
}
