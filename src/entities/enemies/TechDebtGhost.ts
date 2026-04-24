import * as Phaser from 'phaser';
import { Enemy } from '../Enemy';

/**
 * Tech Debt Ghost — spectral drifter. Can't be stomped, phases through
 * platforms and catwalks so hiding on a walkway won't save you. Damage-
 * only; the player has to out-time it.
 */
export class TechDebtGhost extends Enemy {
  private minX: number;
  private maxX: number;
  private speed: number;
  private baseY: number;
  private wobblePhase = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    opts: { minX: number; maxX: number; speed?: number } = { minX: x - 200, maxX: x + 200 },
  ) {
    super(scene, x, y, 'enemy_tech_debt_ghost');
    this.canBeStomped = false;
    this.hitCost = 1;
    this.collidesWithLevel = false;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
    this.speed = opts.speed ?? 40;
    this.baseY = y;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(30, 34);
    body.setOffset(4, 6);

    this.setAlpha(0.85);
    scene.tweens.add({
      targets: this,
      alpha: 0.55,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.setVelocityX(this.speed);
  }

  override update(_time: number, delta: number): void {
    if (this.defeated) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.x <= this.minX && body.velocity.x < 0) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else if (this.x >= this.maxX && body.velocity.x > 0) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    }

    this.wobblePhase += delta * 0.004;
    this.y = this.baseY + Math.sin(this.wobblePhase) * 14;
  }
}
