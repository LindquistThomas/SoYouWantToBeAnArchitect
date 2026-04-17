import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, FLOORS } from '../config/gameConfig';
import { LevelScene, LevelConfig } from './LevelScene';

/**
 * Floor 1 — Architecture room (right side of the Platform Team floor).
 *
 * Reached by stepping OFF the elevator to the RIGHT at floor 1.
 * Architecture-discipline themed: whiteboard with diagrams, a drafting
 * table, and the ADR Archive terminal that hosts the Architecture
 * Decision Records info point.
 *
 * Shares FLOORS.PLATFORM_TEAM with Floor1Scene (same "floor", two rooms).
 * Token indices are disjoint from Floor1Scene so collection state does
 * not collide across the shared ProgressionSystem bookkeeping.
 */
export class Floor1ArchScene extends LevelScene {
  /** First token index used in this room — must not overlap Floor1Scene. */
  private static readonly TOKEN_INDEX_OFFSET = 5;

  constructor() {
    super('Floor1ArchScene', FLOORS.PLATFORM_TEAM);
  }

  protected override createDecorations(): void {
    const G = GAME_HEIGHT - TILE_SIZE;

    // Ambient plants (same aesthetic as the lobby / platform room)
    this.add.image(90, G - 40, 'plant_tall').setDepth(3);
    this.add.image(1180, G - 40, 'plant_tall').setDepth(3);
    this.add.image(160, G - 32, 'plant_small').setDepth(11);

    // Whiteboard — left-center, introduces the "Architecture" room.
    this.createWhiteboard(360, G - 50);

    // Drafting table between whiteboard and ADR kiosk.
    this.createDraftingTable(640, G - 20);

    // ADR Archive terminal — the info point for this room.
    this.createAdrKiosk(950, G - 50);
  }

  /**
   * A whiteboard with a hand-drawn "context → decision → consequence"
   * diagram. Purely decorative — orients the player to the room's theme.
   */
  private createWhiteboard(cx: number, baseY: number): void {
    const W = 220;
    const H = 150;
    const x = cx - W / 2;
    const y = baseY - H - 10;

    const g = this.add.graphics().setDepth(3);
    // Wooden frame
    g.fillStyle(0x5a3a20, 1).fillRect(x - 6, y - 6, W + 12, H + 12);
    // Board
    g.fillStyle(0xf3f1e6, 1).fillRect(x, y, W, H);
    g.lineStyle(1, 0xa8a79a, 1).strokeRect(x, y, W, H);

    // "ARCHITECTURE" title bar
    this.add.text(cx, y + 10, 'ARCHITECTURE', {
      fontFamily: 'monospace', fontSize: '11px', color: '#3a4a66', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(4);

    // Hand-drawn diagram: three boxes with arrows
    const boxY = y + 52;
    const labels = ['Context', 'Decision', 'Consequence'];
    const colors = [0x1f77b4, 0xd62728, 0x2ca02c];
    const boxW = 52, boxH = 28;
    for (let i = 0; i < 3; i++) {
      const bx = x + 16 + i * 66;
      g.lineStyle(2, colors[i], 1).strokeRect(bx, boxY, boxW, boxH);
      this.add.text(bx + boxW / 2, boxY + boxH / 2, labels[i], {
        fontFamily: 'monospace', fontSize: '9px', color: '#333',
      }).setOrigin(0.5).setDepth(4);
      if (i < 2) {
        g.lineStyle(2, 0x444, 1);
        g.lineBetween(bx + boxW, boxY + boxH / 2, bx + boxW + 14, boxY + boxH / 2);
        // arrowhead
        g.lineBetween(bx + boxW + 14, boxY + boxH / 2, bx + boxW + 10, boxY + boxH / 2 - 3);
        g.lineBetween(bx + boxW + 14, boxY + boxH / 2, bx + boxW + 10, boxY + boxH / 2 + 3);
      }
    }

    // "ADR" annotation below
    this.add.text(cx, y + H - 22, 'ADR = Architecture Decision Record', {
      fontFamily: 'monospace', fontSize: '10px', color: '#666',
    }).setOrigin(0.5).setDepth(4);

    // Marker tray
    g.fillStyle(0x8a6a40, 1).fillRect(x, y + H, W, 4);
    g.fillStyle(0xd32f2f, 1).fillRect(x + 20, y + H + 1, 14, 3);
    g.fillStyle(0x1976d2, 1).fillRect(x + 40, y + H + 1, 14, 3);
    g.fillStyle(0x388e3c, 1).fillRect(x + 60, y + H + 1, 14, 3);
  }

  /**
   * Drafting table with a rolled blueprint — purely decorative.
   */
  private createDraftingTable(cx: number, baseY: number): void {
    const g = this.add.graphics().setDepth(3);
    // Legs
    g.fillStyle(0x4a3a22, 1);
    g.fillRect(cx - 50, baseY - 4, 6, 24);
    g.fillRect(cx + 44, baseY - 4, 6, 24);
    // Tilted top
    g.fillStyle(0x8a6a3a, 1);
    g.fillTriangle(cx - 56, baseY - 8, cx + 56, baseY - 8, cx + 56, baseY);
    g.fillStyle(0x3b5a7a, 1);
    g.fillRect(cx - 54, baseY - 28, 108, 22);
    g.lineStyle(1, 0x7ab0e0, 0.6);
    for (let i = 1; i < 5; i++) g.lineBetween(cx - 54 + i * 22, baseY - 28, cx - 54 + i * 22, baseY - 6);
    for (let i = 1; i < 4; i++) g.lineBetween(cx - 54, baseY - 28 + i * 5, cx + 54, baseY - 28 + i * 5);
  }

  /**
   * "ADR ARCHIVE" — warm-amber CRT terminal with a scrolling list of
   * decision titles and a blinking cursor. Hosts the ADR info point.
   */
  private createAdrKiosk(cx: number, baseY: number): void {
    const W = 140;
    const H = 160;
    const x = cx - W / 2;
    const y = baseY - H - 10;

    const frame = this.add.graphics().setDepth(3);
    frame.fillStyle(0x3a2f1a, 1).fillRect(cx - W / 2 - 6, baseY - 10, W + 12, 10);
    frame.fillStyle(0x2a2218, 1).fillRect(cx - W / 2 - 2, baseY - 16, W + 4, 6);

    frame.fillStyle(0x2a1e12, 1).fillRoundedRect(x, y, W, H, 4);
    frame.lineStyle(2, 0x7a5e36, 1).strokeRoundedRect(x, y, W, H, 4);

    frame.fillStyle(0x7a5e36, 1).fillRect(x + 4, y + 4, W - 8, 16);
    this.add.text(cx, y + 12, 'ADR ARCHIVE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1a0f05', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(4);

    const sx = x + 8;
    const sy = y + 26;
    const sw = W - 16;
    const sh = H - 36;
    frame.fillStyle(0x08140a, 1).fillRect(sx, sy, sw, sh);
    frame.lineStyle(1, 0xe0b860, 0.9).strokeRect(sx, sy, sw, sh);

    frame.fillStyle(0x000000, 0.25);
    for (let ly = sy + 1; ly < sy + sh; ly += 3) {
      frame.fillRect(sx + 1, ly, sw - 2, 1);
    }

    const live = this.add.graphics().setDepth(4);
    const textLayer = this.add.container(0, 0).setDepth(4);

    const ADRS = [
      'ADR-0001  Use PostgreSQL',
      'ADR-0002  Adopt ADRs',
      'ADR-0003  Blue/green deploys',
      'ADR-0004  Feature flags',
      'ADR-0005  Stop sharing DBs',
      'ADR-0006  Gateway per team',
      'ADR-0007  Structured logs',
      'ADR-0008  Contract tests',
      'ADR-0009  Canary rollouts',
      'ADR-0010  SLOs, not SLAs',
    ];

    const LINE_H = 11;
    const textObjs: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < ADRS.length; i++) {
      const t = this.add.text(sx + 6, 0, ADRS[i], {
        fontFamily: 'monospace', fontSize: '9px', color: '#f5c36a',
      });
      textLayer.add(t);
      textObjs.push(t);
    }

    const mask = this.make.graphics({ x: 0, y: 0 }, false);
    mask.fillStyle(0xffffff, 1).fillRect(sx, sy, sw, sh);
    textLayer.setMask(mask.createGeometryMask());

    let scroll = 0;
    const total = ADRS.length * LINE_H + sh;
    const cursorState = { on: true };

    const redraw = () => {
      scroll = (scroll + 0.6) % total;
      for (let i = 0; i < textObjs.length; i++) {
        const baseTY = sy + 6 + i * LINE_H - scroll;
        let ty = baseTY;
        if (ty < sy - LINE_H) ty += total;
        textObjs[i].setY(ty);
      }
      live.clear();
      cursorState.on = !cursorState.on;
      if (cursorState.on) {
        live.fillStyle(0xe0b860, 1);
        live.fillRect(sx + 2, sy + 6, 2, 9);
      }
      live.fillStyle(0xf5c36a, 0.08);
      live.fillRect(sx + 1, sy + 1, sw - 2, 4);
    };

    redraw();
    this.time.addEvent({ delay: 120, loop: true, callback: redraw });
  }

  protected getLevelConfig(): LevelConfig {
    const G = GAME_HEIGHT - TILE_SIZE;
    const K = Floor1ArchScene.TOKEN_INDEX_OFFSET;

    return {
      floorId: FLOORS.PLATFORM_TEAM,
      // Player enters from the LEFT (coming off the elevator to the right).
      playerStart: { x: 150, y: G - 100 },
      // Exit door sits on the left edge — walking back returns to the hub.
      exitPosition: { x: 80, y: G - 56 },

      platforms: [
        { x: 0, y: G, width: 10 },
      ],

      roomElevators: [],

      // Three tokens — disjoint index range from Floor1Scene (which uses 0..4).
      tokens: [
        { x: 500,  y: G - 40, index: K + 0 },
        { x: 780,  y: G - 40, index: K + 1 },
        { x: 1120, y: G - 40, index: K + 2 },
      ],

      infoPoints: [
        {
          x: 950, y: G, contentId: 'architecture-decision-records',
          zone: { shape: 'rect', width: 160, height: 220 },
        },
      ],
    };
  }
}
