import * as Phaser from 'phaser';
import { GAME_HEIGHT, TILE_SIZE, FLOORS } from '../../../config/gameConfig';
import { LevelScene, LevelConfig } from '../_shared/LevelScene';
import { theme } from '../../../style/theme';
import { enemiesForGroundY } from './enemies';

/**
 * Floor 1 — Platform room (left side of the Platform Team floor).
 *
 * Reached by stepping OFF the elevator to the LEFT at floor 1.
 * Focused on platform-engineering content: the Platform Team signpost
 * on entry and the animated "PROD OPS" monitoring wall on the right.
 *
 * A sibling scene `ArchitectureTeamScene` hosts the architecture content
 * on the other side of the elevator; both scenes share FloorId
 * PLATFORM_TEAM and use disjoint token-index ranges.
 */
export class PlatformTeamScene extends LevelScene {
  constructor() {
    super('PlatformTeamScene', FLOORS.PLATFORM_TEAM);
  }

  protected override createDecorations(): void {
    const G = GAME_HEIGHT - TILE_SIZE;

    this.addAmbientPlants([
      { x: 90, kind: 'tall' },
      { x: 440, kind: 'small', depth: 3 },
      { x: 160, kind: 'small' },
      { x: 1250, kind: 'tall' },
    ]);

    this.addSignpost({ x: 260, label: 'PLATFORM\n   TEAM', color: '#b8e6ff' });

    // Workstations flanking the center.
    this.add.image(560, G - 36, 'desk_monitor').setDepth(3);
    this.add.image(680, G - 10, 'router').setDepth(3);

    // Server rack cluster behind the monitoring wall.
    this.add.image(760, G - 50, 'server_rack').setDepth(3);
    this.add.image(760, G - 10, 'cables').setDepth(1);

    // "Scaling" info wall between the signpost and the workstations.
    this.createScalingDiagram(440, G - 50);

    // "You build it, you run it" monitoring wall (animated).
    this.createMonitoringWall(930, G - 50);

    // Web Application Firewall panel to the right of the monitoring wall.
    this.createWafDiagram(1165, G - 50);
  }

  /**
   * Wall-mounted "SCALING" diagram contrasting horizontal vs vertical scaling.
   *
   * Two labelled halves:
   *   - HORIZONTAL: four small server boxes appearing one-by-one across the
   *     row, illustrating "add more machines" (scale out).
   *   - VERTICAL: a single server box whose height grows, illustrating
   *     "make one machine bigger" (scale up).
   *
   * A looping timer drives the animation so the difference between the two
   * strategies is visible at a glance. The timer is owned by scene.time so
   * it's cleaned up automatically on scene shutdown.
   */
  private createScalingDiagram(cx: number, baseY: number): void {
    const W = 240, H = 150;
    const x = cx - W / 2, y = baseY - H - 10;

    const frame = this.add.graphics().setDepth(3);
    frame.fillStyle(0x1a1a22, 1).fillRoundedRect(x, y, W, H, 6);
    frame.lineStyle(2, 0x3b4a5c, 1).strokeRoundedRect(x, y, W, H, 6);
    // Tiny mounting feet so it reads as a wall panel (matches monitoring wall).
    frame.fillStyle(0x2a2a33, 1);
    frame.fillRect(x + 10, y + H, 6, 14);
    frame.fillRect(x + W - 16, y + H, 6, 14);

    this.add.text(x + 8, y + 4, 'SCALING', {
      fontFamily: 'monospace', fontSize: '10px', color: '#b8e6ff', fontStyle: 'bold',
    }).setDepth(4);

    // Two panes split the interior.
    const pane = (px: number, pw: number, label: string) => {
      frame.fillStyle(0x06101c, 1).fillRect(px, y + 22, pw, H - 44);
      frame.lineStyle(1, 0x3b4a5c, 0.8).strokeRect(px, y + 22, pw, H - 44);
      this.add.text(px + pw / 2, y + H - 16, label, {
        fontFamily: 'monospace', fontSize: '9px', color: '#6fa8d6', fontStyle: 'bold',
      }).setOrigin(0.5, 0).setDepth(4);
    };
    const leftX = x + 8,  leftW  = (W - 24) / 2;
    const rightX = leftX + leftW + 8, rightW = leftW;
    pane(leftX, leftW, 'HORIZONTAL');
    pane(rightX, rightW, 'VERTICAL');

    // Captions above each pane.
    this.add.text(leftX + leftW / 2, y + 24, 'scale out', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8fb8e6',
    }).setOrigin(0.5, 0).setDepth(4);
    this.add.text(rightX + rightW / 2, y + 24, 'scale up', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8fb8e6',
    }).setOrigin(0.5, 0).setDepth(4);

    const anim = this.add.graphics().setDepth(4);

    // Horizontal layout: a row of up to N small boxes that appear one by one.
    const SERVERS = 4;
    const rowY = y + 54;
    const rowH = 38;
    const slotW = (leftW - 10) / SERVERS;

    // Vertical layout: a single box whose height grows then resets.
    const vBoxX = rightX + rightW / 2 - 9;
    const vBoxBottom = y + H - 26;
    const vMinH = 14;
    const vMaxH = 68;

    let step = 0; // advances on every tick; horizontal cycle = SERVERS+2, vertical cycle = ~40
    const redraw = () => {
      anim.clear();

      // --- Horizontal: paint N boxes, reveal them one per step, pause, reset.
      const cycle = SERVERS + 3; // 4 reveal steps + 3 idle steps
      const revealed = Math.min(SERVERS, step % cycle);
      for (let i = 0; i < revealed; i++) {
        const bx = leftX + 5 + i * slotW;
        const by = rowY;
        anim.fillStyle(0x4caf50, 1);
        anim.fillRect(bx, by, slotW - 4, rowH);
        anim.lineStyle(1, 0x8fe6a8, 0.9).strokeRect(bx, by, slotW - 4, rowH);
        // Server LED.
        anim.fillStyle(0xaaffaa, 1).fillRect(bx + 3, by + 3, 3, 3);
        // Faint link line connecting siblings — illustrates a cluster.
        if (i > 0) {
          const pbx = leftX + 5 + (i - 1) * slotW;
          anim.lineStyle(1, 0x4caf50, 0.6)
            .lineBetween(pbx + slotW - 4, by + rowH / 2, bx, by + rowH / 2);
        }
      }
      // Arrow hint under the row.
      anim.lineStyle(1, 0x8fe6a8, 0.6);
      const arrY = rowY + rowH + 6;
      anim.lineBetween(leftX + 6, arrY, leftX + leftW - 6, arrY);
      anim.fillStyle(0x8fe6a8, 0.8);
      anim.fillTriangle(
        leftX + leftW - 6, arrY,
        leftX + leftW - 12, arrY - 3,
        leftX + leftW - 12, arrY + 3,
      );

      // --- Vertical: one box whose height oscillates between min and max.
      const vCycle = 24;
      const phase = (step % vCycle) / vCycle;
      // Smooth triangular oscillation: 0→1→0.
      const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
      const vH = vMinH + (vMaxH - vMinH) * tri;
      const vTop = vBoxBottom - vH;
      anim.fillStyle(0x42a5f5, 1);
      anim.fillRect(vBoxX, vTop, 18, vH);
      anim.lineStyle(1, 0xaacff0, 0.9).strokeRect(vBoxX, vTop, 18, vH);
      // CPU/RAM band markers inside the growing box.
      const bands = Math.max(1, Math.floor(vH / 10));
      anim.fillStyle(0xaaffaa, 1);
      for (let b = 0; b < bands; b++) {
        anim.fillRect(vBoxX + 3, vBoxBottom - 4 - b * 10, 3, 2);
        anim.fillRect(vBoxX + 12, vBoxBottom - 4 - b * 10, 3, 2);
      }
      // Upward arrow next to the box.
      anim.lineStyle(1, 0xaacff0, 0.7);
      const ax = vBoxX + 26;
      anim.lineBetween(ax, vBoxBottom, ax, vTop);
      anim.fillStyle(0xaacff0, 0.9);
      anim.fillTriangle(ax, vTop, ax - 3, vTop + 6, ax + 3, vTop + 6);

      step++;
    };

    redraw();
    this.time.addEvent({ delay: 320, loop: true, callback: redraw });
  }

  /**
   * Live-looking "you build it, you run it" ops dashboard.
   *
   * Three screens above a shared console: a scrolling latency sparkline, a
   * bar chart of service health, and a blinking "LIVE" indicator. Redraws on
   * a timer so the player sees it update while reading the info panel. The
   * timer is owned by scene.time so it's destroyed automatically on shutdown.
   */
  private createMonitoringWall(cx: number, baseY: number): void {
    const frame = this.add.graphics().setDepth(3);
    const W = 240, H = 130;
    const x = cx - W / 2, y = baseY - H - 20;
    frame.fillStyle(0x1a1a22, 1).fillRoundedRect(x, y, W, H, 6);
    frame.lineStyle(2, 0x3b4a5c, 1).strokeRoundedRect(x, y, W, H, 6);
    frame.fillStyle(0x2a2a33, 1);
    frame.fillRect(x + 10, y + H, 6, 18);
    frame.fillRect(x + W - 16, y + H, 6, 18);
    this.add.text(x + 8, y + 4, 'PROD OPS', {
      fontFamily: 'monospace', fontSize: '10px', color: '#8fb8e6', fontStyle: 'bold',
    }).setDepth(4);

    const lineRect = { x: x + 8,   y: y + 20, w: 100, h: 60 };
    const barRect  = { x: x + 116, y: y + 20, w: 72,  h: 60 };
    const liveRect = { x: x + 196, y: y + 20, w: 36,  h: 60 };

    frame.fillStyle(0x06101c, 1);
    frame.fillRect(lineRect.x, lineRect.y, lineRect.w, lineRect.h);
    frame.fillRect(barRect.x,  barRect.y,  barRect.w,  barRect.h);
    frame.fillRect(liveRect.x, liveRect.y, liveRect.w, liveRect.h);
    frame.lineStyle(1, 0x3b4a5c, 0.8);
    frame.strokeRect(lineRect.x, lineRect.y, lineRect.w, lineRect.h);
    frame.strokeRect(barRect.x,  barRect.y,  barRect.w,  barRect.h);
    frame.strokeRect(liveRect.x, liveRect.y, liveRect.w, liveRect.h);

    const caption = (text: string, px: number, py: number, color: string) =>
      this.add.text(px, py, text, {
        fontFamily: 'monospace', fontSize: '9px', color,
      }).setDepth(4);
    caption('latency (ms)', lineRect.x + 2, lineRect.y + lineRect.h + 2, '#6fa8d6');
    caption('services',     barRect.x  + 2, barRect.y  + barRect.h  + 2, '#6fa8d6');
    caption('status',       liveRect.x + 2, liveRect.y + liveRect.h + 2, '#6fa8d6');

    const live = this.add.graphics().setDepth(4);

    const SPARK_POINTS = 24;
    const spark: number[] = Array.from({ length: SPARK_POINTS }, () => 0.3 + Math.random() * 0.3);
    const bars = [0.6, 0.8, 0.5, 0.7, 0.4];
    const barTargets = bars.slice();
    let pulse = 0;

    const redraw = () => {
      live.clear();

      spark.shift();
      const last = spark[spark.length - 1] ?? 0.4;
      const next = Phaser.Math.Clamp(last + (Math.random() - 0.5) * 0.25, 0.1, 0.95);
      spark.push(Math.random() < 0.08 ? Math.min(0.95, next + 0.3) : next);

      live.lineStyle(1.5, 0x00d0ff, 1);
      live.beginPath();
      for (let i = 0; i < spark.length; i++) {
        const px = lineRect.x + 2 + (i * (lineRect.w - 4)) / (SPARK_POINTS - 1);
        const py = lineRect.y + lineRect.h - 2 - spark[i] * (lineRect.h - 4);
        if (i === 0) live.moveTo(px, py);
        else live.lineTo(px, py);
      }
      live.strokePath();

      live.lineStyle(1, 0xff5577, 0.4);
      const thresholdY = lineRect.y + lineRect.h * 0.25;
      live.lineBetween(lineRect.x + 2, thresholdY, lineRect.x + lineRect.w - 2, thresholdY);

      for (let i = 0; i < bars.length; i++) {
        bars[i] = Phaser.Math.Linear(bars[i], barTargets[i], 0.15);
        if (Math.abs(bars[i] - barTargets[i]) < 0.02) {
          barTargets[i] = 0.25 + Math.random() * 0.7;
        }
        const slotW = (barRect.w - 4) / bars.length;
        const bx = barRect.x + 2 + i * slotW;
        const bh = bars[i] * (barRect.h - 6);
        const by = barRect.y + barRect.h - 3 - bh;
        const col = bars[i] > 0.8 ? 0xff5577 : bars[i] > 0.6 ? theme.color.status.warning : 0x4caf50;
        live.fillStyle(col, 1);
        live.fillRect(bx + 1, by, slotW - 3, bh);
      }

      pulse = (pulse + 1) % 10;
      const dotColor = pulse < 5 ? 0xff3355 : 0x551122;
      live.fillStyle(dotColor, 1);
      live.fillCircle(liveRect.x + 10, liveRect.y + 12, 4);
      for (let i = 0; i < 3; i++) {
        const on = ((pulse + i) % 6) < 4;
        live.fillStyle(on ? 0x4caf50 : 0x244422, 1);
        live.fillRect(liveRect.x + 8, liveRect.y + 24 + i * 10, liveRect.w - 16, 6);
      }
    };

    redraw();
    this.time.addEvent({ delay: 160, loop: true, callback: redraw });
  }

  /**
   * Web Application Firewall panel. A shield icon sits between an inbound
   * "Internet" arrow and the protected app. Requests flow right-to-left:
   *   - most arrive as "safe" (green) and pass through the shield,
   *   - some arrive "attack" (red) and the shield stops them (flash),
   *   - occasionally a legitimate request is flagged as a FALSE POSITIVE
   *     (amber) — it gets blocked even though it was benign, illustrating
   *     the core tuning challenge. A small counter tallies the three
   *     outcomes so the player can see the trade-off over time.
   */
  private createWafDiagram(cx: number, baseY: number): void {
    const W = 200, H = 150;
    const x = cx - W / 2, y = baseY - H - 10;

    const frame = this.add.graphics().setDepth(3);
    frame.fillStyle(0x1a1a22, 1).fillRoundedRect(x, y, W, H, 6);
    frame.lineStyle(2, 0x3b4a5c, 1).strokeRoundedRect(x, y, W, H, 6);
    frame.fillStyle(0x2a2a33, 1);
    frame.fillRect(x + 10, y + H, 6, 14);
    frame.fillRect(x + W - 16, y + H, 6, 14);

    this.add.text(x + 8, y + 4, 'WAF', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff8fa8', fontStyle: 'bold',
    }).setDepth(4);
    this.add.text(x + W - 8, y + 4, 'shield', {
      fontFamily: 'monospace', fontSize: '9px', color: '#6fa8d6',
    }).setOrigin(1, 0).setDepth(4);

    // Track area — internet (right) → shield (centre) → app (left).
    const trackY = y + 58;
    const trackLeft = x + 14, trackRight = x + W - 14;
    frame.fillStyle(0x06101c, 1).fillRect(trackLeft, trackY - 16, trackRight - trackLeft, 32);
    frame.lineStyle(1, 0x3b4a5c, 0.8).strokeRect(trackLeft, trackY - 16, trackRight - trackLeft, 32);

    // Endpoints: app (left), internet (right).
    this.add.text(trackLeft + 2, trackY - 28, 'APP', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8fb8e6',
    }).setDepth(4);
    this.add.text(trackRight - 2, trackY - 28, 'INTERNET', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8fb8e6',
    }).setOrigin(1, 0).setDepth(4);

    // Shield icon (static) centred in the track.
    const shieldX = (trackLeft + trackRight) / 2;
    const shield = this.add.graphics().setDepth(4);
    const drawShield = (glow: number) => {
      shield.clear();
      // Outer shield silhouette.
      shield.fillStyle(0x2a3a55, 1);
      shield.fillRoundedRect(shieldX - 10, trackY - 14, 20, 24, 4);
      shield.fillStyle(glow, 1);
      shield.fillRoundedRect(shieldX - 7, trackY - 11, 14, 18, 3);
      shield.lineStyle(1, 0xffffff, 0.7);
      shield.strokeRoundedRect(shieldX - 10, trackY - 14, 20, 24, 4);
      // Tick mark inside.
      shield.lineStyle(1.5, 0xffffff, 0.9);
      shield.beginPath();
      shield.moveTo(shieldX - 4, trackY - 1);
      shield.lineTo(shieldX - 1, trackY + 3);
      shield.lineTo(shieldX + 5, trackY - 5);
      shield.strokePath();
    };
    drawShield(0x3b6fb0);

    // Captions under the track (rules / counters).
    const statRow = y + H - 34;
    const safeLabel = this.add.text(x + 10, statRow, 'allowed: 0', {
      fontFamily: 'monospace', fontSize: '9px', color: '#8fe6a8',
    }).setDepth(4);
    const blockLabel = this.add.text(x + 10, statRow + 12, 'blocked: 0', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ff8fa8',
    }).setDepth(4);
    const fpLabel = this.add.text(x + W - 10, statRow, 'false pos: 0', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffd36a',
    }).setOrigin(1, 0).setDepth(4);
    this.add.text(x + W - 10, statRow + 12, 'tune with product \u2192', {
      fontFamily: 'monospace', fontSize: '8px', color: '#6fa8d6',
    }).setOrigin(1, 0).setDepth(4);

    // In-flight packets — each is an x position + classification.
    type Kind = 'safe' | 'attack' | 'falsepos';
    interface Packet { pos: number; kind: Kind; stopped: boolean; }
    const packets: Packet[] = [];
    let allowed = 0, blocked = 0, falsePos = 0;
    let shieldGlowUntil = 0;

    const anim = this.add.graphics().setDepth(5);
    const STEP = 3; // pixels per tick
    const tick = () => {
      anim.clear();

      // Occasionally spawn a new packet at the right edge.
      if (Math.random() < 0.55) {
        const r = Math.random();
        // 60% safe traffic, 25% attack, 15% benign-but-flagged (false positive).
        const kind: Kind = r < 0.6 ? 'safe' : r < 0.85 ? 'attack' : 'falsepos';
        packets.push({ pos: trackRight - 4, kind, stopped: false });
      }

      // Advance and render.
      for (const p of packets) {
        if (!p.stopped) p.pos -= STEP;
        // Reached the shield? Resolve the outcome.
        if (!p.stopped && p.pos <= shieldX + 4) {
          if (p.kind === 'attack') {
            p.stopped = true;
            blocked++;
            shieldGlowUntil = performance.now() + 250;
          } else if (p.kind === 'falsepos') {
            p.stopped = true;
            falsePos++;
            shieldGlowUntil = performance.now() + 250;
          } else {
            // safe — passes through.
          }
        }
        // Draw.
        const color = p.kind === 'safe' ? 0x4caf50
          : p.kind === 'attack' ? 0xff3355
            : 0xffb84a;
        anim.fillStyle(color, 1);
        anim.fillCircle(p.pos, trackY, 3);
      }

      // Retire packets that have exited off the left (allowed) or have
      // been stopped long enough to fade.
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        if (!p.stopped && p.pos < trackLeft) {
          if (p.kind === 'safe') allowed++;
          packets.splice(i, 1);
        } else if (p.stopped && performance.now() > shieldGlowUntil + 120) {
          packets.splice(i, 1);
        }
      }

      // Shield flashes briefly when it blocks something.
      drawShield(performance.now() < shieldGlowUntil ? 0xff5577 : 0x3b6fb0);

      safeLabel.setText(`allowed: ${allowed}`);
      blockLabel.setText(`blocked: ${blocked}`);
      fpLabel.setText(`false pos: ${falsePos}`);
    };

    tick();
    this.time.addEvent({ delay: 90, loop: true, callback: tick });
  }

  protected getLevelConfig(): LevelConfig {
    const G = GAME_HEIGHT - TILE_SIZE;

    return {
      floorId: FLOORS.PLATFORM_TEAM,
      playerStart: { x: 150, y: G - 100 },
      exitPosition: { x: 80, y: G - 56 },

      platforms: [
        { x: 0, y: G, width: 10 },
      ],

      roomElevators: [],

      // Token indices 0..4 — disjoint from ArchitectureTeamScene (5..).
      tokens: [
        { x: 380,  y: G - 40 },
        { x: 500,  y: G - 40 },
        { x: 620,  y: G - 40 },
        { x: 830,  y: G - 40 },
        { x: 1070, y: G - 40 },
      ],

      infoPoints: [
        {
          x: 260, y: G, contentId: 'platform-engineering',
          zone: { shape: 'rect', width: 140, height: 220 },
        },
        {
          x: 440, y: G, contentId: 'scaling',
          zone: { shape: 'rect', width: 200, height: 220 },
        },
        {
          x: 930, y: G, contentId: 'you-build-you-run',
          zone: { shape: 'rect', width: 280, height: 220 },
        },
        {
          x: 1165, y: G, contentId: 'web-application-firewall',
          zone: { shape: 'rect', width: 180, height: 220 },
        },
      ],

      enemies: enemiesForGroundY(G),
    };
  }
}
