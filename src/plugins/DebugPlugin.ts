import * as Phaser from 'phaser';

/**
 * ScenePlugin that adds a toggleable debug overlay (press D).
 *
 * When active:
 *  - Draws bounding boxes for all physics bodies (red = dynamic, green = static)
 *  - Labels the player and elevator bodies with position/size info
 *  - Shows FPS counter in the top-left corner
 */
export class DebugPlugin extends Phaser.Plugins.ScenePlugin {
  private fpsText?: Phaser.GameObjects.Text;
  private debugKey?: Phaser.Input.Keyboard.Key;
  private active = false;
  private gfx?: Phaser.GameObjects.Graphics;

  boot(): void {
    const events = this.systems!.events;
    events.on('start', this.onSceneStart, this);
    events.once('destroy', this.onSceneDestroy, this);
  }

  private onSceneStart(): void {
    const events = this.systems!.events;
    events.on('update', this.onUpdate, this);
    events.once('shutdown', this.onShutdown, this);

    this.active = !!this.game?.registry.get('debug_mode');

    this.debugKey = this.scene?.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.D,
      false,
    );

    this.createOverlay();
    this.applyDebugState();
  }

  private createOverlay(): void {
    if (!this.scene) return;
    this.gfx = this.scene.add.graphics().setDepth(998);
    this.fpsText = this.scene.add.text(8, 8, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ff4444',
      backgroundColor: '#00000099',
      padding: { x: 6, y: 3 },
    })
      .setDepth(999)
      .setScrollFactor(0)
      .setVisible(this.active);
  }

  private applyDebugState(): void {
    this.fpsText?.setVisible(this.active);
    this.gfx?.setVisible(this.active);
    if (!this.active) this.gfx?.clear();
  }

  private getWorld(): Phaser.Physics.Arcade.World | undefined {
    return (this.scene as unknown as { physics: Phaser.Physics.Arcade.ArcadePhysics })
      ?.physics?.world;
  }

  private drawBodies(): void {
    const world = this.getWorld();
    const g = this.gfx;
    if (!world || !g) return;
    g.clear();

    // Static bodies — green outlines
    for (const b of world.staticBodies.entries) {
      const body = b as Phaser.Physics.Arcade.StaticBody;
      g.lineStyle(2, 0x00ff00, 0.8);
      g.strokeRect(body.x, body.y, body.width, body.height);
    }

    // Dynamic bodies — red outlines with labels
    for (const b of world.bodies.entries) {
      const body = b as Phaser.Physics.Arcade.Body;
      g.lineStyle(2, 0xff0000, 0.9);
      g.strokeRect(body.x, body.y, body.width, body.height);

      // Velocity indicator
      if (body.velocity.x !== 0 || body.velocity.y !== 0) {
        g.lineStyle(1, 0xffff00, 0.7);
        const cx = body.x + body.width / 2;
        const cy = body.y + body.height / 2;
        g.lineBetween(cx, cy, cx + body.velocity.x * 0.1, cy + body.velocity.y * 0.1);
      }
    }
  }

  private onUpdate(): void {
    if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.active = !this.active;
      this.game?.registry.set('debug_mode', this.active);
      this.applyDebugState();
    }

    if (this.active && this.game) {
      this.drawBodies();

      if (this.fpsText) {
        const fps = Math.round(this.game.loop.actualFps);
        this.fpsText.setText(`FPS: ${fps}`);
      }
    }
  }

  private onShutdown(): void {
    this.systems?.events.off('update', this.onUpdate, this);
    this.fpsText?.destroy();
    this.fpsText = undefined;
    this.gfx?.destroy();
    this.gfx = undefined;
    this.debugKey = undefined;
  }

  private onSceneDestroy(): void {
    this.onShutdown();
    this.systems?.events.off('start', this.onSceneStart, this);
  }
}
