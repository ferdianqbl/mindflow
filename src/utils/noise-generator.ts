/**
 * Generates a looping AudioBuffer containing pre-calculated Brown (Red) Noise.
 * Brown noise has a spectral density proportional to 1/f^2 (6dB attenuation per octave),
 * creating a deep, low-frequency rumble that is highly effective for focus and masking noise.
 * 
 * Pre-calculating a 10-second buffer and looping it is extremely CPU efficient,
 * avoiding the need for real-time ScriptProcessor calculations.
 */
export function createBrownNoiseNode(context: AudioContext): AudioBufferSourceNode {
  const bufferSize = 10 * context.sampleRate; // 10 seconds of unique, non-repeating noise
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Apply a first-order lowpass filter to white noise to approximate brown noise
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Compensate for volume drop-off in low frequencies
  }

  const source = context.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  return source;
}
