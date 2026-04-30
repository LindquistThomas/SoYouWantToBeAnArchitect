import { describe, it, expect } from 'vitest';
import { getCoachHint } from './coachHints';
import { FLOORS } from '../../../config/gameConfig';

describe('getCoachHint', () => {
  it('returns a hint string for the Lobby on first visit', () => {
    const hint = getCoachHint(FLOORS.LOBBY, true, false);
    expect(hint).toBeTypeOf('string');
    expect(hint!.length).toBeGreaterThan(0);
  });

  it('returns a hint string for Platform Team on first visit', () => {
    const hint = getCoachHint(FLOORS.PLATFORM_TEAM, true, false);
    expect(hint).toBeTypeOf('string');
    expect(hint!.length).toBeGreaterThan(0);
  });

  it('returns null when isFirstVisit is false (second visit)', () => {
    expect(getCoachHint(FLOORS.LOBBY, false, false)).toBeNull();
    expect(getCoachHint(FLOORS.PLATFORM_TEAM, false, false)).toBeNull();
  });

  it('returns null when hideTutorials is true even on first visit', () => {
    expect(getCoachHint(FLOORS.LOBBY, true, true)).toBeNull();
    expect(getCoachHint(FLOORS.PLATFORM_TEAM, true, true)).toBeNull();
  });

  it('returns null for the Boss floor (no coaching hint defined)', () => {
    expect(getCoachHint(FLOORS.BOSS, true, false)).toBeNull();
  });

  it('hint content is suppressed independently per-flag', () => {
    // Both false → null
    expect(getCoachHint(FLOORS.LOBBY, false, true)).toBeNull();
    // Only first visit matters when hideTutorials is false
    expect(getCoachHint(FLOORS.LOBBY, true, false)).not.toBeNull();
    // hideTutorials overrides even a first visit
    expect(getCoachHint(FLOORS.LOBBY, true, true)).toBeNull();
  });
});
