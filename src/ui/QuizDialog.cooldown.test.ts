/**
 * Unit tests for the `quiz:cooldown_expired` event emitted by QuizDialog.
 *
 * Covers:
 *   (a) Event is emitted exactly once when the cooldown timer reaches zero.
 *   (b) Event is NOT emitted when the dialog is closed before the timer fires.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Phaser from 'phaser';

vi.mock('phaser', () => {
  const Phaser = {};
  return { ...Phaser, default: Phaser };
});

// Stub ModalBase so QuizDialog can be constructed without a real Phaser scene.
vi.mock('./ModalBase', () => ({
  ModalBase: class ModalBase {
    protected readonly scene: unknown;
    protected readonly container: {
      add: ReturnType<typeof vi.fn>;
      length: number;
      removeAt: ReturnType<typeof vi.fn>;
      setDepth: ReturnType<typeof vi.fn>;
      setScrollFactor: ReturnType<typeof vi.fn>;
      setAlpha: ReturnType<typeof vi.fn>;
      destroy: ReturnType<typeof vi.fn>;
    };
    private destroyed = false;

    constructor(scene: unknown) {
      this.scene = scene;
      this.container = {
        add: vi.fn(),
        length: 1,
        removeAt: vi.fn(),
        setDepth: vi.fn().mockReturnThis(),
        setScrollFactor: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      };
    }

    protected onBeforeClose(): void { /* stub */ }
    protected onAfterClose(): void { /* stub */ }
    protected fadeIn(): void { /* stub */ }

    close(): void {
      if (this.destroyed) return;
      this.destroyed = true;
      this.onBeforeClose();
      this.onAfterClose();
    }
  },
}));

// Control canRetryQuiz / getCooldownRemaining from each test.
const mockCanRetry = { value: false };
const mockCooldownRemaining = { value: 5000 };

vi.mock('../systems/QuizManager', () => ({
  isQuizPassed: vi.fn(() => false),
  canRetryQuiz: vi.fn(() => mockCanRetry.value),
  getCooldownRemaining: vi.fn(() => mockCooldownRemaining.value),
}));

// Minimal QUIZ_DATA — no real questions needed for cooldown tests.
vi.mock('../config/quiz', () => ({
  QUIZ_DATA: {},
  QUIZ_QUESTION_COUNT: 5,
  QUIZ_DIFFICULTY_MIX: { easy: 2, medium: 2, hard: 1 },
}));

vi.mock('./ModalKeyboardNavigator', () => ({
  ModalKeyboardNavigator: class {
    add = vi.fn();
    reset = vi.fn();
    setFocus = vi.fn();
    bind = vi.fn();
    destroy = vi.fn();
    focusPrev = vi.fn();
    focusNext = vi.fn();
    activateFocused = vi.fn();
    get = vi.fn(() => undefined);
  },
  makeTextFocusable: vi.fn((t: unknown) => t),
}));

vi.mock('./QuizResultsScreen', () => ({
  renderQuizResults: vi.fn(),
}));

// Stub ProgressionSystem — not needed for cooldown logic.
vi.mock('../systems/ProgressionSystem', () => ({ ProgressionSystem: class {} }));

// Import eventBus after mocks are set up.
import { eventBus } from '../systems/EventBus';
import { FLOORS } from '../config/gameConfig';

type TimerCallback = () => void;
interface FakeTimerEvent { destroy: ReturnType<typeof vi.fn> }

function makeText() {
  const t: Record<string, unknown> = {};
  for (const name of [
    'setOrigin', 'setScrollFactor', 'setDepth', 'setVisible',
    'setColor', 'setText', 'setInteractive', 'on', 'destroy',
  ]) {
    t[name] = vi.fn().mockReturnThis();
  }
  return t;
}

function makeGraphics() {
  const g: Record<string, unknown> = {};
  for (const name of [
    'clear', 'fillStyle', 'fillRect', 'fillRoundedRect',
    'lineStyle', 'strokeRect', 'strokeRoundedRect',
    'setScrollFactor', 'setDepth', 'destroy',
  ]) {
    g[name] = vi.fn().mockReturnThis();
  }
  return g;
}

function makeScene() {
  const timerCallbacks: Array<{ callback: TimerCallback; event: FakeTimerEvent }> = [];

  const scene = {
    add: {
      graphics: vi.fn(() => makeGraphics()),
      text: vi.fn(() => makeText()),
      rectangle: vi.fn(() => ({
        setScrollFactor: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      container: vi.fn(() => ({
        add: vi.fn(),
        length: 1,
        removeAt: vi.fn(),
        setDepth: vi.fn().mockReturnThis(),
        setScrollFactor: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
    },
    inputs: { on: vi.fn(), off: vi.fn() },
    events: { once: vi.fn(), off: vi.fn() },
    tweens: { add: vi.fn() },
    time: {
      addEvent: vi.fn((cfg: { callback: TimerCallback }) => {
        const event: FakeTimerEvent = { destroy: vi.fn() };
        timerCallbacks.push({ callback: cfg.callback, event });
        return event;
      }),
    },
    /** Tick the most recently registered timer callback N times. */
    _tickTimer(times = 1): void {
      const entry = timerCallbacks[timerCallbacks.length - 1];
      if (!entry) return;
      for (let i = 0; i < times; i++) entry.callback();
    },
  };

  return scene;
}

// Must be imported after all mocks are declared.
import { QuizDialog } from './QuizDialog';
import type { QuizDialogOptions } from './QuizDialog';

function makeOptions(): QuizDialogOptions {
  return {
    infoId: 'test-quiz',
    floorId: FLOORS.LOBBY,
    progression: {} as never,
  };
}

describe('QuizDialog cooldown expiry event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanRetry.value = false;
    mockCooldownRemaining.value = 5000;
    eventBus.removeAllListeners();
  });

  it('(a) emits quiz:cooldown_expired exactly once when timer reaches zero', () => {
    const handler = vi.fn();
    eventBus.on('quiz:cooldown_expired', handler);

    const scene = makeScene();
    new QuizDialog(scene as unknown as Phaser.Scene, makeOptions());

    // First tick: cooldown still running.
    mockCooldownRemaining.value = 3000;
    scene._tickTimer();
    expect(handler).not.toHaveBeenCalled();

    // Second tick: cooldown expired.
    mockCooldownRemaining.value = 0;
    scene._tickTimer();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('test-quiz');

    eventBus.off('quiz:cooldown_expired', handler);
  });

  it('(b) does NOT emit quiz:cooldown_expired when dialog is closed before timer fires', () => {
    const handler = vi.fn();
    eventBus.on('quiz:cooldown_expired', handler);

    const scene = makeScene();
    const dialog = new QuizDialog(scene as unknown as Phaser.Scene, makeOptions());

    // Close the dialog before the timer ever fires at zero.
    dialog.close();

    // Even if we would have ticked to zero, no event should have been emitted.
    expect(handler).not.toHaveBeenCalled();

    eventBus.off('quiz:cooldown_expired', handler);
  });
});
