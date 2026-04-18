# Skill: Add Game Object

## Purpose

Add a reusable gameplay entity (player, enemy, collectible, interactive prop). Entities encapsulate their own rendering, physics body, and per-frame behaviour.

## Convention

- Entities live in `src/entities/` (or `src/entities/enemies/` for enemy variants).
- Filename = PascalCase class name, `.ts`.
- Extend `Phaser.Physics.Arcade.Sprite` for physics-driven entities; `Phaser.GameObjects.Sprite` for static visuals.
- Textures are **procedural** — register them in `SpriteGenerator` (`src/systems/SpriteGenerator.ts`), not loaded as image files.

## Template

`src/entities/MyThing.ts`:

```ts
import * as Phaser from 'phaser';

export class MyThing extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'my-thing');      // 'my-thing' = texture key from SpriteGenerator
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // this.setSize(…); this.setOffset(…); tune the body as needed.
  }

  update(_time: number, _delta: number): void {
    // Per-frame behaviour. Called from the scene's update() loop, not automatically.
  }
}
```

## Integration

1. Add the texture in `SpriteGenerator` and ensure it's generated during `BootScene`.
2. Instantiate the entity in the scene's `create()`:
   ```ts
   this.myThing = new MyThing(this, 400, 300);
   ```
3. If the entity has per-frame logic, call it from the scene's `update()`:
   ```ts
   update(time: number, delta: number) {
     this.myThing?.update(time, delta);
   }
   ```
4. For collision / overlap, wire it up with `this.physics.add.collider(...)` or `.overlap(...)` in `create()`.

## Side effects via EventBus

Trigger sounds, particles, UI feedback through the typed EventBus — don't call `AudioManager` directly:

```ts
import { eventBus } from '../systems/EventBus';
eventBus.emit('sfx:jump');
```

Declare any new event names in `GameEvents` (`src/systems/EventBus.ts`) so TypeScript enforces payload correctness across the codebase.

## Persistence

If the entity contributes to save state (collectible counts, unlocks, …), go through `ProgressionSystem` — never import `SaveManager` directly from scenes or entities. Add the field to `ProgressionState` / `SaveData` and update `defaultState`, `persist`, `loadFromSave`.

## Gravity

The game config in `src/main.ts` already enables Arcade physics with `gravity.y = PLAYER_GRAVITY`. Entities that shouldn't fall need `this.setAllowGravity(false)`.
