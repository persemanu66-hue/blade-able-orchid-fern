import type { Actions } from "./types";

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Escape",
  "KeyP",
  "KeyR",
]);

const keys = new Set<string>();
let injectedKeys: Set<string> | null = null;
let injectedSteer: number | null = null;

export const touch = {
  throttle: 0,
  brake: 0,
  steer: 0,
  boost: false,
};

let pauseEdge = false;
let prevPause = false;
let prevRespawn = false;

function onKeyDown(e: KeyboardEvent): void {
  if (GAME_CODES.has(e.code)) e.preventDefault();
  keys.add(e.code);
}

function onKeyUp(e: KeyboardEvent): void {
  keys.delete(e.code);
}

function onBlur(): void {
  keys.clear();
}

export function attachInput(): void {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onBlur);
}

export function detachInput(): void {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("visibilitychange", onBlur);
  keys.clear();
  injectedKeys = null;
  injectedSteer = null;
  touch.throttle = 0;
  touch.brake = 0;
  touch.steer = 0;
  touch.boost = false;
  prevPause = false;
  prevRespawn = false;
  pauseEdge = false;
}

export function setInjectedKeys(codes: string[]): void {
  injectedKeys = codes.length ? new Set(codes) : null;
}

export function setInjectedSteer(v: number | null): void {
  injectedSteer = v;
}

export function readActions(): Actions {
  const k = injectedKeys ?? keys;
  let throttle = touch.throttle;
  let brake = touch.brake;
  let steer = touch.steer;
  let boost = touch.boost;

  if (k.has("KeyW") || k.has("ArrowUp")) throttle = 1;
  if (k.has("KeyS") || k.has("ArrowDown")) brake = 1;
  if (k.has("KeyA") || k.has("ArrowLeft")) steer += 1;
  if (k.has("KeyD") || k.has("ArrowRight")) steer -= 1;
  if (k.has("Space")) boost = true;

  const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
  if (pads) {
    for (const pad of pads) {
      if (!pad) continue;
      const ax = pad.axes[0] ?? 0;
      if (Math.abs(ax) > 0.18) {
        const s = Math.abs(ax) - 0.18;
        const v = (s / 0.82) * Math.sign(-ax);
        steer += v;
      }
      const rt = pad.buttons[7]?.value ?? 0;
      const lt = pad.buttons[6]?.value ?? 0;
      if (rt > 0.05) throttle = Math.max(throttle, rt);
      if (lt > 0.05) brake = Math.max(brake, lt);
      if (pad.buttons[0]?.pressed) boost = true;
      if (pad.buttons[9]?.pressed) pauseEdge = true;
    }
  }

  if (injectedSteer !== null) steer = injectedSteer;

  const pauseHeld = k.has("Escape") || k.has("KeyP") || pauseEdge;
  const pause = pauseHeld && !prevPause;
  prevPause = pauseHeld;
  pauseEdge = false;

  const respawnHeld = k.has("KeyR");
  const respawn = respawnHeld && !prevRespawn;
  prevRespawn = respawnHeld;

  return {
    throttle: throttle > 1 ? 1 : throttle,
    brake: brake > 1 ? 1 : brake,
    steer: steer > 1 ? 1 : steer < -1 ? -1 : steer,
    boost,
    pause,
    respawn,
  };
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}
