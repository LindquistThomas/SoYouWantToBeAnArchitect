import * as Phaser from 'phaser';
import { theme } from '../../style/theme';

/**
 * Side-view pixel-art NPC: **Geir Harald**.
 *
 * Single-frame spritesheet on the same 16 × 40 logical grid as the player
 * (scale 4 → 64 × 160 px), so if we ever animate him the frame geometry
 * lines up with the player's.
 *
 * Visual identity: gray-haired, handsome executive in a dark charcoal
 * suit with a crisp white shirt and navy silk tie. Static upright idle.
 */
export function generateGeirSprite(scene: Phaser.Scene): void {
  const W = 64;
  const H = 160;
  const FRAMES = 1;

  const canvas = document.createElement('canvas');
  canvas.width = W * FRAMES;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const S = 4;
  const px = (f: number, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(f * W + x * S, y * S, w * S, h * S);
  };

  // Palette
  const HAIR = '#b8b8b8';
  const HAIR_SH = '#9a9a9a';
  const TEMPLE = '#d0d0d0';
  const SKIN = '#f1c3a0';
  const SKIN_SH = '#d9a98a';
  const JACKET = '#2b2f3a';
  const JACKET_SH = '#1f2330';
  const LAPEL = '#3a3f4f';
  const SHIRT_WHITE = '#eaeef5';
  const TIE = '#1f3a6b';
  const TIE_SH = '#15284a';
  const PANTS = '#1e2230';
  const PANTS_SH = '#141827';
  const SHOE = '#0a0a0a';
  const OUTLINE = '#1a1a1a';
  const EYE_W = theme.color.css.textWhite;
  const MOUTH = '#7a4638';

  const f = 0;
  const by = 0;

  // Hair — gray with silver temples and a darker crown shadow.
  px(f, 5, 0 + by, 6, 2, HAIR);
  px(f, 5, 1 + by, 1, 2, TEMPLE);     // silver temple
  px(f, 10, 1 + by, 1, 2, TEMPLE);
  px(f, 6, 0 + by, 4, 1, HAIR_SH);    // darker crown stripe

  // Face
  px(f, 6, 2 + by, 5, 6, SKIN);
  // Nose (faces right)
  px(f, 11, 4 + by, 1, 2, SKIN_SH);
  // Jawline highlight (subtle "chiseled" shading)
  px(f, 6, 7 + by, 5, 1, SKIN_SH);
  // Eyebrow + eye
  px(f, 8, 3 + by, 2, 1, HAIR_SH);
  px(f, 8, 4 + by, 2, 1, EYE_W);
  px(f, 9, 4 + by, 1, 1, OUTLINE);
  // Mouth (confident closed-smile)
  px(f, 9, 6 + by, 2, 1, MOUTH);
  // Neck
  px(f, 7, 8 + by, 3, 1, SKIN_SH);

  // Jacket torso
  px(f, 5, 9 + by, 6, 10, JACKET);
  // Lapels — V pointing down to the shirt
  px(f, 6, 9 + by, 1, 4, LAPEL);
  px(f, 10, 9 + by, 1, 4, LAPEL);
  // Shirt V at chest
  px(f, 7, 9 + by, 3, 3, SHIRT_WHITE);
  px(f, 8, 12 + by, 1, 1, SHIRT_WHITE);
  // Tie knot + body + tip
  px(f, 8, 10 + by, 2, 2, TIE);
  px(f, 9, 12 + by, 1, 5, TIE);
  px(f, 8, 15 + by, 2, 2, TIE_SH);
  // Jacket button line + shadow
  px(f, 7, 14 + by, 1, 5, JACKET_SH);
  // Belt edge
  px(f, 5, 19 + by, 6, 1, OUTLINE);

  // Arms at sides (rolled into jacket — no rolled sleeves here).
  // Back arm
  px(f, 4, 10 + by, 2, 6, JACKET);
  px(f, 4, 16 + by, 2, 2, JACKET_SH);  // cuff shadow
  px(f, 4, 18 + by, 2, 1, SKIN_SH);    // hand (back arm, tucked)
  // Front arm
  px(f, 11, 10 + by, 2, 6, JACKET);
  px(f, 11, 16 + by, 2, 2, JACKET_SH); // cuff shadow
  px(f, 11, 18 + by, 2, 1, SKIN);      // hand

  // Legs + shoes
  const by2 = 0;
  const legY = 20 + by2;
  const legLen = 10;
  px(f, 5, legY, 3, legLen, PANTS_SH); // back leg (shaded)
  px(f, 4, legY + legLen, 4, 2, SHOE);
  px(f, 8, legY, 3, legLen, PANTS);    // front leg
  px(f, 8, legY + legLen, 4, 2, SHOE);

  scene.textures.addSpriteSheet(
    'npc_geir',
    canvas as unknown as HTMLImageElement,
    { frameWidth: W, frameHeight: H },
  );
}
