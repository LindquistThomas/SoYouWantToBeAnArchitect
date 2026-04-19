import { describe, it, expect } from 'vitest';
import { theme, COLORS } from './theme';

describe('theme', () => {
  it('exposes a stable top-level shape', () => {
    expect(Object.keys(theme).sort()).toEqual(['color', 'space']);
    expect(Object.keys(theme.color).sort()).toEqual([
      'bg', 'css', 'floor', 'status', 'ui',
    ]);
  });

  it('covers every floor in the palette', () => {
    expect(Object.keys(theme.color.floor).sort()).toEqual([
      'business', 'executive', 'lobby', 'platform', 'products',
    ]);
    for (const palette of Object.values(theme.color.floor)) {
      expect(palette).toHaveProperty('platform');
      expect(palette).toHaveProperty('background');
      expect(palette).toHaveProperty('wall');
      expect(palette).toHaveProperty('token');
    }
  });

  it('exposes standard spacing steps', () => {
    expect(theme.space).toEqual({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 });
  });

  it('keeps numeric and css siblings in sync for shared colours', () => {
    // Title / accent share a hex on both sides of the numeric/css divide.
    expect(theme.color.css.textAccent).toBe('#00d4ff');
    expect(theme.color.ui.accent).toBe(0x00d4ff);
  });

  it('legacy COLORS shim routes through theme tokens', () => {
    expect(COLORS.background).toBe(theme.color.bg.default);
    expect(COLORS.elevatorShaft).toBe(theme.color.bg.shaft);
    expect(COLORS.elevatorPlatform).toBe(theme.color.ui.panel);
    expect(COLORS.floorUnlocked).toBe(theme.color.status.unlocked);
    expect(COLORS.floorLocked).toBe(theme.color.status.locked);
    expect(COLORS.token).toBe(theme.color.ui.token);
    expect(COLORS.hudBackground).toBe(theme.color.bg.dark);
    expect(COLORS.hudText).toBe(theme.color.css.textPrimary);
    expect(COLORS.titleText).toBe(theme.color.css.textTitle);
    expect(COLORS.menuText).toBe(theme.color.css.textWhite);
  });
});
