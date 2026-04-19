# Architecture & Structure Review — April 2026

> A fresh, thorough review of the repository. The previous pass
> (landed in the Tier A/B/C refactors) retired the original god files
> and wired a proper composition root. This review measures the
> result, confirms which recommendations shipped, and identifies the
> remaining debt.

## Context

The project is a Phaser 3 / TypeScript / Vite educational platformer,
now at ~14.6K LOC. Since the previous review it has:

- Split `config/quizData.ts` (2,794 lines) into per-floor files.
- Split `config/infoContent.ts` (576 lines) the same way.
- Grouped `src/scenes/` by feature (`core/`, `elevator/`, `hall/`,
  `products/`) and moved the six floor scenes into
  `src/features/floors/<floor>/` alongside their quiz + info data.
- Shrunk `ElevatorScene.ts` from 896 → 343 lines by extracting
  `ElevatorController`, `ElevatorSceneLayout`,
  `ElevatorFloorTransitionManager`, `ProductDoorManager`,
  `ElevatorShaftDoors`, and `ElevatorZones`.
- Replaced the `scene.registry` spawn hand-off with a typed
  `NavigationContext`.
- Extracted `ModalKeyboardNavigator` + `QuizResultsScreen` out of the
  dialogs.
- Introduced a `sceneLifecycle` helper for deterministic teardown.
- Shipped a `GameStateManager` composition root that wraps
  `ProgressionSystem`, `SaveManager`, `QuizManager`, and
  `InfoDialogManager` behind a single injectable facade.
- Centralised colours + spacing under `src/style/theme.ts`.
- Split `SoundGenerator.ts` (358 lines) into a 42-line composition
  root plus per-family modules under `src/systems/sounds/`.

The team can now work on floors in parallel without touching a shared
god file. The review lens is still the same: **parallel-collaboration
friction** and **readability**.

---

## 1. What changed since the previous review

| Recommendation | Status | Evidence |
|---|---|---|
| A1. Split `quizData.ts` by floor | ✅ | Per-floor files at `src/features/floors/<floor>/quiz.ts`; barrel at `src/config/quiz/index.ts` |
| A2. Split `infoContent.ts` by floor | ✅ | `src/features/floors/<floor>/info.ts`; barrel at `src/config/info/index.ts` |
| A3. Refresh `docs/architecture.md` | ⚠ Stale again | See §3a below |
| A4. Naming convention in `CONTRIBUTING.md` | ⚠ Stale again | See §3a below |
| A5. Group `scenes/` by feature | ✅ (with caveat) | `core/`, `elevator/`, `hall/`, `products/` — but floors now live under `features/floors/` instead of `scenes/floors/`; the split is inconsistent (§3c) |
| B6. `NavigationContext` for scene transitions | ✅ | `src/scenes/NavigationContext.ts` (71 lines); registry spawn hacks gone |
| B7. Extract managers out of `LevelScene` | ✅ | `src/features/floors/_shared/LevelScene.ts` (473), `LevelEnemySpawner`, `LevelTokenManager`, `LevelZoneSetup`, `LevelDialogBindings` |
| B8. Extract managers out of `ElevatorScene` | ✅ | `src/scenes/elevator/` — 6 collaborators, scene itself at 343 lines |
| B9. Split `QuizDialog` and `InfoDialog` | ✅ | `ModalKeyboardNavigator` + `QuizResultsScreen` shared by both |
| B10. Standardise scene shutdown | ⚠ Partial | `src/systems/sceneLifecycle.ts` exists and is unit-tested, but only 6 adoption sites (§3f) |
| C11. `GameStateManager` facade with DI | ✅ | `src/systems/GameStateManager.ts`; wired via registry in `BootScene`; unit-tested |
| C12. `ThemeService` / `src/style/theme.ts` | ✅ (adoption partial) | Token tree exists (§3b); 373 hex literals still scattered |
| C13. Feature folders for floors | ✅ | `src/features/floors/<floor>/{Scene,info,quiz[,enemies]}.ts` |
| C14. Raise unit-test coverage thresholds | ❌ | Still 60% for `systems/` + `input/`; `ui/`, `scenes/`, `features/floors/` excluded |
| C15. Split `SoundGenerator.ts` | ✅ | 42-line composition root + `src/systems/sounds/*` |

**Summary:** 12/15 recommendations landed. One (docs refresh) has
drifted back and is the focus of the follow-up PR. Two (B10 lifecycle
adoption, C14 coverage) are partially done.

---

## 2. Current file-size ranking (>250 lines)

No code god files remain. The largest file is now pure quiz content,
not logic. Sizes below are approximate (`wc -l` at the time of
writing) — they drift by a handful of lines per commit, so rely on
the ordering more than the exact numbers.

| File | ~Lines | Category |
|---|---|---|
| `src/features/floors/architecture/quiz.ts` | ~1,570 | Content (question data) |
| `src/features/floors/platform/quiz.ts` | ~800 | Content |
| `src/entities/Elevator.ts` | ~495 | Entity logic |
| `src/ui/InfoDialog.ts` | ~480 | UI (scroll + nav + links) |
| `src/ui/QuizDialog.ts` | ~475 | UI (question flow) |
| `src/features/floors/_shared/LevelScene.ts` | ~475 | Shared base scene |
| `src/scenes/elevator/ElevatorSceneLayout.ts` | ~420 | Shaft visuals |
| `src/entities/Player.ts` | ~410 | Entity logic |
| `src/scenes/core/MenuScene.ts` | ~390 | Scene |
| `src/features/floors/lobby/quiz.ts` | ~385 | Content |
| `src/systems/sprites/player.ts` | ~355 | Procedural sprite |
| `src/scenes/elevator/ElevatorScene.ts` | ~345 | Scene (was ~900) |
| `src/features/floors/architecture/ArchitectureTeamScene.ts` | ~345 | Scene |
| `src/ui/InfoIcon.ts` | ~330 | UI widget |
| `src/features/floors/architecture/info.ts` | ~240 | Content |

Compare to the prior review: `quizData.ts` (~2,800) and
`ElevatorScene.ts` (~900) are gone from the top; the only files left
over ~450 lines are legitimate logic (`Elevator`, `InfoDialog`,
`QuizDialog`, `LevelScene`) or a shared shaft-layout module
(`ElevatorSceneLayout`). Everything else has been carved down.

---

## 3. Findings

### 3a. Docs have drifted back to stale (the blocker)

`docs/architecture.md` still describes the pre-split tree:

- Lists six floor scenes (`LobbyScene`, `PlatformTeamScene`,
  `ArchitectureTeamScene`, `FinanceTeamScene`,
  `ProductLeadershipScene`, `ExecutiveSuiteScene`) under
  `src/scenes/` — they now live under `src/features/floors/<floor>/`.
- Shows `config/info/` and `config/quiz/` as the owners of per-floor
  content — those directories are now just re-export barrels; the
  authored files live in `features/floors/<floor>/`.
- Has no entry for `src/style/theme.ts`, `src/systems/sounds/`,
  `src/systems/GameStateManager.ts`, `src/scenes/NavigationContext.ts`,
  or `src/systems/sceneLifecycle.ts`.
- The event catalog lists ~9 events; `GameEvents` now has 21
  (music push/pop, audio mute toggles, hit/stomp/drop/recover SFX).

`CONTRIBUTING.md`:

- Project Conventions table points newcomers at `src/config/` for all
  floor content and `src/scenes/` for all scenes.
- Naming-conventions table still references `config/info/` and
  `config/quiz/` rows; has no per-floor feature-folder row.
- The `*Service` suffix example calls `GameStateManager` "future from
  Tier C" — it has shipped.

Stale docs are the single biggest onboarding tax left in the tree.
The supporting PR in this series fixes them.

### 3b. Theme-token adoption is partial

`src/style/theme.ts` (95 lines) centralises 5 palettes, 7 UI tints, 5
status colours, 12 CSS text colours, and a 5-step spacing scale.
Adoption is incomplete: 373 hex literals remain across 30 files.
Concentrations:

| File | Hex literals |
|---|---|
| `src/ui/QuizDialog.ts` | 40 |
| `src/entities/Elevator.ts` | 34 |
| `src/scenes/core/MenuScene.ts` | 33 |
| `src/ui/InfoDialog.ts` | 31 |
| `src/scenes/elevator/ElevatorSceneLayout.ts` | 24 |
| `src/systems/sprites/player.ts` | 20 |
| `src/systems/sprites/enemies.ts` | 19 |
| `src/systems/sprites/elevator.ts` | 18 |

Most are procedural sprite palettes (fine — those are asset-local)
but the scene + UI counts indicate token adoption is still a
file-by-file job.

### 3c. Scene placement is inconsistent

Scenes are split across two trees:

```
src/scenes/core/       BootScene, MenuScene
src/scenes/elevator/   ElevatorScene + 6 collaborators
src/scenes/hall/       ProductsHallScene
src/scenes/products/   4 product-room scenes + ProductRoomScene base
src/features/floors/   6 floor scenes (co-located with info + quiz)
```

The split started as "feature-based scenes live under `features/`,
infrastructure scenes stay under `scenes/`." That reading holds for
`core/` and `elevator/`, but the products hall and product rooms are
feature content that could move to `src/features/products/` — the
`ProductIsy*` rooms each ship their own room layout, music cue, and
door back to the hall.

This is a Tier-D cleanup, not urgent.

### 3d. One large content file (not logic)

`src/features/floors/architecture/quiz.ts` at 1,568 lines is the
biggest single file in `src/`. Because the split is by floor, it is
only edited by the architecture-floor owner and does not cause
merge conflicts the way the original `quizData.ts` did. However:

- If a second author wants to add questions for the *same* floor, the
  file is again a bottleneck.
- Reading the file top-to-bottom to find a specific question is slow.

A future split by topic (integration, cloud, patterns, SOA, …) would
keep the co-location pattern intact: `features/floors/architecture/
quiz/<topic>.ts` plus a barrel at `features/floors/architecture/
quiz/index.ts`. Not urgent; watch for the 2,000-line line.

### 3e. Coverage thresholds are stalled at 60%

`vitest.config.ts`:

- Thresholds enforced: `src/systems/**` and `src/input/**` at 60%.
- Entirely excluded from coverage: `src/scenes/**`,
  `src/features/floors/**`, `src/ui/**`, `src/entities/**`,
  `src/plugins/**`, sprite + sound generators.

With `GameStateManager` shipped, UI and scene code is now injectable —
the original justification for excluding them ("not testable in
isolation") no longer applies. The next useful step is:

1. Raise `systems/` + `input/` to 80% (both already near that in
   practice).
2. Add a 60% floor for `src/ui/**` and pick 1–2 scenes to unit-test
   through `GameStateManager` to prove the pattern.

### 3f. `sceneLifecycle` adoption is partial

`createSceneLifecycle(scene)` exists in `src/systems/sceneLifecycle.ts`
and is unit-tested. Call sites today: `LevelZoneSetup`, `ElevatorZones`,
`HUD`, `LobbyScene`, `MenuScene`, and its own test — six total.

`ElevatorScene`, `ElevatorSceneLayout`, and the five other floor
scenes still manage `scene.events.once('shutdown', …)` teardown by
hand. The collaborators they wrap do use the helper, so the
leak-risk is contained, but the pattern is not uniform — exactly the
failure mode the Tier B item was meant to prevent.

### 3g. New "monitor, don't refactor" items

- `src/scenes/elevator/ElevatorSceneLayout.ts` (422 lines) owns
  shaft visuals + floor labels + unlock-state rendering. If a future
  feature adds more shaft chrome, split it into
  `shaftVisuals.ts` + `floorLabels.ts`. Not needed today.
- `src/ui/InfoIcon.ts` (328 lines) has been unchanged for a while;
  the sprite/badge/interactivity combo is acceptable. Note but don't
  touch.

### 3h. What's working well (do not regress)

- **`EventBus.ts` typed catalog.** 21 typed events, ~86 call sites,
  zero silent typos — `GameEventName` keeps the compiler honest. Up
  from ~54 call sites at the last review with no loss of hygiene.
  (See `docs/architecture.md` for the full catalog; check
  `src/systems/EventBus.ts` for the authoritative count.)
- **`GameStateManager` injection pattern.** One facade wraps four
  stores; tests swap a fake `KVStorage` once and all four modules
  behave.
- **Feature folders.** One floor = one directory. Scene + info +
  quiz + optional enemies live together. Ownership is visible.
- **Procedural assets.** Still zero image deps; `BootScene` generates
  everything once.
- **Zero TODO/FIXME/HACK hotspots.** A clean grep across `src/` —
  rare enough to call out.
- **`input/` facade + `sceneLifecycle` shape.** Both follow the
  "one barrel file, composition inside" pattern the rest of the
  tree should aim for.

---

## 4. Recommendations, prioritised

### Tier D — doc refresh (do first; this PR)

D1. **Update `docs/architecture.md`** to match the current tree:
add `features/floors/`, `style/`, `systems/sounds/`,
`GameStateManager`, `NavigationContext`, `sceneLifecycle`; refresh
the ownership table to point floor rows at
`features/floors/<floor>/`; expand the event catalog to the full 19
entries.

D2. **Update `CONTRIBUTING.md`** to match: add a `features/floors/`
row + a `Theme tokens` row to the Project Conventions; drop the
stale `config/info/` and `config/quiz/` rows from the
naming-conventions table and add a `Per-floor feature folder` row;
move `GameStateManager` from "future" to "shipped" under the
`*Service` suffix.

### Tier C — remainders

C14. **Raise unit-test coverage thresholds.** Bump `systems/` +
`input/` to 80%. Add a 60% floor for `src/ui/**` — start by
writing one unit test each against `HUD` and `DialogController`
using a fake `GameStateManager` (the pattern is already proven by
`sceneLifecycle.test.ts`). Once green, expand to scenes.

B10-follow-up. **Universal `sceneLifecycle` adoption.** Migrate
`ElevatorScene`, `ElevatorSceneLayout`, and the six floor scenes to
use `createSceneLifecycle`. Mechanical change; prevents future
listener-cleanup bugs.

### Tier E — follow-ons (not urgent)

E1. **Theme-token pass-through** in the four hex-heavy files
(`QuizDialog`, `InfoDialog`, `Elevator`, `MenuScene`). Replace each
hex literal with the corresponding `theme.color.*` token; leave
procedural-sprite palettes alone (asset-local).

E2. **Consolidate scenes under `src/features/`.** Move
`scenes/hall/` + `scenes/products/` to
`src/features/products/{hall,rooms}` to match the pattern already
set by `features/floors/`. Keep `scenes/core/` and `scenes/elevator/`
where they are (infrastructure).

E3. **Topic-sub-split `architecture/quiz.ts`** only if it crosses
~2,000 lines; earlier is premature.

E4. **Coverage for `entities/`** — re-include `src/entities/**` and
set a 60% floor. `Player`, `Elevator`, and `Token` already have unit
tests; the threshold ratchets the existing coverage.

### Not recommended

- **No route-based scene loader / URL deep-linking.** Unchanged
  since last review.
- **No Redux/Zustand.** `EventBus` + `GameStateManager` already
  cover state.
- **No monorepo split.** 14.6K LOC is still premature.

---

## 5. Suggested implementation order

1. Tier D (this PR). Docs catch up to code. One reviewer, one
   morning. Lowest risk.
2. Tier C14 + B10-follow-up in parallel. Both mechanical. One PR
   each, one day each.
3. Tier E1 (theme tokens) file-by-file, one PR per file.
4. Tier E2 (scene consolidation). Last; requires updating `main.ts`
   imports and does not belong with the doc refresh.

---

## 6. Critical files by topic

- **Docs to update (this PR):** `docs/architecture-review.md`,
  `docs/architecture.md`, `CONTRIBUTING.md`.
- **Composition roots / patterns to extend:**
  `src/systems/GameStateManager.ts`,
  `src/systems/sceneLifecycle.ts`, `src/scenes/NavigationContext.ts`,
  `src/style/theme.ts`, `src/input/index.ts`.
- **Event contract:** `src/systems/EventBus.ts`.
- **Per-floor work lives here now:** `src/features/floors/<floor>/`.
- **Remaining infrastructure scenes:** `src/scenes/core/`,
  `src/scenes/elevator/`, `src/scenes/hall/`, `src/scenes/products/`.
- **Test thresholds:** `vitest.config.ts`.
- **Watch list (do not regress):** `src/ui/InfoDialog.ts` (479),
  `src/ui/QuizDialog.ts` (473),
  `src/scenes/elevator/ElevatorSceneLayout.ts` (422),
  `src/entities/Elevator.ts` (495), `src/entities/Player.ts` (408).

---

## 7. Verifying any refactor

Because the recommendations are either pure doc updates (Tier D) or
behind-the-API refactors (C14, B10-follow-up, E1, E2), the existing
test stack is the safety net:

- `npm run lint` — no new violations.
- `npm run build` — `tsc` strict passes.
- `npm run test:unit` — all Vitest suites pass; add a focused test
  next to each new adopter of `sceneLifecycle` or `GameStateManager`.
- `npm test` — Playwright E2E (`menu`, `elevator`, `floors`,
  `tokens`, `quiz`, `progression`, `visual`) passes unchanged.

For the doc updates specifically, path-check every reference: every
file path quoted in `docs/architecture.md`, `docs/architecture-review.md`,
and `CONTRIBUTING.md` must resolve in `src/`. A dead path is a
regression.

Manually run `npm run dev` and complete one full elevator ride + one
quiz on each floor before merging any scene or UI refactor.
