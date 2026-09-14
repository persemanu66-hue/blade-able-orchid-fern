import { create } from "zustand";
import type { HudSnapshot, Screen } from "./types";

export const TOTAL_LAPS = 3;
export const FIELD_SIZE = 6;

const initial: HudSnapshot = {
  screen: "menu",
  position: 6,
  field: FIELD_SIZE,
  lap: 1,
  totalLaps: TOTAL_LAPS,
  speed: 0,
  boost: 1,
  toast: null,
  countdown: null,
  finalPosition: 1,
  audioOn: true,
  musicOn: true,
  shakeOn: true,
  forceTouch: false,
  wrongWay: false,
  standings: [],
  results: [],
  lapTime: 0,
  bestLap: 0,
  lastLap: 0,
  raceTime: 0,
  pausedFrom: null,
};

export const useGameUI = create<HudSnapshot>(() => ({ ...initial }));

export function loadPrefs(): void {
  try {
    const raw = localStorage.getItem("bimba-racing-v1");
    if (!raw) return;
    const p = JSON.parse(raw) as Partial<HudSnapshot>;
    useGameUI.setState({
      audioOn: p.audioOn !== false,
      musicOn: p.musicOn !== false,
      shakeOn: p.shakeOn !== false,
      forceTouch: p.forceTouch === true,
    });
  } catch {
    /* ignore */
  }
}

export function savePrefs(): void {
  const s = useGameUI.getState();
  try {
    localStorage.setItem(
      "bimba-racing-v1",
      JSON.stringify({
        audioOn: s.audioOn,
        musicOn: s.musicOn,
        shakeOn: s.shakeOn,
        forceTouch: s.forceTouch,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function setScreen(screen: Screen): void {
  useGameUI.setState({ screen });
}

export function formatTime(t: number): string {
  if (t <= 0) return "0:00.00";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  const body = s.toFixed(2);
  return `${m}:${body.padStart(5, "0")}`;
}
