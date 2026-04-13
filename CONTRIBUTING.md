# Contributing to MyFirstPhaserGame

## About This Project

This is an experimental Phaser game built entirely through vibe coding (AI-assisted development). Contributions follow the same approach—describe what you want to build and let AI help write the code.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/LindquistThomas/MyFirstPhaserGame.git
   cd MyFirstPhaserGame
   ```

2. If the project has not been bootstrapped yet, follow the setup skill at `.github/skills/setup-project.md`.

3. If `package.json` already exists:
   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## Project Conventions

| Area | Convention |
|------|-----------|
| Language | JavaScript (ES modules) |
| Bundler | Vite |
| Framework | Phaser 3 |
| Scenes | `src/scenes/` — PascalCase files, one class per file |
| Game objects | `src/objects/` — PascalCase files, one class per file |
| Assets | `public/assets/` — images, audio, tilemaps |
| License | MIT |

## Making Changes

1. Create a branch from the default branch.
2. Make your change. Use the skills in `.github/skills/` for common tasks:
   - `setup-project.md` — Bootstrap the project from scratch.
   - `new-scene.md` — Add a new Phaser scene.
   - `add-game-object.md` — Add a reusable game object.
3. Test locally with `npm run dev`.
4. Commit with a short, descriptive message.
5. Open a pull request.

## What Not to Do

- Do not scatter asset loading across multiple scenes; use the `Preloader` scene.
- Do not commit `node_modules/`, `dist/`, or Vite cache files (already in `.gitignore`).
- Do not introduce new build tools or frameworks without discussion.
