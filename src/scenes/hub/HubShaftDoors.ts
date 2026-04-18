import * as Phaser from 'phaser';

/**
 * Pair of sliding landing doors rendered at a floor opening. The two leaves
 * meet at the shaft centre when closed and slide outward (into wall pockets)
 * when opening. Animation is driven per-frame by `update(cabY, dt)` — the
 * doors target "open" when the cab is docked at this floor and "closed"
 * otherwise.
 *
 * Drawn in front of the cab (depth 4) so landing doors read as belonging to
 * the hallway wall rather than to the shaft interior; when the cab is
 * docked here, the opening doors reveal the cab behind them.
 */
export class HubFloorDoors {
  private readonly scene: Phaser.Scene;
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly cx: number;
  private readonly floorY: number;
  /** Full width of the opening (sum of both leaves when closed). */
  private readonly openingW: number;
  /** Vertical extent of the doors (door top→floor). */
  private readonly doorTop: number;
  private readonly doorBottom: number;

  /** 0 = fully closed, 1 = fully open. */
  private openAmount = 0;
  /** Target open amount (0 or 1). Animated toward by `update`. */
  private target = 0;

  private static readonly OPENING_W = 140;
  private static readonly DOOR_HEIGHT = 150;
  /** How close (px) the cab centre must be to this floor to trigger open. */
  private static readonly PROXIMITY = 24;
  /** Per-millisecond open/close rate (0..1 per ms). */
  private static readonly RATE = 1 / 350;

  /**
   * @param floorY Y of the walking surface at this floor.
   * @param dockY  Y of the cab platform when docked at this floor.
   */
  constructor(scene: Phaser.Scene, cx: number, floorY: number, private readonly dockY: number) {
    this.scene = scene;
    this.cx = cx;
    this.floorY = floorY;
    this.openingW = HubFloorDoors.OPENING_W;
    this.doorBottom = floorY + 4;
    this.doorTop = this.doorBottom - HubFloorDoors.DOOR_HEIGHT;

    this.gfx = scene.add.graphics();
    this.gfx.setDepth(4);
    this.draw();
  }

  /** Drive the door based on cab position and frame delta. */
  update(cabY: number, deltaMs: number): void {
    const dist = Math.abs(cabY - this.dockY);
    this.target = dist < HubFloorDoors.PROXIMITY ? 1 : 0;

    const step = HubFloorDoors.RATE * deltaMs;
    if (this.openAmount < this.target) {
      this.openAmount = Math.min(this.target, this.openAmount + step);
    } else if (this.openAmount > this.target) {
      this.openAmount = Math.max(this.target, this.openAmount - step);
    }

    this.draw();
  }

  destroy(): void {
    this.gfx.destroy();
  }

  private draw(): void {
    const g = this.gfx;
    g.clear();

    const leafW = this.openingW / 2;
    const slide = leafW * this.openAmount;
    const top = this.doorTop;
    const bottom = this.doorBottom;
    const h = bottom - top;

    // Door frame (fixed, behind leaves) — dark cavity + bright trim
    const frameX = this.cx - this.openingW / 2 - 6;
    const frameW = this.openingW + 12;
    const frameY = top - 6;
    const frameH = h + 10;
    g.fillStyle(0x1a1a20, 1);
    g.fillRect(frameX, frameY, frameW, frameH);
    g.lineStyle(2, 0x4a4a58, 1);
    g.strokeRect(frameX, frameY, frameW, frameH);
    g.lineStyle(1, 0x6a6a82, 0.8);
    g.lineBetween(frameX + 2, frameY + 2, frameX + frameW - 2, frameY + 2);

    // Floor threshold plate (always visible)
    g.fillStyle(0x6a6a82, 1);
    g.fillRect(this.cx - this.openingW / 2 - 4, bottom, this.openingW + 8, 4);
    g.lineStyle(1, 0x33333f, 1);
    for (let gx = this.cx - this.openingW / 2; gx < this.cx + this.openingW / 2; gx += 8) {
      g.lineBetween(gx, bottom + 1, gx, bottom + 3);
    }

    // Header beam above the doors
    g.fillStyle(0x3a3a48, 1);
    g.fillRect(frameX, frameY - 4, frameW, 4);
    g.fillStyle(0x55556a, 1);
    g.fillRect(frameX, frameY - 4, frameW, 1);

    // Left leaf — slides left when opening
    this.drawLeaf(
      g,
      this.cx - leafW - slide,
      top,
      leafW,
      h,
      /* handleRight */ true,
    );
    // Right leaf — slides right when opening
    this.drawLeaf(
      g,
      this.cx + slide,
      top,
      leafW,
      h,
      /* handleRight */ false,
    );
  }

  private drawLeaf(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    handleRight: boolean,
  ): void {
    // Brushed-steel body
    g.fillStyle(0x7a8494, 1);
    g.fillRect(x, y, w, h);
    // Highlight column
    g.fillStyle(0x9aa2b2, 0.8);
    g.fillRect(x + 4, y + 2, 3, h - 4);
    // Shadow column near the meeting edge
    const shadowX = handleRight ? x + w - 5 : x + 2;
    g.fillStyle(0x3a4250, 0.6);
    g.fillRect(shadowX, y + 2, 2, h - 4);
    // Vertical brushed grain
    g.lineStyle(1, 0x6a7484, 0.45);
    for (let gx = x + 8; gx < x + w - 4; gx += 6) {
      g.lineBetween(gx, y + 4, gx, y + h - 4);
    }
    // Inset panel
    g.lineStyle(1, 0x2a3240, 0.8);
    g.strokeRect(x + 6, y + 10, w - 12, h - 20);
    // Handle (small vertical bar near the meeting edge)
    const hx = handleRight ? x + w - 8 : x + 4;
    g.fillStyle(0x22262e, 1);
    g.fillRect(hx, y + h / 2 - 12, 3, 24);
    g.fillStyle(0x55606e, 1);
    g.fillRect(hx + 1, y + h / 2 - 12, 1, 24);
    // Outer edge highlight
    g.lineStyle(1, 0x22262e, 1);
    g.strokeRect(x, y, w, h);
  }
}
