import { clamp, mulberry32 } from "./math";
import type { Billboard, LightPole, Stand, Track, TrackPoint, Tree } from "./types";

const CONTROL: Array<[number, number]> = [
  [0, -80],
  [0, 90],
  [0, 260],
  [8, 430],
  [55, 560],
  [170, 640],
  [320, 675],
  [480, 680],
  [630, 655],
  [760, 590],
  [840, 480],
  [865, 340],
  [860, 200],
  [820, 80],
  [730, 20],
  [810, -50],
  [735, -120],
  [825, -200],
  [860, -310],
  [820, -430],
  [720, -530],
  [560, -590],
  [390, -625],
  [230, -630],
  [100, -590],
  [25, -510],
  [-4, -400],
  [0, -250],
];

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function sampleSpline(points: Array<[number, number]>, spacing: number): Array<[number, number]> {
  const n = points.length;
  const dense: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const est = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const steps = Math.max(4, Math.ceil(est / (spacing * 0.45)));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      dense.push([
        catmull(p0[0], p1[0], p2[0], p3[0], t),
        catmull(p0[1], p1[1], p2[1], p3[1], t),
      ]);
    }
  }
  const out: Array<[number, number]> = [];
  let acc = 0;
  out.push(dense[0]);
  for (let i = 1; i < dense.length; i++) {
    const dx = dense[i][0] - dense[i - 1][0];
    const dy = dense[i][1] - dense[i - 1][1];
    acc += Math.hypot(dx, dy);
    if (acc >= spacing) {
      out.push(dense[i]);
      acc = 0;
    }
  }
  return out;
}

function onTrack(x: number, y: number, raw: Array<[number, number]>, margin: number): boolean {
  let best = Infinity;
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    const b = raw[(i + 1) % raw.length];
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby || 1;
    let t = ((x - a[0]) * abx + (y - a[1]) * aby) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = a[0] + abx * t;
    const py = a[1] + aby * t;
    const d = Math.hypot(x - px, y - py);
    if (d < best) best = d;
  }
  return best < margin;
}

let cached: Track | null = null;

export function getTrack(): Track {
  if (cached) return cached;

  const raw = sampleSpline(CONTROL, 12);
  const n = raw.length;
  const pts: TrackPoint[] = [];
  let length = 0;

  for (let i = 0; i < n; i++) {
    const prev = raw[(i - 1 + n) % n];
    const cur = raw[i];
    const next = raw[(i + 1) % n];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    const v1x = cur[0] - prev[0];
    const v1y = cur[1] - prev[1];
    const v2x = next[0] - cur[0];
    const v2y = next[1] - cur[1];
    const a1 = Math.atan2(v1x, v1y);
    const a2 = Math.atan2(v2x, v2y);
    let da = a2 - a1;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    const ds = Math.hypot(v2x, v2y) || 1;
    const curv = da / ds;
    const halfW = 40 - 8 * clamp(Math.abs(curv) * 55, 0, 1);
    const inside = -Math.sign(curv || 1) * 0.28 * halfW;
    pts.push({
      x: cur[0],
      y: cur[1],
      tx,
      ty,
      nx,
      ny,
      dist: 0,
      curv,
      halfW,
      ix: cur[0] + nx * halfW,
      iy: cur[1] + ny * halfW,
      ox: cur[0] - nx * halfW,
      oy: cur[1] - ny * halfW,
      rx: cur[0] + nx * inside,
      ry: cur[1] + ny * inside,
    });
  }

  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    a.dist = length;
    length += Math.hypot(b.x - a.x, b.y - a.y);
  }

  const startDist = 0;
  const start = pts[0];
  const startYaw = Math.atan2(-start.tx, start.ty);

  const cpCount = 12;
  const checkpoints: number[] = [];
  for (let i = 0; i < cpCount; i++) checkpoints.push((i / cpCount) * length);

  const billboards: Billboard[] = [];
  const signs: Array<[number, string]> = [
    [0.08, "ELEONORA  ♥"],
    [0.18, "BIMBA GP"],
    [0.32, "1 YEAR  ♥"],
    [0.46, "SEMPRE INSIEME"],
    [0.58, "+365  ♥"],
    [0.72, "FORZA BIMBA"],
    [0.86, "POLE POSITION"],
  ];
  for (const [u, text] of signs) {
    const p = pointAtDist(pts, length, u * length);
    const side = -1;
    const off = p.halfW + 36;
    billboards.push({
      x: p.x + p.nx * side * off,
      y: p.y + p.ny * side * off,
      angle: Math.atan2(p.tx, p.ty) + Math.PI / 2,
      text,
      w: 18 + text.length * 6.2,
      h: 16,
    });
  }

  const rng = mulberry32(365);
  const trees: Tree[] = [];
  for (let k = 0; k < 90; k++) {
    const p = pts[Math.floor(rng() * n)];
    const side = rng() > 0.35 ? -1 : 1;
    const dist = p.halfW + 48 + rng() * 90;
    const x = p.x + p.nx * side * dist + (rng() - 0.5) * 30;
    const y = p.y + p.ny * side * dist + (rng() - 0.5) * 30;
    if (onTrack(x, y, raw, p.halfW + 28)) continue;
    trees.push({ x, y, r: 9 + rng() * 11, shade: 0.45 + rng() * 0.4 });
  }

  const stands: Stand[] = [
    { x: -92, y: 40, angle: Math.PI / 2, w: 220, d: 38 },
    { x: -92, y: 280, angle: Math.PI / 2, w: 180, d: 34 },
    { x: 520, y: 760, angle: 0, w: 200, d: 32 },
  ];

  const poles: LightPole[] = [];
  for (let i = 0; i < n; i += 14) {
    const p = pts[i];
    poles.push({
      x: p.x - p.nx * (p.halfW + 22),
      y: p.y - p.ny * (p.halfW + 22),
    });
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.ox, p.ix);
    maxX = Math.max(maxX, p.ox, p.ix);
    minY = Math.min(minY, p.oy, p.iy);
    maxY = Math.max(maxY, p.oy, p.iy);
  }

  const pit: Track["pit"] = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    if (p.x > -30 && p.x < 40 && p.y > -200 && p.y < 320) {
      pit.push({
        x1: p.x + p.nx * (p.halfW + 6),
        y1: p.y + p.ny * (p.halfW + 6),
        x2: p.x + p.nx * (p.halfW + 22),
        y2: p.y + p.ny * (p.halfW + 22),
      });
    }
  }

  cached = {
    name: "BIMBA GRAND PRIX",
    pts,
    length,
    checkpoints,
    startDist,
    startX: start.x,
    startY: start.y,
    startYaw,
    pit,
    billboards,
    trees,
    stands,
    poles,
    minX: minX - 80,
    minY: minY - 80,
    maxX: maxX + 80,
    maxY: maxY + 80,
    heart: { x: 430, y: 40, s: 78 },
  };
  return cached;
}

export function pointAtDist(pts: TrackPoint[], length: number, dist: number): TrackPoint {
  const d = ((dist % length) + length) % length;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (pts[mid].dist <= d) lo = mid;
    else hi = mid - 1;
  }
  return pts[lo];
}

export function projectOnTrack(
  track: Track,
  x: number,
  y: number,
): { p: TrackPoint; dist: number; along: number; side: number } {
  const pts = track.pts;
  let bestI = 0;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby || 1;
    let t = ((x - a.x) * abx + (y - a.y) * aby) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = a.x + abx * t;
    const py = a.y + aby * t;
    const dd = (x - px) * (x - px) + (y - py) * (y - py);
    if (dd < bestD) {
      bestD = dd;
      bestI = i;
      bestT = t;
    }
  }
  const a = pts[bestI];
  const b = pts[(bestI + 1) % pts.length];
  const seg = Math.hypot(b.x - a.x, b.y - a.y);
  const along = a.dist + seg * bestT;
  const px = a.x + (b.x - a.x) * bestT;
  const py = a.y + (b.y - a.y) * bestT;
  const tx = a.tx;
  const ty = a.ty;
  const side = (x - px) * -ty + (y - py) * tx;
  return { p: a, dist: Math.sqrt(bestD), along, side };
}

export function crossedGate(prev: number, now: number, gate: number, len: number): boolean {
  const dp = (now - prev + len) % len;
  if (dp <= 0 || dp > len * 0.45) return false;
  const dg = (gate - prev + len) % len;
  return dg > 0 && dg <= dp;
}
