import { useRef, useCallback } from 'react';

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3, delay = 0) {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  g.gain.setValueAtTime(0, c.currentTime + delay);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.01);
  g.gain.linearRampToValueAtTime(0, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

function leverClick() {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.15);
  g.gain.setValueAtTime(0.25, c.currentTime);
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.15);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.2);

  // Mechanical click
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const gn = c.createGain();
  gn.gain.value = 0.4;
  src.connect(gn);
  gn.connect(c.destination);
  src.start(c.currentTime + 0.02);
}

function reelDing(index: number) {
  const notes = [660, 700, 740, 784, 830];
  const freq = notes[index % notes.length];
  tone(freq, 0.4, 'sine', 0.25);
  tone(freq * 2, 0.2, 'sine', 0.08);
}

function fanfare() {
  // C4-E4-G4-C5
  const melody = [261.63, 329.63, 392.0, 523.25];
  melody.forEach((freq, i) => {
    tone(freq, 0.25, 'sine', 0.3, i * 0.12);
    tone(freq * 1.5, 0.15, 'sine', 0.1, i * 0.12 + 0.05);
  });
  // Final chord
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    tone(freq, 0.5, 'sine', 0.2, melody.length * 0.12 + i * 0.01);
  });
}

export function useSound() {
  const enabled = useRef(true);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  const playLeverClick = useCallback(() => { if (enabled.current) leverClick(); }, []);
  const playReelDing = useCallback((i: number) => { if (enabled.current) reelDing(i); }, []);
  const playFanfare = useCallback(() => { if (enabled.current) fanfare(); }, []);

  return { toggle, playLeverClick, playReelDing, playFanfare, enabledRef: enabled };
}
