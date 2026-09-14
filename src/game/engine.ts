import { aiActions } from "./ai";
import { disposeAudio, playCollision, playCountdown, playFinish, playUi, unlockAudio, updateAudio } from "./audio";
import { idleCar, makeCar, respawnCar, stepCar } from "./car";
import {
  attachInput,
  detachInput,
  isCoarsePointer,
  readActions,
  setInjectedKeys,
  setInjectedSteer,
  touch,
} from "./input";
import { angNorm, clamp, expLerp, forwardX, forwardY } from "./math";
import { burstConfetti, burstHearts, clearParticles, spawn, stampSkid, stepParticles } from "./particles";
import {
  applyCamera,
  bakeWorld,
  drawCar,
  drawFinishFlash,
  drawMinimap,
  drawParticles,
  drawSkids,
  drawSpeedVignette,
  drawWorld,
  type Camera,
} from "./render";
import { FIELD_SIZE, loadPrefs, savePrefs, TOTAL_LAPS, useGameUI } from "./store";
import { crossedGate, getTrack, pointAtDist, projectOnTrack } from "./track";
import type { Actions, Car, ControlsProbe, Screen, Standing, Track } from "./types";

const OPPONENTS = [
  { name: "Bimba Racing", color: "#b91c1c", accent: "#f4f1ee", skill: 0.88, max: 84, look: 8 },
  { name: "Love GP", color: "#e8e4dc", accent: "#d0122d", skill: 0.82, max: 81, look: 4 },
  { name: "Heart Racing", color: "#9f1239", accent: "#f4f1ee", skill: 0.78, max: 79, look: 10 },
  { name: "Red Heart Motorsport", color: "#7f1d1d", accent: "#d0122d", skill: 0.74, max: 77, look: 2 },
  { name: "Forever GP", color: "#292524", accent: "#d0122d", skill: 0.7, max: 75, look: 12 },
] as const;

const TOASTS = [
  "Forza Bimba",
  "Un altro giro insieme.",
  "Sei la mia pole position",
  "Sempre al tuo fianco.",
  "+1 anno insieme",
  "Non mollare, Bimba.",
];

type Runtime = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  track: Track;
  cars: Car[];
  player: Car;
  cam: Camera;
  flyAlong: number;
  acc: number;
  last: number;
  raf: number;
  countdownT: number;
  toastCooldown: number;
  toastI: number;
  toastHandle: number | null;
  trauma: number;
  finishers: number;
  celebrateT: number;
  uiT: number;
  running: boolean;
  raceTime: number;
  lapClock: number;
  lastLap: number;
  bestLap: number;
  hitstop: number;
  skidStamp: number;
  wasBoosting: boolean;
};

let rt: Runtime | null = null;
const EMPTY_ACT: Actions = { throttle: 0, brake: 0, steer: 0, boost: false, pause: false, respawn: false };

function placeOnGrid(track: Track, slot: number): { x: number; y: number; yaw: number; along: number } {
  const row = Math.floor(slot / 2);
  const col = slot % 2 === 0 ? -1 : 1;
  const along = track.length - 22 - row * 24;
  const p = pointAtDist(track.pts, track.length, along);
  return {
    x: p.x + p.nx * col * 7,
    y: p.y + p.ny * col * 7,
    yaw: Math.atan2(-p.tx, p.ty),
    along,
  };
}

function createCars(track: Track): Car[] {
  const cars: Car[] = [];
  for (let i = 0; i < OPPONENTS.length; i++) {
    const o = OPPONENTS[i];
    const g = placeOnGrid(track, i);
    cars.push(
      makeCar({
        id: i,
        name: o.name,
        color: o.color,
        accent: o.accent,
        x: g.x,
        y: g.y,
        yaw: g.yaw,
        speed: 0,
        isPlayer: false,
        aiSkill: o.skill,
        aiOffset: (i - 2) * 3.5,
        aiLook: o.look,
        maxSpeed: o.max,
        along: g.along,
        lastAlong: g.along,
        lastCpAlong: g.along,
      }),
    );
  }
  const g = placeOnGrid(track, 5);
  cars.push(
    makeCar({
      id: 5,
      name: "Bimba",
      color: "#121212",
      accent: "#d0122d",
      x: g.x,
      y: g.y,
      yaw: g.yaw,
      speed: 0,
      isPlayer: true,
      aiSkill: 1,
      aiOffset: 0,
      aiLook: 0,
      maxSpeed: 94,
      along: g.along,
      lastAlong: g.along,
      lastCpAlong: g.along,
    }),
  );
  return cars;
}

function clearToastTimer(r: Runtime): void {
  if (r.toastHandle != null) {
    window.clearTimeout(r.toastHandle);
    r.toastHandle = null;
  }
}

function resetRace(r: Runtime): void {
  r.cars = createCars(r.track);
  r.player = r.cars.find((c) => c.isPlayer)!;
  r.countdownT = 0;
  r.finishers = 0;
  r.celebrateT = 0;
  r.trauma = 0;
  r.toastCooldown = 7;
  r.raceTime = 0;
  r.lapClock = 0;
  r.lastLap = 0;
  r.bestLap = 0;
  r.hitstop = 0;
  r.skidStamp = 0;
  r.wasBoosting = false;
  clearToastTimer(r);
  clearParticles();
  const p = r.player;
  r.cam.x = p.x;
  r.cam.y = p.y;
  r.cam.yaw = p.yaw;
  r.cam.zoom = 5.2;
}

function progressOf(car: Car, track: Track): number {
  return car.lap * track.length + car.along;
}

function racePosition(r: Runtime, car: Car): number {
  const mine = progressOf(car, r.track);
  let pos = 1;
  for (const o of r.cars) {
    if (o === car) continue;
    if (o.finished && !car.finished) {
      pos += 1;
      continue;
    }
    if (!o.finished && car.finished) continue;
    if (o.finished && car.finished) {
      if (o.finishPlace < car.finishPlace) pos += 1;
      continue;
    }
    if (progressOf(o, r.track) > mine + 0.5) pos += 1;
  }
  return pos;
}

function standingsOf(r: Runtime): Standing[] {
  return r.cars
    .map((c) => ({
      name: c.name,
      place: racePosition(r, c),
      isPlayer: c.isPlayer,
      finished: c.finished,
    }))
    .sort((a, b) => a.place - b.place);
}

function updateCheckpoints(r: Runtime, car: Car): void {
  if (car.finished) {
    car.lastAlong = car.along;
    return;
  }
  const prev = car.lastAlong;
  const now = car.along;
  car.lastAlong = now;
  const cps = r.track.checkpoints;
  const len = r.track.length;
  let guard = 0;
  while (guard++ < cps.length) {
    const next = car.nextCp;
    const gate = cps[next];
    if (!crossedGate(prev, now, gate, len)) break;
    car.lastCpAlong = gate;
    if (next === 0) {
      car.lap += 1;
      car.nextCp = 1;
      if (car.isPlayer) {
        r.lastLap = r.lapClock;
        if (r.bestLap <= 0 || r.lapClock < r.bestLap) r.bestLap = r.lapClock;
        r.lapClock = 0;
        burstHearts(car.x, car.y, 8);
        if (car.lap <= TOTAL_LAPS) pushToast(r, `Giro ${car.lap}`);
      }
      if (car.lap > TOTAL_LAPS) {
        car.lap = TOTAL_LAPS;
        car.finished = true;
        r.finishers += 1;
        car.finishPlace = r.finishers;
        if (car.isPlayer) beginCelebration(r);
        break;
      }
    } else {
      car.nextCp = (next + 1) % cps.length;
    }
  }
}

function beginCelebration(r: Runtime): void {
  burstConfetti(r.player.x, r.player.y, 55);
  burstHearts(r.player.x, r.player.y, 18);
  playFinish();
  r.celebrateT = 0;
  r.trauma = 0.45;
  const results = standingsOf(r);
  useGameUI.setState({
    screen: "celebration",
    finalPosition: racePosition(r, r.player),
    countdown: null,
    results,
    toast: null,
  });
}

function pushToast(r: Runtime, text: string): void {
  clearToastTimer(r);
  r.toastCooldown = 2.4;
  useGameUI.setState({ toast: text });
  r.toastHandle = window.setTimeout(() => {
    r.toastHandle = null;
    if (useGameUI.getState().toast === text) useGameUI.setState({ toast: null });
  }, 2400);
}

function collideCars(r: Runtime): void {
  const cars = r.cars;
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const a = cars[i];
      const b = cars[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const rad = 11;
      if (d2 > rad * rad || d2 < 0.001) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const pen = rad - d;
      a.x -= nx * pen * 0.5;
      a.y -= ny * pen * 0.5;
      b.x += nx * pen * 0.5;
      b.y += ny * pen * 0.5;
      a.speed *= 0.88;
      b.speed *= 0.88;
      a.flash = 0.15;
      b.flash = 0.15;
      if (a.isPlayer || b.isPlayer) {
        r.trauma = Math.max(r.trauma, 0.28);
        r.hitstop = Math.max(r.hitstop, 2);
        playCollision();
      }
    }
  }
}

function updateCam(r: Runtime, dt: number, chasing: Car, cinematic: boolean): void {
  const fx = forwardX(chasing.yaw);
  const fy = forwardY(chasing.yaw);
  const look = cinematic ? 40 : 18 + Math.abs(chasing.speed) * 0.22;
  const tx = chasing.x + fx * look;
  const ty = chasing.y + fy * look;
  r.cam.x = expLerp(r.cam.x, tx, cinematic ? 1.6 : 6.5, dt);
  r.cam.y = expLerp(r.cam.y, ty, cinematic ? 1.6 : 6.5, dt);
  r.cam.yaw = r.cam.yaw + angNorm(chasing.yaw - r.cam.yaw) * (1 - Math.exp(-(cinematic ? 2.2 : 8) * dt));
  const zWant =
    cinematic ? 3.4 : 5.4 - clamp(Math.abs(chasing.speed) / 140, 0, 1.1) - (chasing.boosting ? 0.25 : 0);
  r.cam.zoom = expLerp(r.cam.zoom, zWant, 3.2, dt);
  const shakeOn = useGameUI.getState().shakeOn;
  const s = shakeOn ? r.trauma * r.trauma : 0;
  r.cam.shakeX = (Math.random() - 0.5) * s * 14;
  r.cam.shakeY = (Math.random() - 0.5) * s * 14;
  r.trauma = Math.max(0, r.trauma - dt * 1.6);
}

function maybeRespawn(r: Runtime, car: Car, forced: boolean): void {
  if (car.finished) return;
  if (!forced && car.stuckT < 2.4 && car.wrongWay < 3.2) return;
  respawnCar(car, r.track);
  if (car.isPlayer) pushToast(r, "Riparti dal punto di controllo");
}

function update(r: Runtime, dt: number): void {
  const screen = useGameUI.getState().screen;
  const act = readActions();

  if (act.pause && (screen === "race" || screen === "countdown")) {
    useGameUI.setState({ screen: "paused", pausedFrom: screen });
    playUi();
  } else if (act.pause && screen === "paused") {
    const from = useGameUI.getState().pausedFrom ?? "race";
    useGameUI.setState({ screen: from === "countdown" ? "countdown" : "race", pausedFrom: null });
  }

  if (screen === "menu" || screen === "anniversary" || screen === "settings") {
    r.flyAlong = (r.flyAlong + dt * 42) % r.track.length;
    const p = pointAtDist(r.track.pts, r.track.length, r.flyAlong);
    const ghost = {
      ...r.player,
      x: p.x,
      y: p.y,
      yaw: Math.atan2(-p.tx, p.ty),
      speed: 40,
      boosting: false,
    };
    updateCam(r, dt, ghost, true);
    stepParticles(dt);
    updateAudio({ screen, speed: 20, throttle: 0.2, boosting: false, racing: false, skid: 0, braking: false });
    return;
  }

  const racing = screen === "race";
  const counting = screen === "countdown";
  const paused = screen === "paused";
  const celebrating = screen === "celebration" || screen === "victory" || screen === "letter" || screen === "closing";

  if (counting) {
    r.countdownT += dt;
    const slot = Math.floor(r.countdownT);
    const labels: Array<number | "go"> = [3, 2, 1, "go"];
    const cur = labels[Math.min(slot, 3)];
    if (useGameUI.getState().countdown !== cur) {
      useGameUI.setState({ countdown: cur });
      playCountdown(cur);
    }
    if (r.countdownT >= 3.85) {
      useGameUI.setState({ screen: "race", countdown: null });
      burstHearts(r.player.x, r.player.y, 6);
    }
  }

  if (!paused) {
    const playerAct: Actions = racing || screen === "celebration" ? act : EMPTY_ACT;
    for (const car of r.cars) {
      const a = car.isPlayer
        ? playerAct
        : racing
          ? aiActions(car, r.track, r.player.along, r.player.lap)
          : EMPTY_ACT;
      const canDrive = car.isPlayer ? racing || screen === "celebration" : racing;
      if (counting) idleCar(car, dt);
      else stepCar(car, a, r.track, dt, canDrive);
      const off = projectOnTrack(r.track, car.x, car.y);
      car.along = off.along;
      if (racing || screen === "celebration") updateCheckpoints(r, car);
      if (racing && car.isPlayer && (act.respawn || car.stuckT > 2.4 || car.wrongWay > 3.2)) {
        maybeRespawn(r, car, act.respawn);
      }
      if (car.skid > 0.45 && Math.random() < 0.6) {
        spawn("smoke", car.x, car.y, -car.vx * 0.1, -car.vy * 0.1, {
          size: 2.5,
          max: 0.5,
          r: 80,
          g: 80,
          b: 86,
        });
      }
      if (car.skid > 0.42) {
        r.skidStamp += dt;
        if (r.skidStamp > 0.04) {
          r.skidStamp = 0;
          stampSkid(car.x, car.y, car.yaw, car.skid);
        }
      }
      if (car.isPlayer && car.boosting && !r.wasBoosting) burstHearts(car.x, car.y, 3);
      if (car.isPlayer && car.boosting && Math.random() < 0.5) {
        spawn("spark", car.x, car.y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, {
          size: 2,
          max: 0.35,
          r: 255,
          g: 90,
          b: 70,
        });
      }
    }
    r.wasBoosting = r.player.boosting;
    collideCars(r);
    stepParticles(dt);

    if (racing) {
      r.raceTime += dt;
      r.lapClock += dt;
      r.toastCooldown -= dt;
      if (r.toastCooldown <= 0) {
        r.toastCooldown = 11 + Math.random() * 5;
        r.toastI = (r.toastI + 1) % TOASTS.length;
        pushToast(r, TOASTS[r.toastI]);
      }
    }
  }

  if (celebrating) {
    r.celebrateT += dt;
    if (screen === "celebration" || screen === "victory") {
      if (Math.random() < 0.35) burstConfetti(r.player.x + (Math.random() - 0.5) * 40, r.player.y + 20, 3);
      if (Math.random() < 0.2) burstHearts(r.player.x, r.player.y, 1);
    }
    if (r.celebrateT > 3.2 && screen === "celebration") {
      useGameUI.setState({ screen: "victory" });
    }
  }

  updateCam(r, dt, r.player, celebrating);
  updateAudio({
    screen,
    speed: r.player.speed,
    throttle: act.throttle,
    boosting: r.player.boosting,
    racing: racing || counting,
    skid: r.player.skid,
    braking: act.brake > 0.2,
  });

  r.uiT += dt;
  if (r.uiT > 0.08) {
    r.uiT = 0;
    useGameUI.setState({
      position: racePosition(r, r.player),
      lap: clamp(r.player.lap, 1, TOTAL_LAPS),
      speed: Math.round(Math.abs(r.player.speed) * 2.35),
      boost: r.player.boost,
      wrongWay: r.player.wrongWay > 0.7,
      standings: racing || counting || paused ? standingsOf(r) : useGameUI.getState().standings,
      lapTime: r.lapClock,
      bestLap: r.bestLap,
      lastLap: r.lastLap,
      raceTime: r.raceTime,
    });
  }
}

function draw(r: Runtime): void {
  const { canvas, ctx, track, cars, cam } = r;
  const dpr = canvas.width / Math.max(1, canvas.clientWidth);
  const w = canvas.width;
  const h = canvas.height;
  const screen = useGameUI.getState().screen;
  const mobile = canvas.clientWidth < 720 || canvas.clientHeight < 500;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#07080c";
  ctx.fillRect(0, 0, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#12141c");
  sky.addColorStop(1, "#07080c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  applyCamera(ctx, cam, w, h, mobile ? 0.5 : 0.6);
  drawWorld(ctx, track);
  drawSkids(ctx);
  drawParticles(ctx);
  const sorted = [...cars].sort((a, b) => a.y - b.y);
  for (const c of sorted) drawCar(ctx, c, true);

  drawSpeedVignette(ctx, w, h, r.player.speed, r.player.boosting);
  if (screen === "celebration") drawFinishFlash(ctx, w, h, r.celebrateT);

  if (screen === "race" || screen === "countdown" || screen === "paused") {
    const pad = 16 * dpr;
    const mm = Math.min(148, canvas.clientWidth * 0.3) * dpr;
    const topOff = 108 * dpr;
    drawMinimap(ctx, track, cars, w - mm - pad, pad + topOff, mm);
  }
}

function fit(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  const pw = Math.floor(w * dpr);
  const ph = Math.floor(h * dpr);
  if (canvas.width !== pw) canvas.width = pw;
  if (canvas.height !== ph) canvas.height = ph;
}

function loop(now: number): void {
  const r = rt;
  if (!r || !r.running) return;
  r.raf = requestAnimationFrame(loop);
  let dt = (now - r.last) / 1000;
  r.last = now;
  if (dt > 0.1) dt = 0.1;
  r.acc += dt;
  const step = 1 / 60;
  let guard = 0;
  while (r.acc >= step && guard < 5) {
    if (r.hitstop > 0) r.hitstop -= 1;
    else update(r, step);
    r.acc -= step;
    guard += 1;
  }
  fit(r.canvas);
  draw(r);
}

function exposeDebug(r: Runtime): void {
  const probe: ControlsProbe = {
    getYaw: () => r.player.yaw,
    getSpeed: () => r.player.speed,
    setSteer: (v) => setInjectedSteer(v),
    setKeys: (codes) => setInjectedKeys(codes),
  };
  window.__controlsTest = probe;
  window.__gameDebug = {
    finishRace: () => {
      r.player.lap = TOTAL_LAPS;
      r.player.nextCp = 0;
      r.player.along = 2;
      r.player.lastAlong = r.track.length - 4;
      r.player.finished = false;
      updateCheckpoints(r, r.player);
    },
    skipCountdown: () => {
      useGameUI.setState({ screen: "race", countdown: null });
    },
    getHud: () => useGameUI.getState(),
    getPlayer: () => ({
      x: r.player.x,
      y: r.player.y,
      yaw: r.player.yaw,
      speed: r.player.speed,
    }),
  };
}

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __gameDebug?: {
      finishRace: () => void;
      skipCountdown: () => void;
      getHud: () => ReturnType<typeof useGameUI.getState>;
      getPlayer: () => { x: number; y: number; yaw: number; speed: number };
    };
  }
}

export function mountGame(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) return () => {};
  loadPrefs();
  const track = getTrack();
  bakeWorld(track);
  attachInput();
  const cars = createCars(track);
  const player = cars.find((c) => c.isPlayer)!;
  const r: Runtime = {
    canvas,
    ctx,
    track,
    cars,
    player,
    cam: { x: player.x, y: player.y, yaw: player.yaw, zoom: 3.6, shakeX: 0, shakeY: 0 },
    flyAlong: 0,
    acc: 0,
    last: performance.now(),
    raf: 0,
    countdownT: 0,
    toastCooldown: 6,
    toastI: 0,
    toastHandle: null,
    trauma: 0,
    finishers: 0,
    celebrateT: 0,
    uiT: 0,
    running: true,
    raceTime: 0,
    lapClock: 0,
    lastLap: 0,
    bestLap: 0,
    hitstop: 0,
    skidStamp: 0,
    wasBoosting: false,
  };
  rt = r;
  fit(canvas);
  exposeDebug(r);
  r.raf = requestAnimationFrame(loop);

  const onVis = () => {
    if (document.hidden) return;
    unlockAudio();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    r.running = false;
    cancelAnimationFrame(r.raf);
    clearToastTimer(r);
    detachInput();
    disposeAudio();
    document.removeEventListener("visibilitychange", onVis);
    if (rt === r) rt = null;
    delete window.__controlsTest;
    delete window.__gameDebug;
  };
}

export const gameApi = {
  unlock: () => unlockAudio(),
  startRace: () => {
    if (!rt) return;
    unlockAudio();
    playUi();
    resetRace(rt);
    useGameUI.setState({
      screen: "countdown",
      countdown: 3,
      toast: null,
      lap: 1,
      position: FIELD_SIZE,
      pausedFrom: null,
      results: [],
      raceTime: 0,
      lapTime: 0,
      bestLap: 0,
      lastLap: 0,
    });
    playCountdown(3);
  },
  openAnniversary: () => {
    playUi();
    useGameUI.setState({ screen: "anniversary" });
  },
  openSettings: () => {
    playUi();
    useGameUI.setState({ screen: "settings" });
  },
  backToMenu: () => {
    playUi();
    useGameUI.setState({ screen: "menu", countdown: null, toast: null, pausedFrom: null });
  },
  pause: () => {
    const s = useGameUI.getState().screen;
    if (s !== "race" && s !== "countdown") return;
    playUi();
    useGameUI.setState({ screen: "paused", pausedFrom: s });
  },
  resume: () => {
    playUi();
    const from = useGameUI.getState().pausedFrom ?? "race";
    useGameUI.setState({ screen: from === "countdown" ? "countdown" : "race", pausedFrom: null });
  },
  toLetter: () => {
    playUi();
    useGameUI.setState({ screen: "letter" });
  },
  toVictory: () => {
    playUi();
    useGameUI.setState({ screen: "victory" });
  },
  toClosing: () => {
    playUi();
    useGameUI.setState({ screen: "closing" });
  },
  restartToMenu: () => {
    playUi();
    if (rt) {
      resetRace(rt);
      rt.flyAlong = 0;
    }
    useGameUI.setState({ screen: "menu", countdown: null, toast: null, pausedFrom: null, results: [] });
  },
  toggleAudio: () => {
    const on = !useGameUI.getState().audioOn;
    useGameUI.setState({ audioOn: on });
    savePrefs();
    unlockAudio();
  },
  setMusic: (v: boolean) => {
    useGameUI.setState({ musicOn: v });
    savePrefs();
  },
  setShake: (v: boolean) => {
    useGameUI.setState({ shakeOn: v });
    savePrefs();
  },
  setTouch: (v: boolean) => {
    useGameUI.setState({ forceTouch: v });
    savePrefs();
  },
  touch,
};

export function shouldShowTouch(): boolean {
  const s = useGameUI.getState();
  return s.forceTouch || isCoarsePointer();
}

export type { Screen };
