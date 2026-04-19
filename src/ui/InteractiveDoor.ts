import * as Phaser from 'phaser';

/**
 * A door sprite that can toggle between a closed and an open texture.
 *
 * The open texture is swapped in when {@link setOpen}(true) is called —
 * typically while the player is within interaction range — so the door
 * visually telegraphs "walk through me". Swap is pure texture change, no
 * tween, to keep the pixel-art look crisp.
 *
 * Ownership: the caller owns the resulting {@link Phaser.GameObjects.Image}
 * lifecycle — it is added to the scene immediately on construction and
 * destroyed by Phaser when the scene shuts down.
 */
export class InteractiveDoor {
  readonly image: Phaser.GameObjects.Image;
  private readonly closedKey: string;
  private readonly openKey: string;
  private open = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    closedKey: string,
    openKey: string,
    depth = 3,
  ) {
    this.closedKey = closedKey;
    this.openKey = openKey;
    this.image = scene.add.image(x, y, closedKey).setDepth(depth);
  }

  /** Swap between closed and open textures. No-op if already in that state. */
  setOpen(open: boolean): void {
    if (this.open === open) return;
    this.open = open;
    this.image.setTexture(open ? this.openKey : this.closedKey);
  }

  isOpen(): boolean {
    return this.open;
  }

  /** Convenience: make the door clickable and forward to a handler. */
  onPointerDown(handler: () => void): this {
    this.image.setInteractive({ useHandCursor: true });
    this.image.on('pointerdown', handler);
    return this;
  }

  get x(): number { return this.image.x; }
  get y(): number { return this.image.y; }
}
