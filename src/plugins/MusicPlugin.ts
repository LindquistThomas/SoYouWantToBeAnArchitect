import * as Phaser from 'phaser';
import { SCENE_MUSIC, STATIC_MUSIC_ASSETS } from '../config/audioConfig';
import { eventBus } from '../systems/EventBus';

/** Build a key→path lookup once from the full catalog. */
const MUSIC_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  STATIC_MUSIC_ASSETS.map(({ key, path }) => [key, path]),
);

/**
 * Phaser ScenePlugin — bridges the framework's scene lifecycle to the
 * standalone EventBus.
 *
 * Auto-attached to every scene via the game config. On each scene's
 * `create` event it looks up SCENE_MUSIC and:
 *   - emits `music:play` immediately if the audio is already in cache, OR
 *   - lazy-loads the file first (via the scene's own Loader) and emits
 *     `music:play` once loading completes.
 *
 * Scenes themselves never touch audio code.
 *
 * Uses the standard Phaser start/shutdown re-registration pattern so
 * the `create` listener is reliably re-attached on every scene restart.
 */
export class MusicPlugin extends Phaser.Plugins.ScenePlugin {
  boot(): void {
    const events = this.systems!.events;
    events.on('start', this.onSceneStart, this);
    events.once('destroy', this.onSceneDestroy, this);
  }

  private onSceneStart(): void {
    const events = this.systems!.events;
    events.on('create', this.onSceneCreate, this);
    events.once('shutdown', this.onSceneShutdown, this);
  }

  private onSceneCreate(): void {
    const sceneKey = this.scene!.scene.key;
    const musicKey = SCENE_MUSIC[sceneKey];
    if (!musicKey) return;

    this.playOrLoad(musicKey);
  }

  /**
   * Emit `music:play` for `key`. If the audio isn't in Phaser's cache yet,
   * queue it for loading first and wait for the `filecomplete` event before
   * emitting. Subsequent calls hit the cache and are instant.
   */
  playOrLoad(musicKey: string): void {
    const scene = this.scene!;

    // Already cached — play immediately.
    if (scene.cache.audio.exists(musicKey)) {
      eventBus.emit('music:play', musicKey);
      return;
    }

    const path = MUSIC_PATH[musicKey];
    if (!path) {
      // Unknown key; nothing to load. Play anyway and let AudioManager handle the miss.
      eventBus.emit('music:play', musicKey);
      return;
    }

    // Queue the audio file for loading on this scene's loader, then start.
    // The 'filecomplete-audio-<key>' event fires even if another load is in
    // progress — using 'once' prevents double-firing on scene restarts.
    scene.load.audio(musicKey, path);
    scene.load.once(`filecomplete-audio-${musicKey}`, () => {
      eventBus.emit('music:play', musicKey);
    });
    scene.load.start();
  }

  private onSceneShutdown(): void {
    this.systems?.events.off('create', this.onSceneCreate, this);
  }

  private onSceneDestroy(): void {
    this.onSceneShutdown();
    this.systems?.events.off('start', this.onSceneStart, this);
  }
}
