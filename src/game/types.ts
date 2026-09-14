export type Screen =
  | "menu"
  | "anniversary"
  | "settings"
  | "countdown"
  | "race"
  | "paused"
  | "celebration"
  | "victory"
  | "letter"
  | "closing";

export type Actions = {
  throttle: number;
  brake: number;
  steer: number;
  boost: boolean;
  pause: boolean;
  respawn: boolean;
};

export type TrackPoint = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
  dist: number;
  curv: number;
  halfW: number;
  ix: number;
  iy: number;
  ox: number;
  oy: number;
  rx: number;
  ry: number;
};

export type Billboard = {
  x: number;
  y: number;
  angle: number;
  text: string;
  w: number;
  h: number;
};

export type Tree = { x: number; y: number; r: number; shade: number };
export type Stand = {
  x: number;
  y: number;
  angle: number;
  w: number;
  d: number;
};
export type LightPole = { x: number; y: number };

export type Track = {
  name: string;
  pts: TrackPoint[];
  length: number;
  checkpoints: number[];
  startDist: number;
  startX: number;
  startY: number;
  startYaw: number;
  pit: { x1: number; y1: number; x2: number; y2: number }[];
  billboards: Billboard[];
  trees: Tree[];
  stands: Stand[];
  poles: LightPole[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  heart: { x: number; y: number; s: number };
};

export type Car = {
  id: number;
  name: string;
  color: string;
  accent: string;
  x: number;
  y: number;
  yaw: number;
  speed: number;
  lateral: number;
  vx: number;
  vy: number;
  boost: number;
  boosting: boolean;
  lap: number;
  nextCp: number;
  along: number;
  lastAlong: number;
  lastCpAlong: number;
  finished: boolean;
  finishPlace: number;
  isPlayer: boolean;
  aiSkill: number;
  aiOffset: number;
  aiLook: number;
  maxSpeed: number;
  flash: number;
  skid: number;
  rev: number;
  wrongWay: number;
  stuckT: number;
};

export type Standing = {
  name: string;
  place: number;
  isPlayer: boolean;
  finished: boolean;
};

export type HudSnapshot = {
  screen: Screen;
  position: number;
  field: number;
  lap: number;
  totalLaps: number;
  speed: number;
  boost: number;
  toast: string | null;
  countdown: number | "go" | null;
  finalPosition: number;
  audioOn: boolean;
  musicOn: boolean;
  shakeOn: boolean;
  forceTouch: boolean;
  wrongWay: boolean;
  standings: Standing[];
  results: Standing[];
  lapTime: number;
  bestLap: number;
  lastLap: number;
  raceTime: number;
  pausedFrom: Screen | null;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer: (v: number) => void;
  setKeys: (codes: string[]) => void;
};
