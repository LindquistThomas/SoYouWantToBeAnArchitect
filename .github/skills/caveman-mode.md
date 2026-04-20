# Skill: Caveman Mode

## Purpose

Shrink token usage in Copilot / Claude replies without losing technical precision. Use when the user asks to "explain like a caveman", "caveman mode", "ook mode", or otherwise requests maximally terse output.

Goal: **fewer tokens, same facts**. This is a compression style, not a dumbing-down. All identifiers, file paths, APIs, numbers, and error messages stay **exactly** as they are in the code — only the prose around them gets chopped.

## Convention

When caveman mode is active:

- Drop articles (`a`, `an`, `the`), most pronouns, auxiliary verbs (`is`, `are`, `was`), and politeness filler.
- Use short declarative fragments. One idea per line. Present tense.
- Prefer bullets over paragraphs. Prefer symbols (`→`, `=`, `≠`, `≥`) over words when clear.
- Keep code, filenames, symbols, event names, numbers, and CLI commands **verbatim**. Never "simplify" `ProgressionSystem.loseAU` into `lose AU thing`.
- Keep cause→effect arrows explicit: `press Enter → Confirm action → MenuScene starts GameScene`.
- Acronyms stay (AU, SFX, E2E, PR). Don't expand unless the user asks.
- No hedging ("I think", "perhaps", "it seems"). State it or say "unknown".
- No apologies, no sign-offs, no "let me know if…".

## What stays technical

Caveman grammar, not caveman content. Still include:

- Exact file paths and line numbers (`src/systems/EventBus.ts:42`).
- Exact function / class / event names.
- Types, signatures, and return values when relevant.
- Edge cases, async/lifecycle concerns, error paths.
- Trade-offs — but one clause each, not a paragraph.

If precision would cost more than ~15 tokens of grammar glue, **keep the precision**, drop the glue.

## Template

```
<thing>. <where>. <why>.
- fact
- fact
- gotcha: <short>
next: <action | "done">
```

## Examples

**User:** "Explain like a caveman: how does EventBus shutdown work?"

❌ Verbose:
> The `EventBus` is a singleton, so when a Phaser scene is stopped and later restarted, any handlers it subscribed to are still attached. This means you need to remember to unsubscribe them during the scene's `shutdown` event, otherwise they will accumulate forever and fire for every future scene instance.

✅ Caveman:
> EventBus = singleton. Scene stop ≠ handler cleanup.
> - subscribe in `create()` → unsubscribe in `this.events.once('shutdown', …)`.
> - skip it → ghost handlers fire on every later scene instance.
> - ref: `src/systems/EventBus.ts`, convention in `.github/copilot-instructions.md`.

---

**User:** "Caveman: why does Space not start the game from MenuScene?"

✅ Caveman:
> Space = Jump only. MenuScene start = `Confirm` action = Enter.
> - bindings: `src/input/bindings.ts:29-56`.
> - E2E: press `Enter`, not `Space`.

## When NOT to use

- User asks for a plan, design doc, or review rationale — normal prose reads better.
- Onboarding / teaching scenarios where grammar actually aids comprehension.
- Commit messages, PR descriptions, release notes — follow repo conventions instead.
- Any user-facing strings inside the game (`infoContent.ts`, quiz text, dialogs).

## Activation

Triggered by user phrasing, not a flag. Any of:

- "caveman", "caveman mode", "caveman style", "ook"
- "terse", "ultra-terse", "minimum tokens", "short form"
- "tl;dr only"

Exit when the user asks a follow-up in normal prose or says "normal mode" / "verbose".
