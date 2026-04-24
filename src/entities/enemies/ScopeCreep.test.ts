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

import { ScopeCreep } from './ScopeCreep';

describe('ScopeCreep', () => {
  it('spawns stompable, with forward velocity and a creep-pulse tween', () => {
    const scene = createFakeScene();
    const creep = new ScopeCreep(scene as unknown as Phaser.Scene, 500, 800, {
      minX: 400, maxX: 600, speed: 35,
    });
    expect(creep.canBeStomped).toBe(true);
    expect(creep.hitCost).toBe(1);
    expect((creep.body as { velocity: { x: number } }).velocity.x).toBe(35);
    const add = scene.tweens.add as unknown as ReturnType<typeof vi.fn>;
    expect(add).toHaveBeenCalled();
  });

  it('flips velocity at the max bound', () => {
    const scene = createFakeScene();
    const creep = new ScopeCreep(scene as unknown as Phaser.Scene, 500, 800, {
      minX: 400, maxX: 600, speed: 40,
    });
    creep.x = 600;
    (creep.body as { velocity: { x: number } }).velocity.x = 40;
    creep.update();
    expect((creep.body as { velocity: { x: number } }).velocity.x).toBe(-40);
  });

  it('flips velocity at the min bound', () => {
    const scene = createFakeScene();
    const creep = new ScopeCreep(scene as unknown as Phaser.Scene, 500, 800, {
      minX: 400, maxX: 600,
    });
    creep.x = 400;
    (creep.body as { velocity: { x: number } }).velocity.x = -35;
    creep.update();
    expect((creep.body as { velocity: { x: number } }).velocity.x).toBe(35);
  });

  it('defaults speed when none supplied', () => {
    const scene = createFakeScene();
    const creep = new ScopeCreep(scene as unknown as Phaser.Scene, 500, 800, {
      minX: 400, maxX: 600,
    });
    expect((creep.body as { velocity: { x: number } }).velocity.x).toBe(35);
  });

  it('update() is a no-op once defeated', () => {
    const scene = createFakeScene();
    const creep = new ScopeCreep(scene as unknown as Phaser.Scene, 500, 800, {
      minX: 400, maxX: 600, speed: 35,
    });
    creep.defeated = true;
    creep.x = 600;
    (creep.body as { velocity: { x: number } }).velocity.x = 35;
    creep.update();
    expect((creep.body as { velocity: { x: number } }).velocity.x).toBe(35);
  });
});
