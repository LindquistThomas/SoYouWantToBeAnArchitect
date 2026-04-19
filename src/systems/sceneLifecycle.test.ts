import { describe, it, expect, vi } from 'vitest';
import { createSceneLifecycle } from './sceneLifecycle';
import { eventBus } from './EventBus';

type Listener = (...args: unknown[]) => void;

interface FakeScene {
  events: {
    once: (event: string, fn: Listener) => void;
    emit: (event: string) => void;
  };
  inputs: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };
}

/**
 * Build a test-only stub mimicking just the slice of Phaser.Scene that
 * createSceneLifecycle consumes. Keeps us clear of the full Phaser mock
 * gymnastics InputService.test.ts needs.
 */
function makeScene(): FakeScene {
  const onceHandlers: Record<string, Listener[]> = {};
  return {
    events: {
      once(event, fn) {
        (onceHandlers[event] ??= []).push(fn);
      },
      emit(event) {
        const list = onceHandlers[event] ?? [];
        onceHandlers[event] = [];
        for (const fn of list) fn();
      },
    },
    inputs: {
      on: vi.fn(),
      off: vi.fn(),
    },
  };
}

describe('sceneLifecycle', () => {
  it('runs disposers in LIFO order on shutdown', () => {
    const scene = makeScene();
    const order: number[] = [];
    const lifecycle = createSceneLifecycle(scene as never);

    lifecycle.add(() => order.push(1));
    lifecycle.add(() => order.push(2));
    lifecycle.add(() => order.push(3));

    scene.events.emit('shutdown');
    expect(order).toEqual([3, 2, 1]);
  });

  it('also flushes on destroy (for scenes that skip shutdown)', () => {
    const scene = makeScene();
    const dispose = vi.fn();
    const lifecycle = createSceneLifecycle(scene as never);
    lifecycle.add(dispose);

    scene.events.emit('destroy');
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('is idempotent: dispose() runs each callback at most once', () => {
    const scene = makeScene();
    const dispose = vi.fn();
    const lifecycle = createSceneLifecycle(scene as never);
    lifecycle.add(dispose);

    lifecycle.dispose();
    lifecycle.dispose();
    scene.events.emit('shutdown');

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('runs disposers registered after dispose() synchronously', () => {
    const scene = makeScene();
    const lifecycle = createSceneLifecycle(scene as never);
    lifecycle.dispose();

    const late = vi.fn();
    lifecycle.add(late);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('swallows exceptions from disposers so teardown continues', () => {
    const scene = makeScene();
    const good = vi.fn();
    const lifecycle = createSceneLifecycle(scene as never);

    lifecycle.add(good);
    lifecycle.add(() => { throw new Error('boom'); });

    expect(() => scene.events.emit('shutdown')).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });

  it('bindEventBus subscribes and auto-unsubscribes on shutdown', () => {
    const scene = makeScene();
    const lifecycle = createSceneLifecycle(scene as never);
    const handler = vi.fn();

    lifecycle.bindEventBus('zone:enter', handler);
    eventBus.emit('zone:enter', 'z-test-1');
    expect(handler).toHaveBeenCalledTimes(1);

    scene.events.emit('shutdown');
    eventBus.emit('zone:enter', 'z-test-2');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('bindInput wires scene.inputs.on and scene.inputs.off on shutdown', () => {
    const scene = makeScene();
    const lifecycle = createSceneLifecycle(scene as never);
    const handler = vi.fn();

    lifecycle.bindInput('Confirm', handler);
    expect(scene.inputs.on).toHaveBeenCalledWith('Confirm', handler);
    expect(scene.inputs.off).not.toHaveBeenCalled();

    scene.events.emit('shutdown');
    expect(scene.inputs.off).toHaveBeenCalledWith('Confirm', handler);
  });
});
