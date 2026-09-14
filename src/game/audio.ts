import { clamp } from "./math";
import { useGameUI } from "./store";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
let engineFilter: BiquadFilterNode | null = null;
let crowdGain: GainNode | null = null;
let skidGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let unlocked = false;
let lastGear = 0;

const MENU_NOTES = [261.63, 329.63, 392.0, 493.88, 440.0, 392.0, 329.63, 261.63];
const RACE_NOTES = [196.0, 246.94, 293.66, 246.94, 220.0, 196.0, 174.61, 196.0];
const ROMANTIC = [261.63, 329.63, 392.0, 523.25, 493.88, 392.0];

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.gain.value = 0.22;
    sfxBus.gain.value = 0.45;
    master.gain.value = 0.85;
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  unlocked = true;
  ensureEngine();
  ensureCrowd();
  ensureSkid();
}

function ensureEngine(): void {
  const c = ac();
  if (!c || !sfxBus || engineOsc) return;
  engineOsc = c.createOscillator();
  engineOsc.type = "sawtooth";
  engineOsc.frequency.value = 48;
  engineFilter = c.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 700;
  engineGain = c.createGain();
  engineGain.gain.value = 0;
  engineOsc.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(sfxBus);
  engineOsc.start();
}

function ensureCrowd(): void {
  const c = ac();
  if (!c || !sfxBus || crowdGain) return;
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = last * 0.96 + (Math.random() * 2 - 1) * 0.04;
    data[i] = last;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900;
  crowdGain = c.createGain();
  crowdGain.gain.value = 0;
  src.connect(f);
  f.connect(crowdGain);
  crowdGain.connect(sfxBus);
  src.start();
}

function ensureSkid(): void {
  const c = ac();
  if (!c || !sfxBus || skidGain) return;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1400;
  f.Q.value = 1.2;
  skidGain = c.createGain();
  skidGain.gain.value = 0;
  src.connect(f);
  f.connect(skidGain);
  skidGain.connect(sfxBus);
  src.start();
}

function beep(freq: number, dur: number, vol = 0.3, type: OscillatorType = "square"): void {
  const c = ac();
  if (!c || !sfxBus || !useGameUI.getState().audioOn) return;
  if (c.state === "suspended") return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq * (0.97 + Math.random() * 0.06);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g);
  g.connect(sfxBus);
  o.start();
  o.stop(c.currentTime + dur);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}

export function playCountdown(n: number | "go"): void {
  if (n === "go") beep(1320, 0.35, 0.28, "triangle");
  else beep(780, 0.16, 0.22, "square");
}

export function playCollision(): void {
  beep(90, 0.18, 0.35, "sawtooth");
}

export function playFinish(): void {
  const seq = [523.25, 659.25, 783.99, 1046.5];
  seq.forEach((f, i) => {
    window.setTimeout(() => beep(f, 0.28, 0.22, "triangle"), i * 140);
  });
}

export function playUi(): void {
  beep(660, 0.07, 0.12, "sine");
}

export function updateAudio(opts: {
  screen: string;
  speed: number;
  throttle: number;
  boosting: boolean;
  racing: boolean;
  skid: number;
  braking: boolean;
}): void {
  const c = ac();
  if (!c || !master || !engineGain || !engineOsc || !engineFilter) return;
  const st = useGameUI.getState();
  const on = st.audioOn && unlocked;
  const now = c.currentTime;
  master.gain.setTargetAtTime(on ? 0.85 : 0, now, 0.04);
  if (musicBus) musicBus.gain.setTargetAtTime(st.musicOn && on ? 0.2 : 0, now, 0.08);

  const racing = opts.racing;
  const rpm = 50 + Math.abs(opts.speed) * 2.4 + (opts.boosting ? 40 : 0) + opts.throttle * 18;
  engineOsc.frequency.setTargetAtTime(rpm, now, 0.05);
  engineFilter.frequency.setTargetAtTime(500 + Math.abs(opts.speed) * 8 - (opts.braking ? 180 : 0), now, 0.08);
  const eg = racing && on ? clamp(0.03 + opts.throttle * 0.08 + Math.abs(opts.speed) * 0.0012, 0, 0.14) : 0;
  engineGain.gain.setTargetAtTime(eg, now, 0.05);

  if (crowdGain) {
    crowdGain.gain.setTargetAtTime(racing && on ? 0.035 + Math.abs(opts.speed) * 0.00025 : 0, now, 0.2);
  }
  if (skidGain) {
    const sg = racing && on ? clamp(opts.skid * 0.07, 0, 0.08) : 0;
    skidGain.gain.setTargetAtTime(sg, now, 0.06);
  }

  const gear = Math.floor(Math.abs(opts.speed) / 14);
  if (racing && gear !== lastGear && opts.speed > 10) {
    lastGear = gear;
    beep(180 + gear * 20, 0.04, 0.08, "square");
  }

  tickMusic();
}

function tickMusic(): void {
  const c = ac();
  if (!c || !musicBus) return;
  if (musicTimer != null) return;
  const step = () => {
    const st = useGameUI.getState();
    const scr = st.screen;
    const isRace = scr === "race" || scr === "countdown";
    const isEnd = scr === "letter" || scr === "victory" || scr === "closing" || scr === "celebration";
    const interval = isEnd ? 520 : isRace ? 220 : 420;
    if (st.audioOn && st.musicOn && unlocked) {
      if (isEnd) tone(ROMANTIC[musicStep % ROMANTIC.length], 0.28, 0.05);
      else {
        const notes = isRace ? RACE_NOTES : MENU_NOTES;
        tone(notes[musicStep % notes.length], isRace ? 0.1 : 0.32, isRace ? 0.04 : 0.06);
      }
      musicStep += 1;
    }
    musicTimer = window.setTimeout(step, interval);
  };
  musicTimer = window.setTimeout(step, 80);
}

function tone(freq: number, dur: number, vol: number): void {
  const c = ac();
  if (!c || !musicBus) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g);
  g.connect(musicBus);
  o.start();
  o.stop(c.currentTime + dur);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}

export function disposeAudio(): void {
  if (musicTimer != null) window.clearTimeout(musicTimer);
  musicTimer = null;
  try {
    engineOsc?.stop();
  } catch {
    /* already stopped */
  }
  engineOsc = null;
  engineGain = null;
  engineFilter = null;
  crowdGain = null;
  skidGain = null;
  void ctx?.close();
  ctx = null;
  master = null;
  musicBus = null;
  sfxBus = null;
  unlocked = false;
}
