import * as Phaser from 'phaser';
import { SPRITE_PHASES } from '../../systems/SpriteGenerator';
import type { GeneratorPhase } from '../../systems/SpriteGenerator';
import { SOUND_PHASES } from '../../systems/SoundGenerator';
import { AudioManager } from '../../systems/AudioManager';
import { GameStateManager } from '../../systems/GameStateManager';
import { eventBus } from '../../systems/EventBus';
import { STATIC_MUSIC_ASSETS } from '../../config/audioConfig';
import { COLORS } from '../../config/gameConfig';
import { theme } from '../../style/theme';
import { migrateDefaultSlot, setPlayerSlot } from '../../systems/SaveManager';

export class BootScene extends Phaser.Scene {
  // Guard: window listener is installed once per instance and removed only
  // when the Phaser.Game is fully destroyed (not on scene shutdown, which
  // fires immediately when this.scene.start() hands off to MenuScene).
  private _muteHotkeyInstalled = false;

  // Progress UI elements — created in preload(), driven in create().
  // Optional chaining is used throughout so create() works safely even
  // when preload() was not called (e.g. unit tests).
  private _progressBar: Phaser.GameObjects.Graphics | null = null;
  private _progressBox: Phaser.GameObjects.Graphics | null = null;
  private _loadingText: Phaser.GameObjects.Text | null = null;
  private _percentText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this._progressBox = this.add.graphics();
    this._progressBox.fillStyle(0x222222, 0.8);
    this._progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this._progressBar = this.add.graphics();

    this._loadingText = this.add.text(width / 2, height / 2 - 50, 'Initializing Systems...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: COLORS.hudText,
    }).setOrigin(0.5);

    this._percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: COLORS.titleText,
    }).setOrigin(0.5);

    // File loading counts for the first 10% of the total bar.
    this.load.on('progress', (value: number) => {
      this._updateProgress(value * 0.1, 'Initializing Systems...');
    });

    // Load only eager music tracks at boot (everything else is lazy-loaded
    // by MusicPlugin on first play so the initial download stays small).
    for (const { key, path, eager } of STATIC_MUSIC_ASSETS) {
      if (eager) this.load.audio(key, path);
    }

    // Brand assets. The Norconsult Digital wordmark (white) is used as the
    // wall-mounted company sign in the lobby. Rendered from SVG so it stays
    // crisp at any camera zoom. The SVG's native viewBox is 160×54; scale up
    // to ~3× so it reads from across the lobby.
    this.load.svg('lobby_logo', 'brand/norconsult-digital-white.svg', { width: 200, height: 68 });
  }

  create(): void {
    // Migrate legacy 'default' slot → slot1 on first launch.
    // Must happen before GameStateManager is constructed (it may call hasSave()).
    migrateDefaultSlot();
    // Default active slot for the session (SaveSlotScene will override this).
    setPlayerSlot('slot1');

    // Initialize audio manager and wire it to the EventBus
    const audio = new AudioManager(this.sound, this.game);
    audio.registerEventListeners();
    this.registry.set('audio', audio);

    // Build the persistent game-state facade once. Subsequent scenes read
    // `gameState` from the registry instead of constructing their own
    // ProgressionSystem or reaching into the singleton save managers.
    this.registry.set('gameState', new GameStateManager());

    // Global M-key toggles audio mute from any scene or context.
    // Attached to window so it works regardless of which Phaser scene has
    // keyboard focus or what input context is active.
    // Mute state is persisted via SettingsStore (architect_settings_v1).
    // The Settings screen mentions this hotkey so players can discover it.
    //
    // Note: this.scene.start('MenuScene') below fires BootScene's `shutdown`
    // event immediately, so we must NOT remove the listener on `shutdown` —
    // only on `destroy` (full game teardown). The guard prevents a second
    // call to create() (e.g. on BootScene re-entry) from double-registering.
    if (!this._muteHotkeyInstalled) {
      this._muteHotkeyInstalled = true;
      const onMuteHotkey = (ev: KeyboardEvent): void => {
        if (ev.repeat) return;
        if (ev.key !== 'm' && ev.key !== 'M') return;
        const target = ev.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
        eventBus.emit('audio:toggle-mute');
      };
      window.addEventListener('keydown', onMuteHotkey);
      this.events.once('destroy', () => {
        window.removeEventListener('keydown', onMuteHotkey);
        this._muteHotkeyInstalled = false;
      });
    }

    // Build the combined generation pipeline: sounds first, then sprites.
    // Skip phases whose assets are already cached (e.g. on BootScene re-entry).
    const soundCached = this.cache?.audio?.exists('jump') ?? false;
    const spritesCached = this.textures?.exists('player') ?? false;
    const allPhases: readonly GeneratorPhase[] = [
      ...(soundCached ? [] : SOUND_PHASES),
      ...(spritesCached ? [] : SPRITE_PHASES),
    ];
    const total = allPhases.length;

    // File loading accounts for the first 10% of the progress bar;
    // procedural generation phases fill the remaining 90%.
    const FILE_SHARE = total > 0 ? 0.1 : 0;
    const GEN_SHARE = 1 - FILE_SHARE;

    const finish = (): void => {
      this._destroyProgress();
      this.scene.start('MenuScene');
    };

    if (total === 0) {
      finish();
      return;
    }

    let index = 0;
    const runPhase = (): void => {
      if (index >= total) {
        finish();
        return;
      }
      const phase = allPhases[index]!;
      const t0 = performance.now();
      phase.run(this);
      const elapsed = performance.now() - t0;
      if (import.meta.env.DEV && elapsed > 50) {
        console.warn(`[BootScene] Phase "${phase.label}" took ${elapsed.toFixed(1)} ms (>50 ms threshold)`);
      }
      const progress = FILE_SHARE + GEN_SHARE * ((index + 1) / total);
      this._updateProgress(progress, phase.label);
      index++;
      this.time.addEvent({ delay: 0, callback: runPhase });
    };

    this.time.addEvent({ delay: 0, callback: runPhase });
  }

  /** Update the progress bar and status text. `value` is in the range [0, 1]. */
  private _updateProgress(value: number, label: string): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this._percentText?.setText(`${Math.round(value * 100)}%`);
    this._loadingText?.setText(label);
    this._progressBar?.clear();
    this._progressBar?.fillStyle(theme.color.ui.accent, 1);
    this._progressBar?.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
  }

  /** Destroy and null all progress bar UI elements. */
  private _destroyProgress(): void {
    this._progressBar?.destroy();
    this._progressBox?.destroy();
    this._loadingText?.destroy();
    this._percentText?.destroy();
    this._progressBar = null;
    this._progressBox = null;
    this._loadingText = null;
    this._percentText = null;
  }
}
