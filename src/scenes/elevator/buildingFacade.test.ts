import { describe, it, expect } from 'vitest';
import { generateFacadeWindows } from './buildingFacade';

describe('generateFacadeWindows', () => {
  it('returns an empty grid if the rectangle is too small for any window', () => {
    expect(generateFacadeWindows(10, 200, 1)).toEqual([]);
    expect(generateFacadeWindows(200, 10, 1)).toEqual([]);
  });

  it('is deterministic per seed', () => {
    const a = generateFacadeWindows(300, 240, 7);
    const b = generateFacadeWindows(300, 240, 7);
    expect(a).toEqual(b);
  });

  it('places every window inside the requested rectangle', () => {
    const W = 300;
    const H = 240;
    const windows = generateFacadeWindows(W, H, 11);
    for (const w of windows) {
      expect(w.x).toBeGreaterThanOrEqual(0);
      expect(w.y).toBeGreaterThanOrEqual(0);
      expect(w.x + w.width).toBeLessThanOrEqual(W);
      expect(w.y + w.height).toBeLessThanOrEqual(H);
      expect(['lit', 'dim', 'dark']).toContain(w.state);
    }
  });

  it('emits a plausible mix of states (dark is majority)', () => {
    // Large rectangle → decent sample size.
    const windows = generateFacadeWindows(600, 480, 42);
    const total = windows.length;
    const lit = windows.filter((w) => w.state === 'lit').length;
    const dim = windows.filter((w) => w.state === 'dim').length;
    const dark = windows.filter((w) => w.state === 'dark').length;
    expect(lit + dim + dark).toBe(total);
    // Allow generous bands for the small-sample xorshift RNG.
    expect(dark / total).toBeGreaterThan(0.35);
    expect(lit / total).toBeLessThan(0.5);
  });

  it('respects the twinkle budget', () => {
    const windows = generateFacadeWindows(600, 480, 3, { twinkles: 2 });
    const twinkles = windows.filter((w) => w.twinkle).length;
    expect(twinkles).toBeLessThanOrEqual(2);
    // Every twinkler must be a lit window.
    for (const w of windows.filter((w) => w.twinkle)) {
      expect(w.state).toBe('lit');
    }
  });

  it('defaults to at most one twinkle when no opts passed', () => {
    const windows = generateFacadeWindows(600, 480, 5);
    const twinkles = windows.filter((w) => w.twinkle).length;
    expect(twinkles).toBeLessThanOrEqual(1);
  });
});
