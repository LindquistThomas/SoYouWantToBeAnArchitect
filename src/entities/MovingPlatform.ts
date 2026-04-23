import * as Phaser from 'phaser';

export type MovingPlatformConfig = {
  /** Top-left x of the walking surface at `t=0`. */
  x: number;
  /** Top-y of the walking surface at `t=0`. */
  y: number;
  width: number;
  thickness?: number;
  axis: 'x' | 'y';
  /**
   * Signed travel along the axis from the start position to the far
   * endpoint. Negative values travel up/left, positive down/right.
   */
  distance: number;
  mode: 'bounce' | 'tween';
  /** bounce only (px/s), default 60. */
  speed?: number;
  /** tween only, one-way duration in ms, default 2000. */
  duration?: number;
  /** tween only, default `Sine.inOut`. */
  ease?: string;
  /** tween only, 0..1 delayed-start offset so paired movers can stagger. */
  phase?: number;
};

const DEFAULT_SPEED = 60;
const DEFAULT_DURATION = 2000;
const DEFAULT_THICKNESS = 18;

/**
 * Floating platform the player can stand on.
 *
 * - `mode: 'bounce'` drives motion via Arcade velocity, flipping at the
 *   configured bounds. Mirrors the in-room elevator pattern in LevelScene
 *   so Arcade's built-in carry behaviour moves the player along with it.
 * - `mode: 'tween'` uses a yoyo'ing Phaser tween on the body position.
 *   Smoother ease but the rider is carried by body-delta propagation,
 *   which can micro-separate on direction change.
 *
 * `x` / `y` match `catwalks` semantics: top-left of the walking surface
 * at `t=0`. The platform then travels `distance` px along `axis` before
 * reversing. Negative `distance` travels up/left.
 */
export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  readonly mode: 'bounce' | 'tween';
  private axis: 'x' | 'y';
  private speed: number;
  private direction: 1 | -1;
  private minPos: number;
  private maxPos: number;
  private motionTween?: Phaser.Tweens.Tween;
  private paused = false;
  private pausedVelocity?: { x: number; y: number };

  constructor(scene: Phaser.Scene, cfg: MovingPlatformConfig) {
    const thickness = cfg.thickness ?? DEFAULT_THICKNESS;
    const cx = cfg.x + cfg.width / 2;
    const cy = cfg.y + thickness / 2;
    super(scene, cx, cy, 'moving_platform');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.mode = cfg.mode;
    this.axis = cfg.axis;
    this.speed = cfg.speed ?? DEFAULT_SPEED;
    this.direction = cfg.distance >= 0 ? 1 : -1;

    this.setDepth(3);
    this.setDisplaySize(cfg.width, thickness);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    body.setSize(cfg.width, thickness, true);
    // One-way collision — match the catwalk pattern in LevelScene.buildCatwalks:
    // solid from above (the player lands on top), pass-through from below and
    // the sides so a head-bonk or side-bump doesn't block jumps across a
    // mezzanine gap.
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;

    const startPos = cfg.axis === 'x' ? cx : cy;
    const endPos = startPos + cfg.distance;
    this.minPos = Math.min(startPos, endPos);
    this.maxPos = Math.max(startPos, endPos);

    if (cfg.mode === 'bounce') {
      this.startBounce();
    } else {
      this.startTween(cfg, endPos);
    }
  }

  private startBounce(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.axis === 'x') body.setVelocityX(this.speed * this.direction);
    else body.setVelocityY(this.speed * this.direction);
  }

  private startTween(cfg: MovingPlatformConfig, endPos: number): void {
    const duration = cfg.duration ?? DEFAULT_DURATION;
    const ease = cfg.ease ?? 'Sine.inOut';
    const phase = Phaser.Math.Clamp(cfg.phase ?? 0, 0, 1);
    const prop = this.axis;

    this.motionTween = this.scene.tweens.add({
      targets: this,
      [prop]: endPos,
      duration,
      yoyo: true,
      repeat: -1,
      ease,
      delay: duration * phase,
    });
  }

  /**
   * Freeze motion (velocity snapshot + tween pause). Used so a moving
   * platform doesn't drift out of bounds while a dialog holds the main
   * update loop. Idempotent.
   */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      this.pausedVelocity = { x: body.velocity.x, y: body.velocity.y };
      body.setVelocity(0, 0);
    }
    this.motionTween?.pause();
  }

  /** Restore motion captured by {@link pause}. Idempotent. */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body && this.pausedVelocity) {
      body.setVelocity(this.pausedVelocity.x, this.pausedVelocity.y);
    }
    this.pausedVelocity = undefined;
    this.motionTween?.resume();
  }

  /** Called from LevelScene.update() for bounce-mode instances. */
  update(): void {
    if (this.mode !== 'bounce' || this.paused) return;
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    if (this.axis === 'x') {
      if (this.x <= this.minPos && body.velocity.x < 0) {
        this.x = this.minPos;
        body.setVelocityX(this.speed);
      } else if (this.x >= this.maxPos && body.velocity.x > 0) {
        this.x = this.maxPos;
        body.setVelocityX(-this.speed);
      }
    } else {
      if (this.y <= this.minPos && body.velocity.y < 0) {
        this.y = this.minPos;
        body.setVelocityY(this.speed);
      } else if (this.y >= this.maxPos && body.velocity.y > 0) {
        this.y = this.maxPos;
        body.setVelocityY(-this.speed);
      }
    }
  }

  override destroy(fromScene?: boolean): void {
    this.motionTween?.stop();
    this.motionTween = undefined;
    super.destroy(fromScene);
  }
}
