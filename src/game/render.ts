import { clamp, forwardX, forwardY, hash2 } from "./math";
import { eachParticle, eachSkid, type Particle } from "./particles";
import type { Car, Track } from "./types";

export type Camera = {
  x: number;
  y: number;
  yaw: number;
  zoom: number;
  shakeX: number;
  shakeY: number;
};

let baked: HTMLCanvasElement | null = null;
let bakeOrigin = { left: 0, top: 0, scale: 1 };

export function bakeWorld(track: Track): void {
  const pad = 160;
  const left = track.minX - pad;
  const bottom = track.minY - pad;
  const right = track.maxX + pad;
  const top = track.maxY + pad;
  const worldW = right - left;
  const worldH = top - bottom;
  const scale = 1.15;
  const c = document.createElement("canvas");
  c.width = Math.ceil(worldW * scale);
  c.height = Math.ceil(worldH * scale);
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, -scale, -left * scale, top * scale);

  ctx.fillStyle = "#0c1410";
  ctx.fillRect(left, bottom, worldW, worldH);

  for (let i = 0; i < 1400; i++) {
    const x = left + hash2(i, 3) * worldW;
    const y = bottom + hash2(i, 9) * worldH;
    ctx.fillStyle = `rgba(18, 40, 24, ${0.15 + hash2(i, 1) * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, 6 + hash2(i, 2) * 16, 0, Math.PI * 2);
    ctx.fill();
  }

  const h = track.heart;
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.scale(h.s, h.s);
  ctx.fillStyle = "#1a0c12";
  heartPath(ctx);
  ctx.fill();
  ctx.fillStyle = "#4a1522";
  for (let i = 0; i < 40; i++) {
    const a = hash2(i, 11) * Math.PI * 2;
    const r = 0.15 + hash2(i, 12) * 0.7;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.55, 0.15 + Math.sin(a) * r * 0.5, 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const pts = track.pts;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i === 0) ctx.moveTo(p.ox - p.nx * 16, p.oy - p.ny * 16);
    else ctx.lineTo(p.ox - p.nx * 16, p.oy - p.ny * 16);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    ctx.lineTo(p.ix + p.nx * 16, p.iy + p.ny * 16);
  }
  ctx.closePath();
  ctx.fillStyle = "#1a1c20";
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i === 0) ctx.moveTo(p.ox, p.oy);
    else ctx.lineTo(p.ox, p.oy);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    ctx.lineTo(p.ix, p.iy);
  }
  ctx.closePath();
  ctx.fillStyle = "#2b2d33";
  ctx.fill();
  ctx.strokeStyle = "#3a3d44";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    const p = pts[i];
    if (i === 0) ctx.moveTo(p.rx, p.ry);
    else ctx.lineTo(p.rx, p.ry);
  }
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 3.2;
  ctx.stroke();

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (Math.abs(p.curv) < 0.008) continue;
    const n = pts[(i + 1) % pts.length];
    const red = i % 2 === 0;
    ctx.strokeStyle = red ? "#d0122d" : "#f4f1ee";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(p.ix, p.iy);
    ctx.lineTo(n.ix, n.iy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.ox, p.oy);
    ctx.lineTo(n.ox, n.oy);
    ctx.stroke();
  }

  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = "rgba(244,241,238,0.28)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  const s0 = pts[0];
  for (let k = -4; k <= 4; k++) {
    ctx.strokeStyle = k % 2 === 0 ? "#f4f1ee" : "#141414";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(s0.x + s0.nx * k * 4.5 - s0.tx * 6, s0.y + s0.ny * k * 4.5 - s0.ty * 6);
    ctx.lineTo(s0.x + s0.nx * k * 4.5 + s0.tx * 6, s0.y + s0.ny * k * 4.5 + s0.ty * 6);
    ctx.stroke();
  }

  if (track.pit.length > 1) {
    ctx.beginPath();
    ctx.moveTo(track.pit[0].x2, track.pit[0].y2);
    for (const q of track.pit) ctx.lineTo(q.x2, q.y2);
    ctx.strokeStyle = "#3d3f46";
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "#d0122d";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const q of track.pit) ctx.lineTo(q.x1, q.y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#16181e";
    ctx.save();
    ctx.translate(48, 80);
    ctx.rotate(-0.05);
    ctx.fillRect(-18, -50, 36, 110);
    ctx.fillStyle = "#d0122d";
    ctx.fillRect(-18, -50, 36, 6);
    ctx.restore();
    ctx.save();
    ctx.translate(48, 80);
    ctx.scale(1, -1);
    ctx.fillStyle = "#f4f1ee";
    ctx.font = "600 9px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PIT", 0, -8);
    ctx.restore();
  }

  ctx.strokeStyle = "#8a909c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const bx = p.ox - p.nx * 7;
    const by = p.oy - p.ny * 7;
    if (i === 0) ctx.moveTo(bx, by);
    else ctx.lineTo(bx, by);
  }
  ctx.stroke();
  for (let i = 0; i < pts.length; i += 3) {
    const p = pts[i];
    ctx.fillStyle = i % 6 === 0 ? "#d0122d" : "#f4f1ee";
    ctx.fillRect(p.ox - p.nx * 9 - 1.4, p.oy - p.ny * 9 - 1.4, 2.8, 2.8);
  }

  for (const st of track.stands) {
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.angle);
    ctx.fillStyle = "#14161c";
    ctx.fillRect(-st.w / 2, 0, st.w, st.d);
    ctx.fillStyle = "#0e1014";
    ctx.fillRect(-st.w / 2, st.d - 6, st.w, 6);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 28; col++) {
        const lit = hash2(row, col + Math.floor(st.x)) > 0.35;
        ctx.fillStyle = lit ? `rgba(255, ${180 + (col % 3) * 20}, 190, 0.7)` : "rgba(40,40,48,0.8)";
        ctx.fillRect(-st.w / 2 + 6 + (col * (st.w - 12)) / 28, 4 + row * 6, 3.2, 3.2);
      }
    }
    ctx.restore();
  }

  for (const t of track.trees) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(t.x + 3, t.y - 2, t.r * 0.9, t.r * 0.55, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgb(${10 + t.shade * 20}, ${36 + t.shade * 40}, ${16 + t.shade * 18})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgb(${16 + t.shade * 24}, ${52 + t.shade * 36}, ${22})`;
    ctx.beginPath();
    ctx.arc(t.x - t.r * 0.25, t.y + t.r * 0.2, t.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const b of track.billboards) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.fillStyle = "#0c0d11";
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.strokeStyle = "#d0122d";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.scale(1, -1);
    ctx.fillStyle = "#f4f1ee";
    ctx.font = "700 8px 'Barlow Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.text, 0, 0);
    ctx.restore();
  }

  for (const p of track.poles) {
    ctx.fillStyle = "#2a2c32";
    ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 70);
    g.addColorStop(0, "rgba(255,214,170,0.16)");
    g.addColorStop(1, "rgba(255,214,170,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(s0.x, s0.y);
  ctx.rotate(Math.atan2(s0.tx, s0.ty));
  ctx.fillStyle = "#1a1c22";
  ctx.fillRect(-s0.halfW - 8, -3, s0.halfW * 2 + 16, 6);
  ctx.fillStyle = "#d0122d";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-16 + i * 8, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  baked = c;
  bakeOrigin = { left, top, scale };
}

function heartPath(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(0, 0.25);
  ctx.bezierCurveTo(0, -0.15, -0.55, -0.15, -0.55, 0.22);
  ctx.bezierCurveTo(-0.55, 0.5, 0, 0.72, 0, 0.95);
  ctx.bezierCurveTo(0, 0.72, 0.55, 0.5, 0.55, 0.22);
  ctx.bezierCurveTo(0.55, -0.15, 0, -0.15, 0, 0.25);
}

export function applyCamera(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
  carY = 0.6,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(w / 2 + cam.shakeX, h * carY + cam.shakeY);
  ctx.rotate(-cam.yaw);
  ctx.scale(cam.zoom, -cam.zoom);
  ctx.translate(-cam.x, -cam.y);
}

export function drawWorld(ctx: CanvasRenderingContext2D, track: Track): void {
  if (!baked) bakeWorld(track);
  if (!baked) return;
  const { left, top, scale } = bakeOrigin;
  ctx.save();
  ctx.translate(left, top);
  ctx.scale(1 / scale, -1 / scale);
  ctx.drawImage(baked, 0, 0);
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, -s);
  ctx.beginPath();
  ctx.moveTo(0, 0.25);
  ctx.bezierCurveTo(0, -0.2, -0.6, -0.2, -0.6, 0.22);
  ctx.bezierCurveTo(-0.6, 0.52, 0, 0.78, 0, 1);
  ctx.bezierCurveTo(0, 0.78, 0.6, 0.52, 0.6, 0.22);
  ctx.bezierCurveTo(0.6, -0.2, 0, -0.2, 0, 0.25);
  ctx.fill();
  ctx.restore();
}

export function drawSkids(ctx: CanvasRenderingContext2D): void {
  eachSkid((m) => {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.yaw);
    ctx.globalAlpha = clamp(m.life * 0.35, 0, 0.4);
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(-1.1, -2.2, m.w, 4.4);
    ctx.fillRect(1.1 - m.w, -2.2, m.w, 4.4);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, lights = true): void {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.yaw);

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, -1.2, 6.2, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  if (lights) {
    const hg = ctx.createRadialGradient(0, 16, 1, 0, 28, 34);
    hg.addColorStop(0, "rgba(255,230,190,0.55)");
    hg.addColorStop(1, "rgba(255,230,190,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-3, 11);
    ctx.lineTo(-16, 40);
    ctx.lineTo(16, 40);
    ctx.lineTo(3, 11);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#111";
  roundedRect(ctx, -5.4, 5.2, 3.2, 5.4, 0.8);
  roundedRect(ctx, 2.2, 5.2, 3.2, 5.4, 0.8);
  roundedRect(ctx, -5.6, -9.4, 3.4, 5.6, 0.8);
  roundedRect(ctx, 2.2, -9.4, 3.4, 5.6, 0.8);

  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.moveTo(0, 12.5);
  ctx.lineTo(1.4, 10);
  ctx.lineTo(2.4, 4);
  ctx.lineTo(3.4, -2);
  ctx.lineTo(3.1, -9);
  ctx.lineTo(2.2, -11.5);
  ctx.lineTo(-2.2, -11.5);
  ctx.lineTo(-3.1, -9);
  ctx.lineTo(-3.4, -2);
  ctx.lineTo(-2.4, 4);
  ctx.lineTo(-1.4, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = car.accent;
  ctx.fillRect(-1.1, -11, 2.2, 20);

  ctx.fillStyle = "#0b0c10";
  ctx.beginPath();
  ctx.ellipse(0, -1.2, 1.7, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#c9ccd3";
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.arc(0, 0.4, 1.9, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.fillStyle = "#d8dbe2";
  ctx.fillRect(-5.2, 10.6, 10.4, 1.5);
  ctx.fillStyle = car.accent;
  ctx.fillRect(-4.4, -12.6, 8.8, 1.8);
  ctx.fillRect(-0.45, -14.2, 0.9, 1.8);

  ctx.fillStyle = "#ffdca8";
  ctx.beginPath();
  ctx.arc(-1.5, 11.2, 0.55, 0, Math.PI * 2);
  ctx.arc(1.5, 11.2, 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d0122d";
  ctx.beginPath();
  ctx.arc(-1.6, -11.8, 0.5, 0, Math.PI * 2);
  ctx.arc(1.6, -11.8, 0.5, 0, Math.PI * 2);
  ctx.fill();

  if (car.isPlayer) {
    ctx.fillStyle = "#d0122d";
    drawHeart(ctx, 0, 4.5, 1.6);
  }

  if (car.boosting) {
    ctx.fillStyle = "rgba(255,80,60,0.85)";
    ctx.beginPath();
    ctx.moveTo(-1.8, -12.5);
    ctx.lineTo(0, -20 - Math.random() * 6);
    ctx.lineTo(1.8, -12.5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,220,200,0.9)";
    ctx.beginPath();
    ctx.moveTo(-0.8, -12.5);
    ctx.lineTo(0, -16);
    ctx.lineTo(0.8, -12.5);
    ctx.fill();
  }

  if (car.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${car.flash * 0.45})`;
    ctx.fillRect(-6, -14, 12, 28);
  }

  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function drawParticles(ctx: CanvasRenderingContext2D): void {
  eachParticle((p: Particle) => {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = a;
    ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
    if (p.kind === "heart") {
      drawHeart(ctx, 0, 0, p.size * 0.35);
    } else if (p.kind === "confetti") {
      ctx.fillRect(-p.size * 0.5, -p.size * 0.2, p.size, p.size * 0.4);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  track: Track,
  cars: Car[],
  x: number,
  y: number,
  size: number,
): void {
  const tw = track.maxX - track.minX;
  const th = track.maxY - track.minY;
  const sc = (size - 16) / Math.max(tw, th);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(7,8,12,0.72)";
  ctx.strokeStyle = "rgba(244,241,238,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 12);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.scale(sc, -sc);
  ctx.translate(-(track.minX + tw / 2), -(track.minY + th / 2));
  ctx.beginPath();
  for (let i = 0; i < track.pts.length; i++) {
    const p = track.pts[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.strokeStyle = "rgba(244,241,238,0.55)";
  ctx.lineWidth = 4 / sc;
  ctx.stroke();
  for (const car of cars) {
    ctx.fillStyle = car.isPlayer ? "#d0122d" : car.color;
    ctx.beginPath();
    ctx.arc(car.x, car.y, (car.isPlayer ? 7 : 5) / sc, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

export function drawSpeedVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  speed: number,
  boosting: boolean,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(w / 2, h * 0.6, h * 0.2, w / 2, h * 0.6, h * 0.85);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.28 + clamp(speed / 400, 0, 0.25)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (boosting) {
    ctx.fillStyle = "rgba(208,18,45,0.08)";
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawFinishFlash(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const a = clamp(1 - t / 1.1, 0, 1);
  if (a <= 0) return;
  ctx.fillStyle = `rgba(244,241,238,${a * 0.22})`;
  ctx.fillRect(0, 0, w, h);
}

export function worldForward(yaw: number): { x: number; y: number } {
  return { x: forwardX(yaw), y: forwardY(yaw) };
}
