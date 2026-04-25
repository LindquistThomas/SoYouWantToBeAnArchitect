import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/gameConfig';
import { eventBus } from '../../systems/EventBus';
import { theme } from '../../style/theme';
import { createSceneLifecycle } from '../../systems/sceneLifecycle';

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 280;

/**
 * Full-screen pause overlay launched as a sibling scene alongside any
 * `LevelScene`-derived scene.
 *
 * Flow:
 *   1. Parent level calls `scene.launch('PauseScene', { parentKey })`.
 *   2. `create()` pauses the parent and ducks the music.
 *   3. Resume (Esc / P / button) restores the parent and music.
 *   4. Quit to Menu stops the parent scene and navigates to `MenuScene`.
 */
export class PauseScene extends Phaser.Scene {
  private parentKey = '';

  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data: { parentKey: string }): void {
    this.parentKey = data.parentKey;
  }

  create(): void {
    // Pause the parent level scene (stops physics, tweens, update loop).
    this.scene.pause(this.parentKey);
    // Pause music while overlay is shown.
    eventBus.emit('music:pause');

    this.buildOverlay();
    this.buildPanel();

    // Keyboard: Pause action (Esc / P) resumes. Both keys fire 'Pause' in
    // the 'gameplay' context (the default when no other context is pushed),
    // and the parent's InputService is dormant while the scene is paused.
    const lc = createSceneLifecycle(this);
    lc.bindInput('Pause', () => this.resumeGame());
  }

  private buildOverlay(): void {
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      theme.color.bg.dark, 0.65,
    );
    overlay.setScrollFactor(0).setDepth(190);
  }

  private buildPanel(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const container = this.add.container(cx, cy);
    container.setDepth(200);
    container.setScrollFactor(0);

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(theme.color.ui.panel, 0.97);
    panel.fillRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12);
    panel.lineStyle(2, theme.color.ui.border, 0.8);
    panel.strokeRoundedRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 12);
    container.add(panel);

    // Title
    const title = this.add.text(0, -PANEL_HEIGHT / 2 + 44, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: theme.color.css.textAccent,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(title);

    // Divider
    const divider = this.add.graphics();
    divider.lineStyle(1, theme.color.ui.border, 0.4);
    divider.lineBetween(-PANEL_WIDTH / 2 + 24, -PANEL_HEIGHT / 2 + 82, PANEL_WIDTH / 2 - 24, -PANEL_HEIGHT / 2 + 82);
    container.add(divider);

    // Resume button
    const resumeBtn = this.makeButton('Resume  [Esc / P]', 0, 30, () => this.resumeGame());
    container.add(resumeBtn);

    // Quit to Menu button
    const quitBtn = this.makeButton('Quit to Menu', 0, 110, () => this.quitToMenu());
    container.add(quitBtn);

    // Hint text
    const hint = this.add.text(0, PANEL_HEIGHT / 2 - 24, 'Progress is saved automatically', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: theme.color.css.textMuted,
    }).setOrigin(0.5);
    container.add(hint);

    // Fade in
    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 150 });
  }

  private makeButton(
    label: string,
    x: number,
    y: number,
    onPress: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: theme.color.css.textWhite,
      backgroundColor: theme.color.css.bgPanel,
      padding: { x: 24, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor(theme.color.css.textAccent));
    btn.on('pointerout', () => btn.setColor(theme.color.css.textWhite));
    btn.on('pointerdown', onPress);

    return btn;
  }

  private resumeGame(): void {
    eventBus.emit('music:resume');
    this.scene.resume(this.parentKey);
    this.scene.stop();
  }

  private quitToMenu(): void {
    // Stop current music explicitly so there is no gap between the level
    // track stopping and MenuScene's MusicPlugin starting the menu track.
    eventBus.emit('music:stop');
    this.scene.stop(this.parentKey);
    this.scene.start('MenuScene');
  }
}
