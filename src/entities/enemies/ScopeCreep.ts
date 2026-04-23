import * as Phaser from 'phaser';
import { Enemy } from '../Enemy';

/**
 * Scope Creep — oversized, lumbering ground patrol. Stompable but a
 * bigger hitbox than a slime and slower to evade. Thematically: that
 * feature that was supposed to ship last quarter and now eats the roadmap.
 */
export class ScopeCreep extends Enemy {
  private minX: number;
  private maxX: number;
  private speed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    opts: { minX: number; maxX: number; speed?: number } = { minX: x - 160, maxX: x + 160 },
  ) {
    super(scene, x, y, 'enemy_scope_creep');
    this.canBeStomped = true;
    this.hitCost = 1;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
    this.speed = opts.speed ?? 35;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(58, 34);
    body.setOffset(5, 10);

    // Creep pulse — slow, heavier than a slime's bob, so it reads as
    // *growing* rather than bouncing.
    scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 0.92,
      duration: 780,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.setVelocityX(this.speed);
  }

  override update(): void {
    if (this.defeated) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.x <= this.minX && body.velocity.x < 0) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else if (this.x >= this.maxX && body.velocity.x > 0) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    }
  }
}
