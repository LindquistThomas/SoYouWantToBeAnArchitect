# Boss Battle — CEO Boss Fight

## Overview

A final boss fight unlocked at **25 AU**, placed above the Executive Suite (Floor 4) as a new Floor 5 (`BOSS_ARENA`). The player throws coffee mugs at the CEO boss while dodging attacks across three escalating phases. Victory awards a unique achievement and ends the game.

---

## AU Budget

Total AU available before the boss gate:

| Source | Min (all pass) | Max (all perfect) |
|--------|---------------|-------------------|
| Tokens (map) | 31 | 31 |
| Quizzes (×9 at 3–5 AU each) | 27 | 45 |
| **Total** | **58** | **76** |

Gate cost: **25 AU** — comfortably reachable with tokens alone (31 AU), no alternative AU source needed.

---

## New Floor

### `BOSS_ARENA` (`FloorId` value `6`)

Add to `FLOORS` in `src/config/gameConfig.ts`:
```ts
BOSS_ARENA: 6,
```

Add to `LEVEL_DATA` in `src/config/levelData.ts`:
```ts
[FLOORS.BOSS_ARENA]: {
  id: FLOORS.BOSS_ARENA,
  name: 'Boardroom',
  description: 'The CEO awaits. Prove your architectural worth.',
  sceneKey: 'BossArenaScene',
  auRequired: 25,
  auLabel: 'Boss AU',
  totalAU: 0,
  theme: { platformColor: 0x2a1a0a, backgroundColor: 0x0a0a0a, wallColor: 0x3a2a1a, tokenColor: 0xffd700 },
},
```

Register `BossArenaScene` in `src/scenes/sceneRegistry.ts` (same pattern as other floor scenes).

---

## Scene — `BossArenaScene`

**File:** `src/features/floors/boss/BossArenaScene.ts`

- Extends `Phaser.Scene` directly (not `LevelScene` — bespoke layout, no token/info point machinery).
- **Layout:**
  - Wide ground platform spanning the full arena width.
  - Two floating platforms (left / right) at mid-height — mug pickup points.
  - Boss spawn dais at centre-top.
  - Player spawns bottom-left.
- **Entry gate:** Reads `gameState.progression.totalAU`; if < 25 shows a "You need 25 AU" toast and returns to `ElevatorScene`.
- **Exit:** On boss defeat, show `VictoryOverlay`, wait 3 s, then `scene.start('ElevatorScene')`.
- **Music:** Add `BossArenaScene → music_boss` in `SCENE_MUSIC` (or reuse `music_executive` if no boss track is available).

---

## Boss Entity — `CEOBoss`

**File:** `src/entities/CEOBoss.ts`

### Stats
| Field | Value |
|-------|-------|
| Max HP | 10 |
| Phase 1 threshold | HP > 7 |
| Phase 2 threshold | HP 4–7 |
| Phase 3 threshold | HP ≤ 3 |
| Hitbox | 48 × 64 px |
| Hit cooldown | 500 ms (invulnerability window after each hit) |

### Phases

| Phase | Name | Behaviour |
|-------|------|-----------|
| 1 | Boardroom Blitz | Slow patrol left/right; occasional charge toward player |
| 2 | Hostile Takeover | Faster patrol; jumps to floating platforms; occasional projectile throw (briefcase) |
| 3 | Golden Parachute | Max speed; double projectile frequency; short dash toward player every 3 s; golden tint |

### Key methods
- `takeDamage()` — decrement HP, apply hit-flash tint, check phase transition, emit `sfx:boss_hit`
- `update(playerX, playerY)` — run current phase AI tick
- `destroy()` — emit `boss:defeated` on EventBus, trigger death animation

---

## Weapon — Coffee Mug Projectile

Player can throw coffee mugs (scene-local inventory, max 3). Mugs respawn on floating platforms every 10 s.

### New `GameAction`
Add `Attack = 'Attack'` to `src/input/GameAction.ts` and bind `X` in `DEFAULT_BINDINGS`.

### `CoffeeMugProjectile` entity
**File:** `src/entities/CoffeeMugProjectile.ts`

- Extends `Phaser.Physics.Arcade.Sprite`.
- Launched with `setVelocityX` (direction × 400 px/s).
- On overlap with `CEOBoss`: call `boss.takeDamage()`, destroy self.
- On world bounds exit: destroy self.

### `BossArenaScene` throw logic
```
if (inputs.isDown(GameAction.Attack) && mugCount > 0) {
  mugCount--;
  new CoffeeMugProjectile(scene, player.x, player.y, facingDir);
  eventBus.emit('sfx:mug_throw');
}
```

---

## Boss Health Bar UI

**File:** `src/ui/BossHealthBar.ts`

- Fixed top-centre, `scrollFactor(0)`.
- Gradient fill: gold (HP > 7) → orange (HP 4–7) → red (HP ≤ 3).
- Shake tween on hit (`scene.tweens.add` with `x` offset, 80 ms duration, 3 yoyo).
- Label: `"CEO — [name]"` (flavour name set at construction).
- `update(currentHp, maxHp)` method called each frame from scene.

---

## New Sprites

Add to `src/systems/sprites/` (or a new `boss.ts` family):

| Key | Description |
|-----|-------------|
| `boss_ceo` | 48 × 64 pixel-art CEO (suit + briefcase) |
| `mug_projectile` | 16 × 16 coffee mug |

Wire both into `SpriteGenerator.generate()`.

---

## New SFX

Add to `src/systems/sounds/`:

| Event key | Sound |
|-----------|-------|
| `sfx:boss_hit` | Short percussive thud |
| `sfx:boss_defeated` | Descending fanfare |
| `sfx:mug_throw` | Swoosh / ceramic clack |
| `sfx:boss_phase` | Tense sting on phase transition |

Declare all four in `GameEvents`, add to `SFX_EVENTS` in `src/config/audioConfig.ts`.

---

## Achievements

Add to `AchievementManager`:

| ID | Name | Condition | Secret |
|----|------|-----------|--------|
| `boss-defeated` | Corner Office | Defeat the CEO boss | Yes |
| `boss-no-hit` | Untouchable | Defeat boss without taking damage | Yes |

`checkAchievements()` in `GameStateManager` gains a `bossDefeated` and `tookDamageInBoss` flag check.

---

## Files to Create

| Path | Purpose |
|------|---------|
| `src/features/floors/boss/BossArenaScene.ts` | Boss arena scene |
| `src/entities/CEOBoss.ts` | Boss AI entity |
| `src/entities/CoffeeMugProjectile.ts` | Throwable projectile |
| `src/ui/BossHealthBar.ts` | Boss HP bar |
| `src/systems/sprites/boss.ts` | Procedural boss sprites |
| `src/systems/sounds/boss.ts` | Boss SFX generators |

## Files to Edit

| Path | Change |
|------|--------|
| `src/config/gameConfig.ts` | Add `BOSS_ARENA: 6` to `FLOORS` |
| `src/config/levelData.ts` | Add `BOSS_ARENA` entry |
| `src/config/audioConfig.ts` | Add `SCENE_MUSIC` entry + 4 `SFX_EVENTS` |
| `src/systems/EventBus.ts` | Declare `boss:defeated`, `sfx:boss_hit`, `sfx:boss_defeated`, `sfx:mug_throw`, `sfx:boss_phase` |
| `src/input/GameAction.ts` | Add `Attack` action |
| `src/input/InputService.ts` (or bindings) | Bind `Attack → X` |
| `src/scenes/sceneRegistry.ts` | Register `BossArenaScene` |
| `src/systems/SpriteGenerator.ts` | Wire boss sprite family |
| `src/systems/SoundGenerator.ts` | Wire boss SFX family |
| `src/systems/AchievementManager.ts` | Add two achievement IDs + checks |
| `src/systems/GameStateManager.ts` | Wire `checkAchievements` for boss flags |
| `src/scenes/elevator/ElevatorScene.ts` (or `ProductDoorManager`) | Render BOSS_ARENA floor button |
