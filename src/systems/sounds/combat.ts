import { SAMPLE_RATE, encodeWAV } from './wav';

/** Short descending noise burst — player-hit "oof". */
export function generateHitSound(): ArrayBuffer {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 220 - 140 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const tonal = Math.sign(Math.sin(phase)) * 0.5;
    const noise = (Math.random() * 2 - 1) * 0.5;
    const envelope = Math.exp(-progress * 5);
    samples[i] = (tonal + noise) * envelope * 0.22;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Thick squelchy stomp — low tone + downward sweep. */
export function generateStompSound(): ArrayBuffer {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 320 - 220 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const noise = (Math.random() * 2 - 1) * 0.25;
    const envelope = Math.exp(-progress * 6);
    samples[i] = (wave + noise) * envelope * 0.28;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/**
 * Low double-thud heartbeat pulse — plays in the danger zone.
 * Two close bass kicks ("lub-dub") with a quick decay each.
 */
export function generateHeartbeatSound(): ArrayBuffer {
  const duration = 0.55;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Lub — at t=0; Dub — at t=0.18s.
  const beats = [0, Math.floor(SAMPLE_RATE * 0.18)];
  for (const beatStart of beats) {
    let phase = 0;
    const beatLen = Math.floor(SAMPLE_RATE * 0.14);
    for (let i = 0; i < beatLen; i++) {
      const idx = beatStart + i;
      if (idx >= numSamples) break;
      const progress = i / (beatLen - 1);
      const freq = 90 - 60 * progress;
      phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      const wave = Math.sign(Math.sin(phase)) * 0.5;
      const noise = (Math.random() * 2 - 1) * 0.08;
      const envelope = Math.exp(-progress * 8);
      samples[idx] = (samples[idx] ?? 0) + (wave + noise) * envelope * 0.28;
    }
  }
  return encodeWAV(samples, SAMPLE_RATE);
}
