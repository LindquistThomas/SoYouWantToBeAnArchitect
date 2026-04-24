import * as Phaser from 'phaser';
import { Enemy } from '../Enemy';

/**
 * Architecture Astronaut — hovering enemy lost in abstract space.
 *
 * No gravity: patrols horizontally at a fixed altitude with a subtle Y
 * bob. Stompable from above — which means the player has to reach its
 * altitude via a moving platform or catwalk first.
 */
export class ArchitectureAstronaut extends Enemy {
  private minX: number;
  private maxX: number;
  private speed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    opts: { minX: number; maxX: number; speed?: number } = { minX: x - 180, maxX: x + 180 },
  ) {
    super(scene, x, y, 'enemy_astronaut');
    this.canBeStomped = true;
    this.hitCost = 1;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
    this.speed = opts.speed ?? 60;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(34, 40);
    body.setOffset(3, 4);

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 600,
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
