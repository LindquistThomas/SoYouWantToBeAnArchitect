import * as Phaser from 'phaser';
import { SCENE_MUSIC } from '../config/audioConfig';
import { eventBus } from '../systems/EventBus';

/**
 * Phaser ScenePlugin — bridges the framework's scene lifecycle to the
 * standalone EventBus.
 *
 * Auto-attached to every scene via the game config. On each scene's
 * `create` event it looks up SCENE_MUSIC and emits `music:play` on the
 * EventBus. Scenes themselves never touch audio code.
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
    if (musicKey) {
      eventBus.emit('music:play', musicKey);
    }
  }

  private onSceneShutdown(): void {
    this.systems?.events.off('create', this.onSceneCreate, this);
  }

  private onSceneDestroy(): void {
    this.onSceneShutdown();
    this.systems?.events.off('start', this.onSceneStart, this);
  }
}
