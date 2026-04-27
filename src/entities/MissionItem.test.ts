import { describe, it, expect, vi } from 'vitest';
import { createFakeScene, type FakeScene } from '../../tests/helpers/phaserMock';
import type * as Phaser from 'phaser';

vi.mock('phaser', () => {
  class Sprite {
    scene: unknown;
    x: number;
    y: number;
    body: { enable: boolean } = { enable: true };
    depth = 0;

    constructor(scene: unknown, x: number, y: number) {
      this.scene = scene;
      this.x = x;
      this.y = y;
    }

    setDepth(depth: number) { this.depth = depth; return this; }
    destroy() { /* no-op */ }
  }

  const Phaser = { Physics: { Arcade: { Sprite } } };
  return { ...Phaser, default: Phaser };
});

import { MissionItem } from './MissionItem';

function makeMissionItem(id: 'pistol' | 'keycard' | 'bomb_code' = 'pistol'): { scene: FakeScene; item: MissionItem } {
  const scene = createFakeScene();
  const item = new MissionItem(scene as unknown as Phaser.Scene, 200, 300, `item_${id}`, id);
  return { scene, item };
}

describe('MissionItem', () => {
  it('creates with correct itemId and static body', () => {
    const { scene, item } = makeMissionItem('keycard');

    expect(item.itemId).toBe('keycard');
    expect(scene.add.existing).toHaveBeenCalledWith(item);
    expect(scene.physics.add.existing).toHaveBeenCalledWith(item, true);
    expect((item as unknown as { depth: number }).depth).toBe(5);
  });

  it('creates float and pulse tweens', () => {
    const { scene } = makeMissionItem();
    const addTween = scene.tweens.add as unknown as ReturnType<typeof vi.fn>;
    expect(addTween).toHaveBeenCalledTimes(2);
  });

  it('isCollected() returns false initially', () => {
    const { item } = makeMissionItem();
    expect(item.isCollected()).toBe(false);
  });

  it('collect() returns true and sets collected state', () => {
    const { item } = makeMissionItem();
    const result = item.collect();
    expect(result).toBe(true);
    expect(item.isCollected()).toBe(true);
  });

  it('collect() disables body and stops tweens', () => {
    const { scene, item } = makeMissionItem();
    item.collect();
    expect((item.body as { enable: boolean }).enable).toBe(false);
    expect(scene.tweens.killTweensOf).toHaveBeenCalledWith(item);
  });

  it('collect() is idempotent — second call returns false', () => {
    const { scene, item } = makeMissionItem();
    const addTween = scene.tweens.add as unknown as ReturnType<typeof vi.fn>;

    item.collect();
    const countAfterFirst = addTween.mock.calls.length;
    const result = item.collect();

    expect(result).toBe(false);
    expect(addTween.mock.calls.length).toBe(countAfterFirst);
  });

  it('collect() queues a fade-out tween that calls destroy', () => {
    const { scene, item } = makeMissionItem();
    const addTween = scene.tweens.add as unknown as ReturnType<typeof vi.fn>;
    const destroy = vi.spyOn(item as unknown as { destroy: () => void }, 'destroy');

    item.collect();

    const lastResult = addTween.mock.results[addTween.mock.results.length - 1];
    const fadeTween = lastResult?.value as { onComplete?: () => void } | undefined;
    expect(fadeTween).toBeDefined();
    fadeTween?.onComplete?.();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('works for all three item types', () => {
    for (const id of ['pistol', 'keycard', 'bomb_code'] as const) {
      const { item } = makeMissionItem(id);
      expect(item.itemId).toBe(id);
      expect(item.collect()).toBe(true);
    }
  });
});
