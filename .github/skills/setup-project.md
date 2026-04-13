# Skill: Setup Project

## Purpose

Bootstrap the Phaser + Vite project from scratch. Use this skill when the repository has no `package.json` or `src/` directory yet.

## Based On

- `README.md` — declares this is a Phaser game project.
- `.gitignore` — contains Node.js and Vite ignore patterns, confirming the intended toolchain.

## Steps

1. Initialize the project:
   ```bash
   npm init -y
   ```

2. Install Phaser and Vite:
   ```bash
   npm install phaser
   npm install --save-dev vite
   ```

3. Create `vite.config.js` at the project root:
   ```js
   import { defineConfig } from 'vite';

   export default defineConfig({
     base: './',
     build: {
       outDir: 'dist'
     }
   });
   ```

4. Create `index.html` at the project root:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>MyFirstPhaserGame</title>
   </head>
   <body>
     <script type="module" src="/src/main.js"></script>
   </body>
   </html>
   ```

5. Create `src/main.js` with the Phaser game config:
   ```js
   import Phaser from 'phaser';
   import { Boot } from './scenes/Boot.js';
   import { Preloader } from './scenes/Preloader.js';
   import { MainMenu } from './scenes/MainMenu.js';
   import { Game } from './scenes/Game.js';

   const config = {
     type: Phaser.AUTO,
     width: 800,
     height: 600,
     parent: 'game-container',
     scene: [Boot, Preloader, MainMenu, Game]
   };

   new Phaser.Game(config);
   ```

6. Create the starter scenes in `src/scenes/` (see the `new-scene` skill for the pattern).

7. Create the `public/assets/` directory for static game assets.

8. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

9. Verify with:
   ```bash
   npm run dev
   ```

## Notes

- The `.gitignore` already covers `node_modules/`, `dist/`, and Vite cache files.
- All game assets go in `public/assets/` so Vite serves them without processing.
