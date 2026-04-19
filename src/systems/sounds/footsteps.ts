import { SAMPLE_RATE, encodeWAV } from './wav';

/** Short percussive footstep — low thud + noise scuff. */
export function generateFootstepSound(baseFreq: number): ArrayBuffer {
  const duration = 0.04;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const progress = numSamples > 1 ? i / (numSamples - 1) : 1;
    const envelope = Math.exp(-progress * 8);
    phase += (2 * Math.PI * baseFreq) / SAMPLE_RATE;
    const tonal = Math.sign(Math.sin(phase)) * 0.6;
    const noise = (Math.random() * 2 - 1) * 0.4;
    samples[i] = (tonal + noise) * envelope * 0.15;
  }

  return encodeWAV(samples, SAMPLE_RATE);
}
