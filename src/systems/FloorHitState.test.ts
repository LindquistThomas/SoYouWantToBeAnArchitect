import { describe, expect, it } from 'vitest';
import { FloorHitState } from './FloorHitState';

describe('FloorHitState', () => {
  it('starts with zero hits and no checkpoint', () => {
    const state = new FloorHitState();
    expect(state.getHitCount()).toBe(0);
    expect(state.getCheckpointPos()).toBeNull();
    expect(state.isDangerZone()).toBe(false);
  });

  it('recordHit increments the counter and returns false before the threshold', () => {
    const state = new FloorHitState();
    expect(state.recordHit()).toBe(false); // 1st hit
    expect(state.getHitCount()).toBe(1);
    expect(state.recordHit()).toBe(false); // 2nd hit
    expect(state.getHitCount()).toBe(2);
  });

  it('recordHit returns true on the 3rd hit (RESPAWN_HIT_THRESHOLD)', () => {
    const state = new FloorHitState();
    state.recordHit();
    state.recordHit();
    expect(state.recordHit()).toBe(true); // 3rd hit triggers respawn
    expect(state.getHitCount()).toBe(3);
  });

  it('isDangerZone is true at RESPAWN_HIT_THRESHOLD - 1 hits', () => {
    const state = new FloorHitState();
    expect(state.isDangerZone()).toBe(false);
    state.recordHit();
    expect(state.isDangerZone()).toBe(false); // 1 hit — not yet in danger
    state.recordHit();
    // 2 hits = RESPAWN_HIT_THRESHOLD - 1
    expect(state.isDangerZone()).toBe(true);
  });

  it('registerCheckpoint stores position and getCheckpointPos returns a copy', () => {
    const state = new FloorHitState();
    state.registerCheckpoint(400, 300);
    const pos = state.getCheckpointPos();
    expect(pos).toEqual({ x: 400, y: 300 });

    // Mutating the returned object must not affect internal state.
    pos!.x = 0;
    expect(state.getCheckpointPos()).toEqual({ x: 400, y: 300 });
  });

  it('registerCheckpoint overwrites the previous checkpoint', () => {
    const state = new FloorHitState();
    state.registerCheckpoint(100, 200);
    state.registerCheckpoint(500, 600);
    expect(state.getCheckpointPos()).toEqual({ x: 500, y: 600 });
  });

  it('reset clears hitCount and checkpointPos', () => {
    const state = new FloorHitState();
    state.recordHit();
    state.recordHit();
    state.registerCheckpoint(100, 200);

    state.reset();

    expect(state.getHitCount()).toBe(0);
    expect(state.getCheckpointPos()).toBeNull();
    expect(state.isDangerZone()).toBe(false);
  });

  it('RESPAWN_HIT_THRESHOLD is 3', () => {
    expect(FloorHitState.RESPAWN_HIT_THRESHOLD).toBe(3);
  });
});
