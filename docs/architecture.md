# Architecture

A one-page map of the codebase. For setup and conventions see
[`CONTRIBUTING.md`](../CONTRIBUTING.md). For the current structural
review (god files retired, Tier A/B/C status), see
[`architecture-review.md`](./architecture-review.md).

## Module Map

```
src/
├── main.ts                   Phaser game bootstrap; scene registration.
├── config/                   Shared constants + back-compat barrels.
│   ├── gameConfig.ts         World dimensions, physics, colours, FLOORS enum.
│   ├── levelData.ts          Per-floor metadata: name, scene key, AU thresholds, theme.
│   ├── audioConfig.ts        SFX key ↔ event-name map; music track list.
│   ├── info/                 Barrel — merges per-floor info into INFO_POINTS.
│   │   ├── index.ts          Re-export barrel + `getInfoPointsFor(floorId)`.
│   │   └── types.ts          `InfoPointDef` shape.
│   └── quiz/                 Barrel — merges per-floor quizzes into QUIZ_DATA.
│       ├── index.ts          Re-export barrel + `getQuizFor(floorId)`.
│       └── types.ts          `QuizDefinition` + scoring constants.
├── features/                 Per-feature trees (feature = floor, for now).
│   └── floors/               One directory per floor — scene + content co-located.
│       ├── index.ts          Barrel that re-exports every floor scene.
│       ├── _shared/          Base class + manager collaborators used by every floor.
│       │   ├── LevelScene.ts           Shared base scene (composition root).
│       │   ├── LevelEnemySpawner.ts    Spawns + cleans up enemies.
│       │   ├── LevelTokenManager.ts    Spawns AU tokens + handles pickup.
│       │   ├── LevelZoneSetup.ts       Registers proximity zones for info points.
│       │   └── LevelDialogBindings.ts  Wires dialog triggers to zones.
│       ├── lobby/            LobbyScene.ts + info.ts + quiz.ts (tutorial content).
│       ├── platform/         Platform Team — + enemies.ts for the bureaucracy-bot.
│       ├── architecture/     Architecture Team — largest quiz pool.
│       ├── finance/          Finance — Business floor, left room.
│       ├── product/          Product Leadership — Business floor, right room.
│       └── executive/        ExecutiveSuiteScene.ts (penthouse).
├── entities/                 Gameplay objects owned by scenes.
│   ├── Player.ts             Side-view sprite, movement, footstep/jump cues.
│   ├── Elevator.ts           Cab physics, floor docking, ride cues.
│   ├── Token.ts              AU token pickup with floating animation.
│   ├── DroppedAU.ts          AU tokens dropped by defeated enemies.
│   ├── Enemy.ts              Shared enemy base (physics, damage, death cues).
│   └── enemies/              Per-enemy config & behaviour.
│       ├── Slime.ts
│       └── BureaucracyBot.ts
├── input/                    Semantic-action input layer.
│   ├── index.ts              Facade — the only import surface the rest of the game uses.
│   ├── InputService.ts       Keyboard/touch → semantic actions; context stack.
│   ├── actions.ts            GameAction catalog ("move-left", "jump", …).
│   ├── bindings.ts           Default key bindings per action context.
│   ├── pointerBindings.ts    Touch/pointer action bindings.
│   ├── keyLabels.ts          Human-readable key names for UI hints.
│   └── phaser-augment.d.ts   Phaser typings adjustments for the service.
├── scenes/                   Infrastructure scenes (non-floor).
│   ├── NavigationContext.ts  Typed hand-off for `scene.start(key, ctx)`.
│   ├── core/
│   │   ├── BootScene.ts      Generates every sprite + sound; creates `GameStateManager`.
│   │   └── MenuScene.ts      Title screen; new game / continue; save-slot UI.
│   ├── elevator/             Elevator-shaft orchestrator + collaborators.
│   │   ├── ElevatorScene.ts               Thin orchestrator (~343 lines).
│   │   ├── ElevatorController.ts          Owns the Elevator entity + ride loop.
│   │   ├── ElevatorSceneLayout.ts         Shaft visuals, floor labels, unlock rendering.
│   │   ├── ElevatorFloorTransitionManager.ts  Floor-to-floor transition state.
│   │   ├── ElevatorShaftDoors.ts          Side-view landing doors that open on dock.
│   │   ├── ElevatorZones.ts               Lobby zones, info icons, first-ride intro.
│   │   └── ProductDoorManager.ts          Per-product door state on the products floor.
│   ├── hall/
│   │   └── ProductsHallScene.ts  Floor 5 hall — one door per ISY product.
│   └── products/             Individual product rooms reached from the hall.
│       ├── ProductRoomScene.ts            Shared base for product rooms below.
│       ├── ProductIsyProjectControlsScene.ts
│       ├── ProductIsyBeskrivelseScene.ts
│       ├── ProductIsyRoadScene.ts
│       └── ProductAdminLisensScene.ts
├── style/                    Design tokens.
│   └── theme.ts              Central colour + spacing tokens (numeric + CSS strings).
├── systems/                  Cross-cutting logic — no Phaser GameObject deps.
│   ├── EventBus.ts           Typed pub/sub; `GameEvents` is the event catalog.
│   ├── GameStateManager.ts   Composition root — wraps the four persistent stores.
│   ├── ZoneManager.ts        Proximity zones; emits `zone:enter/exit`.
│   ├── ProgressionSystem.ts  AU accumulation, floor unlocks, token dedupe.
│   ├── SaveManager.ts        LocalStorage with pluggable `KVStorage` for tests.
│   ├── QuizManager.ts        Quiz pass/fail records + retry cooldowns.
│   ├── InfoDialogManager.ts  Remembers which info points have been seen.
│   ├── AudioManager.ts       Subscribes to music/sfx events; plays via WebAudio.
│   ├── sceneLifecycle.ts     `createSceneLifecycle(scene)` — uniform teardown.
│   ├── SpriteGenerator.ts    Composition root → `./sprites/` per-asset modules.
│   ├── SoundGenerator.ts     Composition root → `./sounds/` per-family modules.
│   ├── MusicGenerator.ts     Procedural fallback tracks.
│   ├── sounds/               One file per SFX family (combat, footsteps, ui, …).
│   │   ├── footsteps.ts
│   │   ├── movement.ts
│   │   ├── combat.ts
│   │   ├── quiz.ts
│   │   ├── ui.ts
│   │   └── wav.ts
│   └── sprites/              One file per asset family (player, tiles, token, …).
├── ui/                       Modal + HUD widgets built on Phaser containers.
│   ├── ModalBase.ts          Overlay + fade + Esc-key scaffolding for dialogs.
│   ├── ModalKeyboardNavigator.ts  Shared keyboard nav for InfoDialog + QuizDialog.
│   ├── InfoDialog.ts         Info content modal (extends ModalBase).
│   ├── QuizDialog.ts         Quiz flow modal (extends ModalBase).
│   ├── QuizResultsScreen.ts  Extracted results screen used by QuizDialog.
│   ├── DialogController.ts   Orchestrates info → quiz → badge-refresh flow.
│   ├── InfoIcon.ts           Floating "i" icon with quiz badge.
│   ├── HUD.ts                AU counter, floor label.
│   ├── ElevatorButtons.ts    Touch controls for the elevator cab.
│   └── ElevatorPanel.ts      Floor-select panel inside the cab.
└── plugins/                  Phaser plugins.
    ├── DebugPlugin.ts        Toggleable debug overlay.
    └── MusicPlugin.ts        Scene-level music lifecycle helper.
```

## Ownership map (who owns what)

Use this to find the right file to edit for a given feature.

| Feature area                        | Primary files                                                                          |
|-------------------------------------|----------------------------------------------------------------------------------------|
| Lobby / tutorial                    | `features/floors/lobby/{LobbyScene,info,quiz}.ts`                                      |
| Platform Team room                  | `features/floors/platform/{PlatformTeamScene,info,quiz,enemies}.ts`                    |
| Architecture Team room              | `features/floors/architecture/{ArchitectureTeamScene,info,quiz}.ts`                    |
| Finance room                        | `features/floors/finance/{FinanceTeamScene,info,quiz}.ts`                              |
| Product Leadership                  | `features/floors/product/{ProductLeadershipScene,info,quiz}.ts`                        |
| Products hall + product rooms       | `scenes/hall/ProductsHallScene.ts`, `scenes/products/Product*Scene.ts`                 |
| Executive Suite                     | `features/floors/executive/{ExecutiveSuiteScene,info,quiz}.ts`                         |
| Shared floor base / managers        | `features/floors/_shared/*.ts`                                                         |
| Elevator shaft + transitions        | `scenes/elevator/*.ts`                                                                 |
| Scene hand-off (spawn / load hints) | `scenes/NavigationContext.ts`                                                          |
| Scene teardown helper               | `systems/sceneLifecycle.ts`                                                            |
| Game-state composition root         | `systems/GameStateManager.ts`                                                          |
| Player movement & animation         | `entities/Player.ts`                                                                   |
| Enemies                             | `entities/Enemy.ts`, `entities/enemies/*.ts`                                           |
| AU / tokens / progression           | `entities/Token.ts`, `entities/DroppedAU.ts`, `systems/ProgressionSystem.ts`           |
| Save slots                          | `systems/SaveManager.ts`, `scenes/core/MenuScene.ts`                                   |
| Quiz runtime                        | `systems/QuizManager.ts`, `ui/QuizDialog.ts`, `ui/QuizResultsScreen.ts`                |
| Info modal runtime                  | `systems/InfoDialogManager.ts`, `ui/InfoDialog.ts`, `ui/DialogController.ts`           |
| Input (keyboard + touch)            | `input/*`                                                                              |
| Audio                               | `systems/AudioManager.ts`, `systems/SoundGenerator.ts`, `systems/sounds/*`, `systems/MusicGenerator.ts` |
| Procedural sprites                  | `systems/SpriteGenerator.ts`, `systems/sprites/*.ts`                                   |
| Theme tokens (colours + spacing)    | `style/theme.ts`                                                                       |

## Data Flow

### Scene graph

```
BootScene  →  MenuScene  →  ElevatorScene  ↔  Floor scenes (features/floors/*)
                                            ↘  ProductsHallScene  →  product rooms
```

`BootScene` generates every sprite + sound once, creates the
`GameStateManager`, and hands off to `MenuScene`. `ElevatorScene` is
the central shaft; rides transition into the floor scenes in
`features/floors/<floor>/` (each a thin wrapper around the shared
`LevelScene`). The Products hall exits into individual product rooms
under `scenes/products/`.

### Scene hand-off

Transitions go through `scenes/NavigationContext.ts`. Scenes call
`scene.scene.start(key, ctx)` with a typed `NavigationContext` —
spawn side, returning floor, product-door id, and the one-shot
`loadSave` flag. The old `scene.registry` spawn-state pattern is
gone.

### Persistent state

`GameStateManager` (in `systems/GameStateManager.ts`) is constructed
once in `BootScene.create()` and stashed in `scene.registry` under
the key `gameState`. It owns the `ProgressionSystem` instance and
exposes facades over the three module-level stores (`SaveManager`,
`QuizManager`, `InfoDialogManager`). Tests inject a fake `KVStorage`
into the constructor to swap localStorage atomically.

### Runtime wiring

```
                 ┌──────────────┐
 Input ───────► │ InputService │──► Player.update
                 └──────────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │    Scene    │
                                └─────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
     ┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
     │ ZoneManager     │      │ DialogController│      │ GameStateManager │
     └─────────────────┘      └─────────────────┘      └──────────────────┘
              │                        │                        │
              └──────────┐             │           ┌────────────┘
                         ▼             ▼           ▼
                     ┌──────────────────────────────┐
                     │   eventBus (GameEvents map)  │
                     └──────────────────────────────┘
                         │             │
                         ▼             ▼
                 ┌───────────────┐   ┌───────────────┐
                 │ AudioManager  │   │ UI subscribers│
                 └───────────────┘   └───────────────┘
```

### Event catalog

Every pub/sub message goes through `src/systems/EventBus.ts`. The
`GameEvents` interface at the top of that file is the catalog —
adding an event there type-checks every call site automatically.

| Event                | Payload            | Emitters                     | Consumers     |
|----------------------|--------------------|------------------------------|---------------|
| `music:play`         | `key: string`      | Scenes, ElevatorController   | AudioManager  |
| `music:stop`         | —                  | MusicPlugin                  | AudioManager  |
| `music:push`         | `key: string`      | Scenes (temp overlay music)  | AudioManager  |
| `music:pop`          | —                  | Scenes (restore after push)  | AudioManager  |
| `audio:toggle-mute`  | —                  | Menu / HUD                   | AudioManager  |
| `audio:mute-changed` | `muted: boolean`   | AudioManager                 | HUD, Menu     |
| `zone:enter`         | `zoneId: string`   | ZoneManager                  | Scenes, UI    |
| `zone:exit`          | `zoneId: string`   | ZoneManager                  | Scenes, UI    |
| `sfx:info_open`      | —                  | DialogController             | AudioManager  |
| `sfx:link_click`     | —                  | InfoDialog                   | AudioManager  |
| `sfx:jump`           | —                  | Player                       | AudioManager  |
| `sfx:footstep_a/b`   | —                  | Player                       | AudioManager  |
| `sfx:quiz_correct`   | —                  | QuizDialog                   | AudioManager  |
| `sfx:quiz_wrong`     | —                  | QuizDialog                   | AudioManager  |
| `sfx:quiz_success`   | —                  | QuizDialog                   | AudioManager  |
| `sfx:quiz_fail`      | —                  | QuizDialog                   | AudioManager  |
| `sfx:hit`            | —                  | Player (damage)              | AudioManager  |
| `sfx:stomp`          | —                  | Enemy (stomped)              | AudioManager  |
| `sfx:drop_au`        | —                  | Player (AU dropped on hit)   | AudioManager  |
| `sfx:recover_au`     | —                  | Player (AU recovered)        | AudioManager  |

## Testing

- **Unit tests** (`npm run test:unit`) live next to their sources as
  `*.test.ts` and run in jsdom under Vitest. They cover pure
  systems: `EventBus`, `SaveManager`, `QuizManager`,
  `ProgressionSystem`, `ZoneManager`, `InputService`,
  `InfoDialogManager`, `AudioManager`, `GameStateManager`,
  `sceneLifecycle`, and the `config/info` + `config/quiz` barrels.
- **End-to-end tests** (`npm test`) drive the real game via
  Playwright (`menu`, `elevator`, `floors`, `tokens`, `quiz`,
  `progression`, `visual`).
- **Type safety** (`npm run build`) runs `tsc` strict before Vite
  bundles.
- **Coverage thresholds** (`vitest.config.ts`): `src/systems/**` and
  `src/input/**` at 60%. `src/scenes/**`, `src/features/floors/**`,
  `src/ui/**`, and `src/entities/**` are excluded pending a wider
  rollout after `GameStateManager` adoption.

## Key design choices

- **Procedural assets.** No image files. `BootScene` generates every
  sprite into Phaser's texture cache at startup.
- **Event-driven coupling.** Systems don't hold references to each
  other; they publish and subscribe through `eventBus`. Audio is a
  pure subscriber.
- **Pluggable storage.** `SaveManager` exposes a `KVStorage`
  interface so tests can swap in an in-memory store without
  monkey-patching `localStorage`. `GameStateManager` forwards that
  interface to the other three stores in its constructor.
- **Single composition root for game state.** `GameStateManager` is
  the only thing that knows how the four persistent stores fit
  together. Scenes and UI read from it; tests replace it.
- **Typed scene hand-off.** `NavigationContext` collects every
  cross-scene field in one optional-everything interface. No registry
  spelunking; no per-scene "data" shapes.
- **Uniform scene teardown.** `createSceneLifecycle(scene)` gives
  every scene one disposer list that fires on both `shutdown` and
  `destroy`. Adoption is in progress — the pattern is the target for
  all scenes.
- **Config as data.** `src/config/` owns constants, floor metadata,
  barrel re-exports of per-floor content. The authored quiz + info
  text lives alongside its scene under `src/features/floors/`.
- **One file per floor.** Each floor's owner edits
  `features/floors/<floor>/{Scene,info,quiz[,enemies]}.ts`. Merge
  hotspots are gone.
- **Centralised theme tokens.** `style/theme.ts` owns the colour and
  spacing catalogue; both numeric (`0x…`) and CSS (`#…`) forms are
  co-located so Phaser graphics and Text styles share the same
  source of truth.
