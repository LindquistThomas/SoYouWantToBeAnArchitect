import { SAMPLE_RATE, encodeWAV } from './wav';

/** Short upward frequency sweep — retro 8-bit jump "bwip". */
export function generateJumpSound(): ArrayBuffer {
  const duration = 0.15;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 200 + 400 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = Math.sign(Math.sin(phase));
    const envelope = 1 - progress;
    samples[i] = wave * envelope * 0.3;
  }

  return encodeWAV(samples, SAMPLE_RATE);
}

/** Descending coin-scatter blip — AU dropped. */
export function generateDropAUSound(): ArrayBuffer {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 780 - 440 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = Math.sign(Math.sin(phase));
    const envelope = Math.exp(-progress * 5);
    samples[i] = wave * envelope * 0.18;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}

/** Short ascending triangle — AU recovered. */
export function generateRecoverAUSound(): ArrayBuffer {
  const duration = 0.12;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const freq = 520 + 420 * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const envelope = 1 - progress * 0.7;
    samples[i] = wave * envelope * 0.22;
  }
  return encodeWAV(samples, SAMPLE_RATE);
}
