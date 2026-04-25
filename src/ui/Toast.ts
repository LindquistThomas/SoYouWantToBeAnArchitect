import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { theme } from '../style/theme';

const TOAST_DURATION_MS = 5_000;
const TOAST_FADE_IN_MS = 200;
const TOAST_FADE_OUT_MS = 300;
const TOAST_WIDTH = 400;
const TOAST_HEIGHT = 56;
const TOAST_MARGIN = 16;
const TOAST_DEPTH = 200;
const TOAST_PADDING_X = 12;

/**
 * Corner-of-screen notification toast.
 *
 * Shows a message for {@link TOAST_DURATION_MS} ms then fades out.
 * If `show()` is called while a toast is visible the timer resets and
 * the message updates — only one toast is shown at a time.
 */
export class Toast {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private dismissTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const x = GAME_WIDTH - TOAST_WIDTH - TOAST_MARGIN;
    const y = GAME_HEIGHT - TOAST_HEIGHT - TOAST_MARGIN;

    this.container = scene.add
      .container(x, y)
      .setDepth(TOAST_DEPTH)
      .setScrollFactor(0);

    this.bg = scene.add.graphics();
    this.label = scene.add.text(TOAST_PADDING_X, TOAST_HEIGHT / 2, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: theme.color.css.textPrimary,
      wordWrap: { width: TOAST_WIDTH - TOAST_PADDING_X * 2 },
    }).setOrigin(0, 0.5);

    this.container.add([this.bg, this.label]);

    // Start invisible
    this.container.setVisible(false);
  }

  /** Display `message` for {@link TOAST_DURATION_MS} ms. Resets if already showing. */
  show(message: string): void {
    this.label.setText(message);
    this.redrawBg();

    this.dismissTimer?.remove();
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: TOAST_FADE_IN_MS,
      ease: 'Sine.easeOut',
    });

    this.dismissTimer = this.scene.time.delayedCall(TOAST_DURATION_MS, () => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: TOAST_FADE_OUT_MS,
        ease: 'Sine.easeIn',
        onComplete: () => { this.container.setVisible(false); },
      });
    });
  }

  private redrawBg(): void {
    const g = this.bg;
    g.clear();
    g.fillStyle(0x1a0505, 0.93);
    g.fillRoundedRect(0, 0, TOAST_WIDTH, TOAST_HEIGHT, 6);
    g.lineStyle(1.5, theme.color.status.warning, 0.85);
    g.strokeRoundedRect(0, 0, TOAST_WIDTH, TOAST_HEIGHT, 6);
  }

  /** Returns whether the toast container is currently visible. */
  isVisible(): boolean {
    return this.container.visible;
  }

  /** Returns the currently displayed message (empty string when hidden). */
  getMessage(): string {
    return this.label.text;
  }
}
