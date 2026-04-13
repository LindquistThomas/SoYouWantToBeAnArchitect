# Skill: Add Game Object

## Purpose

Add a reusable game object (player, enemy, collectible, UI element, etc.) to the game. Game objects encapsulate their own rendering, physics, and behavior.

## Based On

- Standard Phaser `Phaser.GameObjects.Sprite` / `Phaser.Physics.Arcade.Sprite` patterns.
- Project convention: reusable objects live in `src/objects/` with PascalCase filenames.

## Template

Create a new file at `src/objects/<ObjectName>.js`:

```js
import Phaser from 'phaser';

export class ObjectName extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    this.setCollideWorldBounds(true);
  }

  update(time, delta) {
    // Per-frame behavior
  }
}
```

For non-physics objects, extend `Phaser.GameObjects.Sprite` instead and omit the physics lines.

## Integration Steps

1. Create the object file in `src/objects/`.
2. Ensure the texture/spritesheet is loaded in the `Preloader` scene.
3. Import and instantiate the object inside the scene's `create()` method:

```js
import { ObjectName } from '../objects/ObjectName.js';

create() {
  this.myObject = new ObjectName(this, 400, 300, 'texture-key');
}
```

4. If the object has an `update()` method, call it from the scene's `update()`:

```js
update(time, delta) {
  this.myObject.update(time, delta);
}
```

## Prerequisites

Using `Phaser.Physics.Arcade.Sprite` requires Arcade physics to be enabled in the game config in `src/main.js`:

```js
const config = {
  // ...
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};
```

Adjust `gravity` as needed for your game (e.g., `{ y: 300 }` for a platformer).

## Conventions

- One class per file, file named after the class.
- Objects receive `scene` as the first constructor argument so they can register themselves.
- Keep object-specific input handling inside the object class to avoid cluttering scenes.
- Use `scene.add.existing(this)` and `scene.physics.add.existing(this)` in the constructor to self-register.
