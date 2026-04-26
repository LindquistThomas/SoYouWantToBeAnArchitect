/**
 * Verifies that ProgressionSystem.defaultState() derives floor maps from
 * Object.values(FLOORS) rather than a hardcoded list, and that the initial
 * unlocked set is derived from LEVEL_DATA entries with auRequired === 0.
 *
 * Uses vi.doMock + vi.resetModules to inject a synthetic floor id (99) that
 * is not present in the real FLOORS constant, then asserts the expected
 * initial state.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FloorId } from '../config/gameConfig';
import type { SaveAdapter } from './ProgressionSystem';

const SYNTH_FLOOR = 99 as FloorId;

const noopSave: SaveAdapter = {
  load: () => null,
  save: () => {},
  clear: () => {},
};

describe('ProgressionSystem — defaultState derivation from FLOORS', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getFloorAU returns 0 (not undefined) for a synthetic floor ID present in FLOORS', async () => {
    vi.doMock('../config/gameConfig', () => ({
      FLOORS: {
        LOBBY: 0,
        PLATFORM_TEAM: 1,
        BUSINESS: 3,
        EXECUTIVE: 4,
        PRODUCTS: 5,
        SYNTHETIC: SYNTH_FLOOR,
      },
    }));

    const { ProgressionSystem } = await import('./ProgressionSystem');
    const p = new ProgressionSystem(noopSave);
    expect(p.getFloorAU(SYNTH_FLOOR)).toBe(0);
  });

  it('isFloorUnlocked returns true for a synthetic floor present in LEVEL_DATA with auRequired=0', async () => {
    vi.doMock('../config/gameConfig', () => ({
      FLOORS: {
        LOBBY: 0,
        PLATFORM_TEAM: 1,
        BUSINESS: 3,
        EXECUTIVE: 4,
        PRODUCTS: 5,
        SYNTHETIC: SYNTH_FLOOR,
      },
    }));
    vi.doMock('../config/levelData', () => ({
      LEVEL_DATA: {
        0: { id: 0, auRequired: 0 },
        1: { id: 1, auRequired: 0 },
        3: { id: 3, auRequired: 10 },
        4: { id: 4, auRequired: 15 },
        5: { id: 5, auRequired: 8 },
        [SYNTH_FLOOR]: { id: SYNTH_FLOOR, auRequired: 0 },
      },
    }));

    const { ProgressionSystem } = await import('./ProgressionSystem');
    const p = new ProgressionSystem(noopSave);
    // Synthetic floor has auRequired=0 so it starts unlocked.
    expect(p.isFloorUnlocked(SYNTH_FLOOR)).toBe(true);
  });

  it('isFloorUnlocked returns false for a synthetic floor with auRequired > 0', async () => {
    vi.doMock('../config/gameConfig', () => ({
      FLOORS: {
        LOBBY: 0,
        PLATFORM_TEAM: 1,
        BUSINESS: 3,
        EXECUTIVE: 4,
        PRODUCTS: 5,
        SYNTHETIC: SYNTH_FLOOR,
      },
    }));
    vi.doMock('../config/levelData', () => ({
      LEVEL_DATA: {
        0: { id: 0, auRequired: 0 },
        1: { id: 1, auRequired: 0 },
        3: { id: 3, auRequired: 10 },
        4: { id: 4, auRequired: 15 },
        5: { id: 5, auRequired: 8 },
        [SYNTH_FLOOR]: { id: SYNTH_FLOOR, auRequired: 5 },
      },
    }));

    const { ProgressionSystem } = await import('./ProgressionSystem');
    const p = new ProgressionSystem(noopSave);
    // Synthetic floor requires AU → starts locked.
    expect(p.isFloorUnlocked(SYNTH_FLOOR)).toBe(false);
  });
});
