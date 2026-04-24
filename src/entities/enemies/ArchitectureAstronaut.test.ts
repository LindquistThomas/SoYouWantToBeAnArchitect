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

import { ArchitectureAstronaut } from './ArchitectureAstronaut';

describe('ArchitectureAstronaut', () => {
  it('is stompable, hovers (gravity off), and starts moving forward', () => {
    const scene = createFakeScene();
    const a = new ArchitectureAstronaut(scene as unknown as Phaser.Scene, 500, 600, {
      minX: 300, maxX: 700, speed: 60,
    });
    expect(a.canBeStomped).toBe(true);
    expect((a.body as ReturnType<typeof makeFakeBody>).setAllowGravity).toHaveBeenCalledWith(false);
    expect((a.body as { velocity: { x: number } }).velocity.x).toBe(60);
  });

  it('flips at bounds', () => {
    const scene = createFakeScene();
    const a = new ArchitectureAstronaut(scene as unknown as Phaser.Scene, 500, 600, {
      minX: 300, maxX: 700, speed: 60,
    });
    a.x = 700;
    (a.body as { velocity: { x: number } }).velocity.x = 60;
    a.update();
    expect((a.body as { velocity: { x: number } }).velocity.x).toBe(-60);

    a.x = 300;
    (a.body as { velocity: { x: number } }).velocity.x = -60;
    a.update();
    expect((a.body as { velocity: { x: number } }).velocity.x).toBe(60);
  });

  it('defaults speed to 60', () => {
    const scene = createFakeScene();
    const a = new ArchitectureAstronaut(scene as unknown as Phaser.Scene, 500, 600, {
      minX: 300, maxX: 700,
    });
    expect((a.body as { velocity: { x: number } }).velocity.x).toBe(60);
  });

  it('update() is a no-op once defeated', () => {
    const scene = createFakeScene();
    const a = new ArchitectureAstronaut(scene as unknown as Phaser.Scene, 500, 600);
    a.defeated = true;
    a.x = 700;
    (a.body as { velocity: { x: number } }).velocity.x = 60;
    a.update();
    expect((a.body as { velocity: { x: number } }).velocity.x).toBe(60);
  });
});
