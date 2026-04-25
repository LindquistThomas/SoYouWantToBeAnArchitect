/**
 * ARIA live-region bridge.
 *
 * `announce(message)` writes a human-readable message to the off-screen
 * `#game-aria-live` live region so assistive technologies (VoiceOver, NVDA)
 * read it out without moving focus.
 *
 * `initAriaLive()` subscribes to the EventBus events that should be
 * announced (quiz results, floor unlocks, AU milestones). Call it once
 * at game startup.
 */

import { eventBus } from '../systems/EventBus';
import { LEVEL_DATA } from '../config/levelData';

const REGION_ID = 'game-aria-live';

/**
 * Write `message` to the ARIA live region.
 *
 * To force the assistive technology to re-announce a message that is
 * identical to the previous one, the element is briefly cleared before the
 * new text is set (with a 50 ms gap for the DOM mutation to flush).
 */
export function announce(message: string): void {
  const el = document.getElementById(REGION_ID);
  if (!el) return;
  // Clear first to force re-announcement if the same text is repeated.
  el.textContent = '';
  // Small delay so the browser registers two distinct mutations.
  setTimeout(() => {
    el.textContent = message;
  }, 50);
}

/**
 * Subscribe to game events that warrant screen-reader announcements.
 * Intended to be called once from `main.ts` after the game is created.
 *
 * Note: handlers are registered on the singleton `eventBus` and are
 * intentionally long-lived (game lifetime), so no cleanup is needed.
 */
export function initAriaLive(): void {
  eventBus.on('sfx:quiz_success', () => {
    announce('Quiz passed!');
  });

  eventBus.on('sfx:quiz_fail', () => {
    announce('Quiz failed. Read the info text and try again.');
  });

  eventBus.on('progression:floor_unlocked', (floorId) => {
    const entry = Object.values(LEVEL_DATA).find(d => d.id === floorId);
    const name = entry?.name ?? 'a new floor';
    announce(`${name} unlocked!`);
  });

  eventBus.on('progression:au_milestone', (total) => {
    announce(`${total} Architecture Units collected.`);
  });
}
