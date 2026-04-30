import { SAMPLE_RATE, encodeWAV } from './wav';

/** Short metallic pickup chime — rising tone with harmonic shimmer. */
export function generateItemPickupSound(): ArrayBuffer {
  const duration = 0.2;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase1 = 0;
  let phase2 = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq1 = 600 + 400 * progress;
    const freq2 = freq1 * 1.5;
    phase1 += (2 * Math.PI * freq1) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * freq2) / SAMPLE_RATE;
    const wave = Math.sin(phase1) * 0.5 + Math.sin(phase2) * 0.25;
    const envelope = Math.sin(Math.PI * progress) * 0.8;
    samples[i] = wave * envelope * 0.3;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Low electronic buzz → beep sequence — bomb disarmed. */
export function generateBombDisarmSound(): ArrayBuffer {
  const duration = 0.5;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    // Start with low hum, end with high confirmation beep
    const freq = progress < 0.6 ? 120 + 40 * Math.sin(progress * 20) : 880;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = progress < 0.6
      ? Math.sin(phase) * 0.3 + (Math.random() * 2 - 1) * 0.1
      : Math.sin(phase) * 0.6;
    const envelope = progress < 0.6
      ? 0.5
      : Math.sin(Math.PI * ((progress - 0.6) / 0.4));
    samples[i] = wave * envelope * 0.25;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Dramatic descending sweep + impact — boss defeated. */
export function generateBossDefeatedSound(): ArrayBuffer {
  const duration = 0.4;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 440 - 300 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = Math.sign(Math.sin(phase)) * 0.4;
    const noise = (Math.random() * 2 - 1) * 0.2;
    const envelope = Math.exp(-progress * 3);
    samples[i] = (wave + noise) * envelope * 0.3;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Bright multi-note fanfare — floor unlocked. Ascending four-note chord with harmonic shimmer. */
export function generateFloorUnlockedSound(): ArrayBuffer {
  const duration = 1.0;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(n);
  // Four ascending notes: C5, E5, G5, C6 — each plays for a quarter of the duration.
  const notes = [523, 659, 784, 1047];
  const noteLen = Math.floor(n / notes.length);
  for (let ni = 0; ni < notes.length; ni++) {
    const freq = notes[ni]!;
    const start = ni * noteLen;
    const end = Math.min(start + noteLen, n);
    let phase1 = 0;
    let phase2 = 0;
    for (let i = start; i < end; i++) {
      const t = (i - start) / (end - start);
      phase1 += (2 * Math.PI * freq) / SAMPLE_RATE;
      phase2 += (2 * Math.PI * (freq * 1.5)) / SAMPLE_RATE;
      const tone = Math.sin(phase1) * 0.5 + Math.sin(phase2) * 0.2;
      // Sharp attack, smooth decay within each note.
      const env = t < 0.08 ? t / 0.08 : Math.exp(-(t - 0.08) * 4);
      samples[i] = tone * env * 0.32;
    }
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Triumphant rising fanfare — hostage freed. */
export function generateHostageFreedSound(): ArrayBuffer {
  const duration = 0.6;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase1 = 0;
  let phase2 = 0;
  let phase3 = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    // Rising major chord: C5 → E5 → G5
    const freq1 = 523 + 200 * progress;
    const freq2 = freq1 * 1.26; // major third
    const freq3 = freq1 * 1.5;  // perfect fifth
    phase1 += (2 * Math.PI * freq1) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * freq2) / SAMPLE_RATE;
    phase3 += (2 * Math.PI * freq3) / SAMPLE_RATE;
    const wave = Math.sin(phase1) * 0.35 + Math.sin(phase2) * 0.25 + Math.sin(phase3) * 0.2;
    const envelope = Math.sin(Math.PI * progress);
    samples[i] = wave * envelope * 0.3;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}
