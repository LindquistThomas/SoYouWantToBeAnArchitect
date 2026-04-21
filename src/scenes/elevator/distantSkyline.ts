/**
 * Distant city-skyline silhouette drawn above the elevator building's
 * rooftop. Only visible when the camera clamps near the top of the shaft
 * (F3/F4 / penthouse); at lower floors the shaft content covers the sky
 * area. Pure helpers + a thin Phaser renderer so layout math can be
 * unit-tested without a scene.
 *
 * Parallax: `scrollFactor(0, 0.35)` — as the cab rises the skyline drifts
 * slowly upward, reading as distant. Depth `-15` sits between the static
 * starfield (−18) and the building's rooftop props (+3).
 */
import type * as Phaser from 'phaser';
import { theme } from '../../style/theme';

/** One placed building in the silhouette. */
export interface SkylineBuildingSpec {
  /** Left edge in world space. */
  x: number;
  width: number;
  /** Height upward from the skyline baseline. */
  height: number;
  /** Which silhouette colour to use. */
  variant: 'silhouette' | 'accent';
  /** Flat roof, stepped roof, or a small antenna spike. */
  roof: 'flat' | 'step' | 'spike';
  /** Lit / dim windows scattered on the façade. */
  windows: SkylineWindow[];
}

export interface SkylineWindow {
  /** Local coordinates relative to the building's top-left corner. */
  x: number;
  y: number;
  width: number;
  height: number;
  lit: boolean;
  /** True if this window alpha-tweens slowly (at most a handful per skyline). */
  twinkle: boolean;
}

/** xorshift-based deterministic RNG — same as skyBackdrop, duplicated locally to keep modules independent. */
function rng(seed: number): () => number {
  let s = seed | 0;
  if (s === 0) s = 0x12345678;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/**
 * Produce a deterministic skyline across the given width. Buildings tile
 * left-to-right with small overlaps (3–8 px) so they read as a continuous
 * city block, not isolated towers.
 */
export function generateSkyline(
  width: number,
  seed = 0x5ca9e1,
): SkylineBuildingSpec[] {
  const rand = rng(seed);
  const buildings: SkylineBuildingSpec[] = [];

  let cursor = -20; // start just off the left edge so no seam at x=0
  while (cursor < width + 20) {
    const w = 48 + Math.floor(rand() * 72); // 48–120 px wide
    const h = 60 + Math.floor(rand() * 120); // 60–180 px tall
    const variant: SkylineBuildingSpec['variant'] = rand() < 0.3 ? 'accent' : 'silhouette';
    const roofRoll = rand();
    const roof: SkylineBuildingSpec['roof'] =
      roofRoll < 0.55 ? 'flat' : roofRoll < 0.85 ? 'step' : 'spike';

    const windows: SkylineWindow[] = [];
    // Window grid: 6px wide, 4px tall, 4px gutter.
    const winW = 6;
    const winH = 4;
    const gutterX = 5;
    const gutterY = 5;
    const marginX = 6;
    const marginY = 10;
    const cols = Math.max(1, Math.floor((w - marginX * 2 + gutterX) / (winW + gutterX)));
    const rows = Math.max(1, Math.floor((h - marginY * 2 + gutterY) / (winH + gutterY)));
    let twinklesPlaced = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const roll = rand();
        // ~35% lit, ~20% dim, ~45% empty. Tweaked so the building reads
        // "mostly dark with scattered warm squares."
        if (roll > 0.55) {
          const lit = roll > 0.80;
          const canTwinkle = lit && twinklesPlaced < 2 && rand() < 0.25;
          windows.push({
            x: marginX + c * (winW + gutterX),
            y: marginY + r * (winH + gutterY),
            width: winW,
            height: winH,
            lit,
            twinkle: canTwinkle,
          });
          if (canTwinkle) twinklesPlaced++;
        }
      }
    }

    buildings.push({
      x: cursor,
      width: w,
      height: h,
      variant,
      roof,
      windows,
    });

    // Advance with a small random overlap so adjacent buildings bleed into
    // each other at the base — typical city-skyline silhouette.
    cursor += w - (3 + Math.floor(rand() * 6));
  }

  return buildings;
}

export interface DistantSkylineOptions {
  /** Full screen width in world units. */
  width: number;
  /** World Y coordinate of the skyline baseline (building feet). Usually the elevator rooftop Y. */
  baselineY: number;
  /** Deterministic seed. */
  seed?: number;
  /** Parallax factor applied as scrollFactor(0, parallax). */
  parallax?: number;
}

export interface DistantSkylineHandle {
  objects: Phaser.GameObjects.GameObject[];
  tweens: Phaser.Tweens.Tween[];
}

/**
 * Render the skyline into the scene. Returns handles for disposal.
 */
export function drawDistantSkyline(
  scene: Phaser.Scene,
  opts: DistantSkylineOptions,
): DistantSkylineHandle {
  const { width, baselineY, seed, parallax = 0.35 } = opts;

  const buildings = generateSkyline(width, seed);
  const objects: Phaser.GameObjects.GameObject[] = [];
  const tweens: Phaser.Tweens.Tween[] = [];

  const DEPTH = -15;

  // Silhouettes + windows are drawn into a single Graphics per layer to
  // keep draw-call count low. Twinkling windows get their own rectangles
  // so a tween can animate alpha without touching the static layer.
  const silhouettes = scene.add.graphics().setDepth(DEPTH).setScrollFactor(0, parallax);

  for (const b of buildings) {
    const color =
      b.variant === 'accent' ? theme.color.sky.skylineAccent : theme.color.sky.skylineSilhouette;
    const topY = baselineY - b.height;

    // Base body.
    silhouettes.fillStyle(color, 1);
    silhouettes.fillRect(b.x, topY, b.width, b.height);

    // Roof variants — subtle top silhouette cues.
    if (b.roof === 'step') {
      const stepW = Math.max(10, Math.floor(b.width * 0.35));
      const stepH = 8;
      silhouettes.fillRect(b.x + b.width - stepW - 2, topY - stepH, stepW, stepH);
    } else if (b.roof === 'spike') {
      // Thin antenna mast.
      silhouettes.fillRect(b.x + Math.floor(b.width / 2) - 1, topY - 18, 2, 18);
      // Tiny bulb at tip so a far-away warning light hints at the antenna.
      silhouettes.fillStyle(theme.color.status.danger, 0.7);
      silhouettes.fillRect(b.x + Math.floor(b.width / 2) - 1, topY - 20, 2, 2);
      silhouettes.fillStyle(color, 1);
    }

    // Static (non-twinkling) windows.
    for (const w of b.windows) {
      if (w.twinkle) continue;
      const wc = w.lit ? theme.color.sky.windowLit : theme.color.sky.windowDim;
      silhouettes.fillStyle(wc, w.lit ? 0.80 : 0.35);
      silhouettes.fillRect(b.x + w.x, topY + w.y, w.width, w.height);
    }
  }

  objects.push(silhouettes);

  // Twinkling windows — one rectangle + tween each.
  let twinkleIndex = 0;
  for (const b of buildings) {
    const topY = baselineY - b.height;
    for (const w of b.windows) {
      if (!w.twinkle) continue;
      const rect = scene.add
        .rectangle(
          b.x + w.x + w.width / 2,
          topY + w.y + w.height / 2,
          w.width,
          w.height,
          theme.color.sky.windowLit,
          0.9,
        )
        .setDepth(DEPTH)
        .setScrollFactor(0, parallax);
      objects.push(rect);
      const tw = scene.tweens.add({
        targets: rect,
        alpha: { from: 0.9, to: 0.35 },
        duration: 2600 + (twinkleIndex % 5) * 540,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
      tweens.push(tw);
      twinkleIndex++;
    }
  }

  return { objects, tweens };
}
