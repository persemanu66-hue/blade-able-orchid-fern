import { clamp, forwardX, forwardY } from "./math";
import { pointAtDist, projectOnTrack } from "./track";
import type { Actions, Car, Track } from "./types";

export const PLAYER_BOOST = 124;

export function stepCar(
  car: Car,
  act: Actions,
  track: Track,
  dt: number,
  canDrive: boolean,
): void {
  if (car.finished) {
    car.speed = Math.abs(car.speed) < 4 ? 0 : car.speed * (1 - 1.8 * dt);
    car.boosting = false;
    car.skid *= 1 - 4 * dt;
    integrate(car, dt);
    constrain(car, track, dt);
    return;
  }

  if (!canDrive) {
    idleCar(car, dt);
    return;
  }

  const off = projectOnTrack(track, car.x, car.y);
  const onTarmac = off.dist < off.p.halfW + 2;
  const inRunoff = off.dist < off.p.halfW + 18;

  const wantBoost = act.boost && car.boost > 0.08 && act.throttle > 0.2;
  car.boosting = wantBoost;
  if (wantBoost) car.boost = Math.max(0, car.boost - 0.28 * dt);
  else car.boost = Math.min(1, car.boost + 0.11 * dt);

  const cap = (car.boosting ? car.maxSpeed * 1.34 : car.maxSpeed) * (onTarmac ? 1 : 0.42);
  const accel = (car.isPlayer ? 64 : 54) * (car.boosting ? 1.45 : 1);
  const brakeF = car.isPlayer ? 90 : 78;

  if (act.throttle > 0) car.speed += accel * act.throttle * dt;
  if (act.brake > 0) {
    if (car.speed > 2) car.speed -= brakeF * act.brake * dt;
    else car.speed -= 28 * act.brake * dt;
  }
  const drag = (act.throttle > 0.1 ? 0.18 : 0.85) + (onTarmac ? 0 : 2.4);
  car.speed -= car.speed * drag * dt;
  if (car.speed > cap) car.speed += (cap - car.speed) * Math.min(1, 4 * dt);
  car.speed = clamp(car.speed, car.isPlayer ? -28 : -12, car.boosting ? PLAYER_BOOST : cap + 4);

  const spd = Math.abs(car.speed);
  const speedFactor = clamp(spd / 26, 0, 1) * (1 - clamp(spd / 170, 0, 0.4));
  const reverse = car.speed >= 0 ? 1 : -1;
  const turnRate = (car.isPlayer ? 2.55 : 2.2) + (car.skid > 0.4 ? 0.35 : 0);
  car.yaw += act.steer * turnRate * speedFactor * reverse * dt;

  const grip =
    (onTarmac ? 0.92 : 0.55) -
    clamp((Math.abs(act.steer) * spd) / 180, 0, 0.35) -
    (car.boosting ? 0.08 : 0);
  car.lateral += act.steer * spd * 0.22 * dt;
  car.lateral *= Math.pow(clamp(grip, 0.35, 0.96), dt * 60);
  car.skid = clamp(Math.abs(car.lateral) / 18, 0, 1);

  integrate(car, dt);

  if (!inRunoff) {
    const push = off.dist - (off.p.halfW + 16) + 2;
    const sx = Math.sign(off.side || 1);
    car.x -= off.p.nx * sx * push * 0.65;
    car.y -= off.p.ny * sx * push * 0.65;
    car.speed *= 1 - 2.2 * dt;
    car.flash = 0.25;
    car.lateral *= 0.4;
  }

  const fx = forwardX(car.yaw);
  const fy = forwardY(car.yaw);
  const alongDot = fx * off.p.tx + fy * off.p.ty;
  if (car.speed > 8 && alongDot < -0.35) car.wrongWay += dt;
  else car.wrongWay = Math.max(0, car.wrongWay - dt * 2);

  if (!onTarmac && spd < 6) car.stuckT += dt;
  else if (spd < 1.2 && act.throttle < 0.1) car.stuckT += dt * 0.45;
  else car.stuckT = 0;

  car.flash = Math.max(0, car.flash - dt);
  car.rev = clamp(Math.abs(car.speed) / (car.maxSpeed + 10) + (car.boosting ? 0.2 : 0), 0, 1.2);
}

function integrate(car: Car, dt: number): void {
  const fx = forwardX(car.yaw);
  const fy = forwardY(car.yaw);
  const rx = fy;
  const ry = -fx;
  car.vx = fx * car.speed + rx * car.lateral;
  car.vy = fy * car.speed + ry * car.lateral;
  car.x += car.vx * dt;
  car.y += car.vy * dt;
}

function constrain(car: Car, track: Track, dt: number): void {
  const off = projectOnTrack(track, car.x, car.y);
  if (off.dist > off.p.halfW + 18) {
    const push = off.dist - (off.p.halfW + 16);
    const sx = Math.sign(off.side || 1);
    car.x -= off.p.nx * sx * push * 0.8;
    car.y -= off.p.ny * sx * push * 0.8;
    car.speed *= 1 - 1.4 * dt;
  }
}

export function idleCar(car: Car, dt: number): void {
  car.speed *= 1 - 4 * dt;
  car.lateral *= 1 - 6 * dt;
  car.boosting = false;
}

export function respawnCar(car: Car, track: Track): void {
  const p = pointAtDist(track.pts, track.length, car.lastCpAlong);
  const lane = car.isPlayer ? 0 : car.aiOffset * 0.35;
  car.x = p.x + p.nx * lane;
  car.y = p.y + p.ny * lane;
  car.yaw = Math.atan2(-p.tx, p.ty);
  car.speed = car.isPlayer ? 22 : 18;
  car.lateral = 0;
  car.vx = 0;
  car.vy = 0;
  car.stuckT = 0;
  car.wrongWay = 0;
  car.flash = 0.4;
  car.boosting = false;
  car.along = p.dist;
  car.lastAlong = p.dist;
}

export function makeCar(
  partial: Omit<
    Car,
    | "vx"
    | "vy"
    | "lateral"
    | "boost"
    | "boosting"
    | "lap"
    | "nextCp"
    | "along"
    | "lastAlong"
    | "lastCpAlong"
    | "finished"
    | "finishPlace"
    | "flash"
    | "skid"
    | "rev"
    | "wrongWay"
    | "stuckT"
  > &
    Partial<Car>,
): Car {
  return {
    vx: 0,
    vy: 0,
    lateral: 0,
    boost: 1,
    boosting: false,
    lap: 1,
    nextCp: 1,
    along: 0,
    lastAlong: 0,
    lastCpAlong: 0,
    finished: false,
    finishPlace: 0,
    flash: 0,
    skid: 0,
    rev: 0.2,
    wrongWay: 0,
    stuckT: 0,
    ...partial,
  };
}
