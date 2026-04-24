import { describe, it, expect, vi } from 'vitest';
import { createFakeScene, createFakeBody } from '../../../tests/helpers/phaserMock';
import type * as Phaser from 'phaser';

function makeFakeBody() {
  const body = createFakeBody() as ReturnType<typeof createFakeBody> & {
    setSize: (w: number, h: number) => unknown;
    setOffset: (x: number, y: number) => unknown;
    setCollideWorldBounds: (b: boolean) => unknown;
  };
  body.setSize = vi.fn(() => body);
  body.setOffset = vi.fn(() => body);
  body.setCollideWorldBounds = vi.fn(() => body);
  return body;
}

vi.mock('phaser', () => {
  class Sprite {
    scene: unknown;
    x: number;
    y: number;
    body = makeFakeBody();
    constructor(scene: unknown, x: number, y: number) {
      this.scene = scene;
      this.x = x;
      this.y = y;
    }
    setDepth() { return this; }
    setAlpha() { return this; }
    setFlipX() { return this; }
    setTintFill() { return this; }
    clearTint() { return this; }
    setVelocityX(v: number) { this.body.velocity.x = v; return this; }
    setVelocityY(v: number) { this.body.velocity.y = v; return this; }
    destroy() { /* no-op */ }
  }
  const Phaser = { Physics: { Arcade: { Sprite } } };
  return { ...Phaser, default: Phaser };
});

import { TechDebtGhost } from './TechDebtGhost';

describe('TechDebtGhost', () => {
  it('is not stompable, has no gravity, and phases through the level', () => {
    const scene = createFakeScene();
    const g = new TechDebtGhost(scene as unknown as Phaser.Scene, 700, 420, {
      minX: 400, maxX: 1000, speed: 40,
    });
    expect(g.canBeStomped).toBe(false);
    expect(g.collidesWithLevel).toBe(false);
    expect((g.body as ReturnType<typeof makeFakeBody>).setAllowGravity).toHaveBeenCalledWith(false);
  });

  it('flips horizontal velocity at the bounds', () => {
    const scene = createFakeScene();
    const g = new TechDebtGhost(scene as unknown as Phaser.Scene, 700, 420, {
      minX: 400, maxX: 1000, speed: 40,
    });
    g.x = 1000;
    (g.body as { velocity: { x: number } }).velocity.x = 40;
    g.update(0, 16);
    expect((g.body as { velocity: { x: number } }).velocity.x).toBe(-40);

    g.x = 400;
    (g.body as { velocity: { x: number } }).velocity.x = -40;
    g.update(0, 16);
    expect((g.body as { velocity: { x: number } }).velocity.x).toBe(40);
  });

  it('oscillates y around the base line based on wobble phase', () => {
    const scene = createFakeScene();
    const baseY = 420;
    const g = new TechDebtGhost(scene as unknown as Phaser.Scene, 700, baseY, {
      minX: 400, maxX: 1000,
    });
    // Before any updates, y == baseY.
    expect(g.y).toBe(baseY);
    // Advance wobble phase: after enough delta, y should drift off baseY.
    g.update(0, 1000);
    expect(g.y).not.toBe(baseY);
    // Range should stay within ±14 of baseY.
    expect(Math.abs(g.y - baseY)).toBeLessThanOrEqual(14 + 0.0001);
  });

  it('update() is a no-op once defeated', () => {
    const scene = createFakeScene();
    const g = new TechDebtGhost(scene as unknown as Phaser.Scene, 700, 420);
    const startY = g.y;
    g.defeated = true;
    g.update(0, 1000);
    expect(g.y).toBe(startY);
  });
});
