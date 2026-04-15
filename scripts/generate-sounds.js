const fs = require('fs');
const path = require('path');

function generateWav(filename, frequencyHz, durationSec, amplitude = 0.8) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');

  // fmt chunk
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM format
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (sampleRate * channels * bitsPerSample/8)
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  // Generate sine wave with exponential decay envelope
  for (let i = 0; i < numSamples; i++) {
    const envelope = Math.exp(-i / (sampleRate * 0.02)); // ~20ms decay
    const sample = Math.sin(2 * Math.PI * frequencyHz * i / sampleRate) * amplitude * envelope;
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const outPath = path.join(__dirname, '..', 'assets', 'sounds', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${outPath}`);
}

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

generateWav('click.wav', 800, 0.08);    // 800 Hz, 80ms — regular beat
generateWav('accent.wav', 1200, 0.08);  // 1200 Hz, 80ms — beat 1 accent
console.log('Done.');
