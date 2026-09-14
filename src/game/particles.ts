export type ParticleKind = "spark" | "smoke" | "heart" | "confetti" | "dirt" | "glow";

export type Particle = {
  alive: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  r: number;
  g: number;
  b: number;
};

export type SkidMark = {
  alive: boolean;
  x: number;
  y: number;
  yaw: number;
  life: number;
  w: number;
};

const POOL = 360;
const pool: Particle[] = [];
let cursor = 0;

const SKID_POOL = 240;
const skids: SkidMark[] = [];
let skidCursor = 0;

function slot(): Particle {
  if (pool.length < POOL) {
    const p: Particle = {
      alive: false,
      kind: "spark",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      max: 1,
      size: 2,
      rot: 0,
      vr: 0,
      r: 255,
      g: 255,
      b: 255,
    };
    pool.push(p);
    return p;
  }
  const p = pool[cursor];
  cursor = (cursor + 1) % POOL;
  return p;
}

export function spawn(
  kind: ParticleKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  opts?: Partial<Particle>,
): void {
  const p = slot();
  p.alive = true;
  p.kind = kind;
  p.x = x;
  p.y = y;
  p.vx = vx;
  p.vy = vy;
  p.life = opts?.max ?? 0.7;
  p.max = p.life;
  p.size = opts?.size ?? 3;
  p.rot = opts?.rot ?? 0;
  p.vr = opts?.vr ?? 0;
  p.r = opts?.r ?? 255;
  p.g = opts?.g ?? 80;
  p.b = opts?.b ?? 90;
}

export function burstHearts(x: number, y: number, n = 10): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 18 + Math.random() * 40;
    spawn("heart", x, y, Math.cos(a) * s, Math.sin(a) * s, {
      size: 5 + Math.random() * 7,
      max: 1.1 + Math.random() * 0.7,
      r: 208,
      g: 18,
      b: 45,
      vr: (Math.random() - 0.5) * 4,
    });
  }
}

export function burstConfetti(x: number, y: number, n = 40): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 40 + Math.random() * 90;
    const red = Math.random() > 0.45;
    spawn("confetti", x, y, Math.cos(a) * s, Math.sin(a) * s + 20, {
      size: 3 + Math.random() * 4,
      max: 1.6 + Math.random(),
      r: red ? 208 : 244,
      g: red ? 18 : 241,
      b: red ? 45 : 238,
      vr: (Math.random() - 0.5) * 8,
    });
  }
}

export function stampSkid(x: number, y: number, yaw: number, strength: number): void {
  if (skids.length < SKID_POOL) {
    skids.push({ alive: true, x, y, yaw, life: 0.9 + strength * 0.5, w: 1.1 + strength });
    return;
  }
  const m = skids[skidCursor];
  skidCursor = (skidCursor + 1) % SKID_POOL;
  m.alive = true;
  m.x = x;
  m.y = y;
  m.yaw = yaw;
  m.life = 0.9 + strength * 0.5;
  m.w = 1.1 + strength;
}

export function stepParticles(dt: number): void {
  for (const p of pool) {
    if (!p.alive) continue;
    p.life -= dt;
    if (p.life <= 0) {
      p.alive = false;
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy -= (p.kind === "confetti" || p.kind === "heart" ? 18 : 0) * dt;
    p.vx *= 1 - 0.8 * dt;
    p.vy *= 1 - 0.8 * dt;
    p.rot += p.vr * dt;
  }
  for (const m of skids) {
    if (!m.alive) continue;
    m.life -= dt * 0.12;
    if (m.life <= 0) m.alive = false;
  }
}

export function eachParticle(fn: (p: Particle) => void): void {
  for (const p of pool) if (p.alive) fn(p);
}

export function eachSkid(fn: (m: SkidMark) => void): void {
  for (const m of skids) if (m.alive) fn(m);
}

export function clearParticles(): void {
  for (const p of pool) p.alive = false;
  for (const m of skids) m.alive = false;
}
