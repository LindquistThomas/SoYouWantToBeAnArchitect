# Skill: New Scene

## Purpose

Add a new Phaser scene to the game. Every distinct screen or game state (menu, gameplay, game-over, etc.) is its own scene.

## Based On

- Standard Phaser `Phaser.Scene` lifecycle used in every Phaser project.
- Project convention: scenes live in `src/scenes/` with PascalCase filenames.

## Template

Create a new file at `src/scenes/<SceneName>.js`:

```js
import Phaser from 'phaser';

export class SceneName extends Phaser.Scene {
  constructor() {
    super('SceneName');
  }

  preload() {
    // Load assets specific to this scene (prefer using the Preloader scene instead)
  }

  create() {
    // Set up game objects, input, and events
  }

  update(time, delta) {
    // Per-frame game logic
  }
}
```

## Integration Steps

1. Create the scene file in `src/scenes/`.
2. Import the scene in `src/main.js`.
3. Add the scene class to the `scene` array in the Phaser game config.

```js
// In src/main.js
import { SceneName } from './scenes/SceneName.js';

const config = {
  // ...
  scene: [Boot, Preloader, MainMenu, Game, SceneName]
};
```

## Conventions

- The string passed to `super()` must be unique across all scenes and is used as the scene key.
- Keep asset loading in the `Preloader` scene whenever possible; only use `preload()` in other scenes for scene-specific assets.
- Transition between scenes using `this.scene.start('SceneKey')`.
