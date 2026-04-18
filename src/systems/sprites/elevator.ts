import * as Phaser from 'phaser';
import { TILE_SIZE } from '../../config/gameConfig';

/** Elevator: cab platform + concrete shaft wall tile. */
export function generateElevatorSprites(scene: Phaser.Scene): void {
  // --- Cab platform (cyan slab) ---
  const ew = 160;
  const eh = 16;
  const eGfx = scene.make.graphics({ x: 0, y: 0 }, false);
  eGfx.fillStyle(0x00aaff); eGfx.fillRect(0, 0, ew, eh);
  eGfx.fillStyle(0x0088cc); eGfx.fillRect(4, 4, ew - 8, eh - 8);
  eGfx.fillStyle(0x00ccff);
  eGfx.fillRect(0, 0, ew, 3);
  eGfx.fillRect(0, 0, 6, eh);
  eGfx.fillRect(ew - 6, 0, 6, eh);
  eGfx.generateTexture('elevator_platform', ew, eh);
  eGfx.destroy();

  // --- Shaft back-wall tile: weathered concrete with seams and stains ---
  const sw = 200;
  const sh = TILE_SIZE;
  const s = scene.make.graphics({ x: 0, y: 0 }, false);

  // Base concrete
  s.fillStyle(0x2a2a30, 1);
  s.fillRect(0, 0, sw, sh);

  // Subtle vertical panel seams (two columns of formwork)
  s.lineStyle(1, 0x1a1a20, 0.9);
  s.lineBetween(sw / 3, 0, sw / 3, sh);
  s.lineBetween((sw * 2) / 3, 0, (sw * 2) / 3, sh);
  s.lineStyle(1, 0x3a3a44, 0.35);
  s.lineBetween(sw / 3 + 1, 0, sw / 3 + 1, sh);
  s.lineBetween((sw * 2) / 3 + 1, 0, (sw * 2) / 3 + 1, sh);

  // Horizontal pour line mid-tile
  s.lineStyle(1, 0x1a1a20, 0.7);
  s.lineBetween(0, sh / 2, sw, sh / 2);
  s.lineStyle(1, 0x3a3a44, 0.3);
  s.lineBetween(0, sh / 2 + 1, sw, sh / 2 + 1);

  // Speckled aggregate noise
  const rng = (seed: number) => {
    let x = seed | 0;
    return () => {
      x = (x * 1664525 + 1013904223) | 0;
      return ((x >>> 0) % 1000) / 1000;
    };
  };
  const rand = rng(42);
  for (let i = 0; i < 120; i++) {
    const rx = Math.floor(rand() * sw);
    const ry = Math.floor(rand() * sh);
    const shade = rand();
    if (shade < 0.5) s.fillStyle(0x1d1d22, 0.6);
    else if (shade < 0.85) s.fillStyle(0x3a3a44, 0.4);
    else s.fillStyle(0x4a4a56, 0.3);
    s.fillRect(rx, ry, 1, 1);
  }

  // A couple of small cracks/stains
  s.lineStyle(1, 0x15151a, 0.7);
  s.lineBetween(30, 12, 38, 34);
  s.lineBetween(38, 34, 34, 60);
  s.lineBetween(sw - 50, sh - 30, sw - 44, sh - 10);

  // Rust drip under mid seam
  s.fillStyle(0x4a2a1a, 0.35);
  s.fillRect(sw / 3 + 1, sh / 2 + 2, 2, 20);

  s.generateTexture('elevator_shaft', sw, sh);
  s.destroy();
}
