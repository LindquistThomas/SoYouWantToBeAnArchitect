import { describe, it, expect } from 'vitest';
import { clampRiderToCab } from './elevatorCabGeometry';

// Cab half-width 70, step-out margin 12 → walkable band is [platformX-58, platformX+58].
// Keep these numbers mirrored as literals in the tests so a regression in
// the source constants shows up here rather than silently passing because
// both sides imported the same (possibly wrong) value.
describe('clampRiderToCab', () => {
  it('leaves the player alone when already inside the cab band', () => {
    const r = clampRiderToCab(640, 640);
    expect(r.x).toBe(640);
    expect(r.moved).toBe(false);
  });

  it('clamps to the right edge when the player has walked past it', () => {
    // Standing 80 px past the cab centre, with step-out margin trimming 12 px
    // off the 70 px half-width, the right edge sits at 640 + 58 = 698.
    const r = clampRiderToCab(720, 640);
    expect(r.x).toBe(698);
    expect(r.moved).toBe(true);
  });

  it('clamps to the left edge when the player has walked past it', () => {
    const r = clampRiderToCab(560, 640);
    expect(r.x).toBe(582);
    expect(r.moved).toBe(true);
  });

  it('regression: PR #58 — overshoot past the cab centre snaps back inside the unmount band', () => {
    // Scenario from PR #58: player overshoots the cab centre by ~30 px while
    // decelerating. Without the clamp the next floor-entry check would see
    // dx > PLAT_HW + 10 = 90 and flip playerOnElevator back to false before
    // the cab has a chance to leave the floor.
    const platformX = 640;
    const overshotPlayerX = platformX + 75; // past the 58 px walkable edge
    const r = clampRiderToCab(overshotPlayerX, platformX);
    expect(r.moved).toBe(true);
    expect(r.x).toBe(platformX + 58);
    // The clamped position must be well inside the unmount threshold
    // (PLAT_HW + 10 = 90 px) so the elevator can leave the floor.
    expect(Math.abs(r.x - platformX)).toBeLessThan(90);
  });

  it('is symmetric around the platform', () => {
    const plat = 500;
    const left = clampRiderToCab(plat - 1000, plat);
    const right = clampRiderToCab(plat + 1000, plat);
    expect(plat - left.x).toBe(right.x - plat);
  });
});
