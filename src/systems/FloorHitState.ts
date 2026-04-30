/**
 * Floor-local hit / checkpoint tracking.
 *
 * Tracks per-floor-visit state:
 *  - How many times the player has been hit (to trigger forced respawn on the
 *    3rd hit).
 *  - The position of the most recently activated checkpoint.
 *
 * Kept as a pure class (zero Phaser / event-bus dependency) so it can be
 * unit-tested in isolation and injected into both `LevelScene` and the
 * standalone `BossArenaScene`.
 */
export class FloorHitState {
  private hitCount = 0;
  private checkpointPos: { x: number; y: number } | null = null;

  /** Threshold before a forced checkpoint respawn. */
  static readonly RESPAWN_HIT_THRESHOLD = 3;

  /**
   * Record a player hit on this floor.
   * Returns `true` when the hit count reaches the respawn threshold.
   */
  recordHit(): boolean {
    this.hitCount++;
    return this.hitCount >= FloorHitState.RESPAWN_HIT_THRESHOLD;
  }

  /** Register a new checkpoint position (overwrites any previous one). */
  registerCheckpoint(x: number, y: number): void {
    this.checkpointPos = { x, y };
  }

  /**
   * Position of the most recently activated checkpoint, or `null` if no
   * checkpoint has been activated this visit.
   */
  getCheckpointPos(): { x: number; y: number } | null {
    return this.checkpointPos ? { ...this.checkpointPos } : null;
  }

  /** Number of hits taken on the current floor visit. */
  getHitCount(): number {
    return this.hitCount;
  }

  /**
   * Whether the player is one hit away from a forced respawn.
   * Used to decide whether to show the danger vignette.
   */
  isDangerZone(): boolean {
    return this.hitCount >= FloorHitState.RESPAWN_HIT_THRESHOLD - 1;
  }

  /** Reset all state — call on scene re-entry. */
  reset(): void {
    this.hitCount = 0;
    this.checkpointPos = null;
  }
}
