import * as Phaser from 'phaser';

/**
 * Thin wrapper around Phaser's sound manager.
 * Stored in the scene registry so any scene/entity can access it.
 */
export class AudioManager {
  private sound: Phaser.Sound.BaseSoundManager;
  private currentMusic: Phaser.Sound.BaseSound | null = null;

  constructor(sound: Phaser.Sound.BaseSoundManager) {
    this.sound = sound;
  }

  /** Play a one-shot sound effect. */
  playSfx(key: string): void {
    this.sound.play(key);
  }

  /** Start looping background music (stops any current track). */
  playMusic(key: string): void {
    this.stopMusic();
    this.currentMusic = this.sound.add(key, { loop: true });
    this.currentMusic.play();
  }

  /** Stop the current music track. */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
  }

  toggleMute(): void {
    this.sound.mute = !this.sound.mute;
  }

  isMuted(): boolean {
    return this.sound.mute;
  }
}
