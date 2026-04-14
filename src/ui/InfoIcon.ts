import * as Phaser from 'phaser';

/**
 * Small clickable "i" icon that pulses gently.
 * Click or press I to trigger the callback.
 */
export class InfoIcon {
  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private pulseTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(55);
    this.container.setScrollFactor(0);

    // Circle background
    const circle = scene.add.graphics();
    circle.fillStyle(0x0a0a2a, 0.85);
    circle.fillCircle(0, 0, 14);
    circle.lineStyle(1.5, 0x00aaff, 0.7);
    circle.strokeCircle(0, 0, 14);
    this.container.add(circle);

    // "i" letter
    const label = scene.add.text(0, 0, 'i', {
      fontFamily: 'monospace', fontSize: '16px',
      color: '#00aaff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(label);

    // Hit area
    const hitArea = scene.add.rectangle(0, 0, 32, 32)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hitArea.on('pointerover', () => label.setColor('#88ddff'));
    hitArea.on('pointerout', () => label.setColor('#00aaff'));
    hitArea.on('pointerdown', () => onClick());
    this.container.add(hitArea);

    // Subtle pulse
    this.pulseTween = scene.tweens.add({
      targets: this.container, alpha: { from: 1, to: 0.55 },
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.pulseTween.destroy();
    this.container.destroy();
  }
}
