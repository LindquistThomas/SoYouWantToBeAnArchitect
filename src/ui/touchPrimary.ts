/**
 * Touch-primary detection helper.
 *
 * Extracted as its own module so both `VirtualGamepad` and `TouchHintOverlay`
 * can import it without creating a circular dependency.
 *
 * Returns `true` when the current device is touch-primary (i.e. a phone or
 * tablet with no precision pointer). The result can be overridden by the user
 * via `localStorage` under the key `architect_touch_override_v1`:
 *   - `"true"`  → always show the virtual pad
 *   - `"false"` → never show the virtual pad
 */
export function isTouchPrimary(): boolean {
  const override = localStorage.getItem('architect_touch_override_v1');
  if (override === 'true') return true;
  if (override === 'false') return false;
  return 'ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches;
}
