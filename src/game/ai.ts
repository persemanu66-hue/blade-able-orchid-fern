import { angNorm, clamp } from "./math";
import { pointAtDist, projectOnTrack } from "./track";
import type { Actions, Car, Track } from "./types";

export function aiActions(car: Car, track: Track, playerAlong: number, playerLap: number): Actions {
  const off = projectOnTrack(track, car.x, car.y);
  const look = 70 + car.speed * 0.55 + car.aiLook;
  const wobble = Math.sin(off.along * 0.015 + car.id * 1.7) * 6 * (1 - car.aiSkill);
  const target = pointAtDist(track.pts, track.length, off.along + look);
  const lane = car.aiOffset * 0.22 + wobble;
  const aimX = target.rx + target.nx * lane;
  const aimY = target.ry + target.ny * lane;
  const desired = Math.atan2(-(aimX - car.x), aimY - car.y);
  const err = angNorm(desired - car.yaw);
  const steer = clamp(err * 1.55, -1, 1);

  let maxC = 0;
  for (let d = 30; d < 160; d += 18) {
    const q = pointAtDist(track.pts, track.length, off.along + d);
    maxC = Math.max(maxC, Math.abs(q.curv));
  }
  let want = car.maxSpeed * (1 - clamp(maxC * 42, 0, 0.62)) * car.aiSkill;
  want *= 0.9 + 0.12 * Math.sin(off.along * 0.02 + car.id);

  const myProg = car.lap * track.length + off.along;
  const plProg = playerLap * track.length + playerAlong;
  const gap = myProg - plProg;
  if (gap > 180) want *= 0.88;
  if (gap > 420) want *= 0.78;
  if (gap > 700) want *= 0.72;
  if (gap < -220) want *= 1.07;
  if (gap < -480) want *= 1.12;

  const throttle = car.speed < want - 4 ? 1 : car.speed > want + 6 ? 0.15 : 0.7;
  const brake = car.speed > want + 12 || (maxC > 0.018 && car.speed > want) ? 0.55 : 0;
  const boost = maxC < 0.006 && car.speed > 50 && car.boost > 0.4 && car.id % 2 === 0;

  return {
    throttle: brake > 0.4 ? 0.2 : throttle,
    brake,
    steer,
    boost,
    pause: false,
    respawn: false,
  };
}
