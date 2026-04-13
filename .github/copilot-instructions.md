# Copilot Instructions for MyFirstPhaserGame

## Project Overview

This is a Phaser-based browser game built entirely through vibe coding (AI-assisted development). The project uses the Node.js ecosystem with Vite as the bundler.

## Repository Structure

```
MyFirstPhaserGame/
├── .github/
│   ├── copilot-instructions.md   # This file — AI coding guidance
│   └── skills/                   # Prompt-based skills for common tasks
├── .gitignore                    # Node.js / Vite ignores
├── LICENSE                       # MIT
├── README.md                     # Project description
└── CONTRIBUTING.md               # Contributor guide
```

As the game grows, the expected source layout (following standard Phaser + Vite conventions) is:

```
src/
├── main.js          # Phaser game config and entry point
├── scenes/          # One file per Phaser scene
│   ├── Boot.js
│   ├── Preloader.js
│   ├── MainMenu.js
│   └── Game.js
└── objects/         # Reusable game objects and sprites
public/
└── assets/          # Images, audio, tilemaps, spritesheets
index.html           # HTML shell that loads the Vite bundle
package.json         # Dependencies and scripts
vite.config.js       # Vite configuration
```

## Key Conventions

### Language & Style
- Use **JavaScript** (ES modules, `import`/`export`).
- Follow the naming conventions implied by the Node.js `.gitignore` already in the repo.
- File names use **PascalCase** for scenes and game objects (e.g., `MainMenu.js`, `Player.js`).
- Config and tooling files use **lowercase** (e.g., `vite.config.js`, `package.json`).

### Phaser Patterns
- Each scene is a class extending `Phaser.Scene`.
- Scenes implement `preload()`, `create()`, and `update()` lifecycle methods as needed.
- Scene keys are registered as strings in the Phaser game config and must match the key passed to `super()` in the scene constructor.
- Assets are loaded in a dedicated `Preloader` scene, not scattered across scenes.

### Bundling & Dev Server
- **Vite** is the bundler (indicated by Vite-specific entries in `.gitignore`).
- Use `npm run dev` for local development and `npm run build` for production builds.
- Static assets live in `public/assets/` so Vite serves them as-is.

## How to Extend This Project

1. **Add a new scene** — Use the `new-scene` skill in `.github/skills/`.
2. **Add a game object** — Use the `add-game-object` skill in `.github/skills/`.
3. **Add an asset** — Place it in `public/assets/` and load it in the `Preloader` scene.
4. **Add a dependency** — Run `npm install <package>` and import it where needed.

## Vibe Coding Workflow

This project is developed through conversational AI assistance. When prompting:

- Describe the desired game behavior or mechanic in plain language.
- Reference existing scenes or objects by name so the AI can locate them.
- Ask for one change at a time to keep diffs small and reviewable.
- Test in the browser after each change (`npm run dev`).
