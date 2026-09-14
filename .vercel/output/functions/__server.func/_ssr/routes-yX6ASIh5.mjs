import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Heart, d as ChevronRight, f as ChevronLeft, i as Trophy, l as Gauge, n as VolumeX, o as Square, r as Volume2, s as Pause, t as Zap, u as Flag } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-yX6ASIh5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TAU = Math.PI * 2;
function clamp(v, a, b) {
	return v < a ? a : v > b ? b : v;
}
function expLerp(cur, target, k, dt) {
	return cur + (target - cur) * (1 - Math.exp(-k * dt));
}
function angNorm(a) {
	let x = a;
	while (x > Math.PI) x -= TAU;
	while (x < -Math.PI) x += TAU;
	return x;
}
/** yaw = 0 faces world +Y; +yaw is CCW; A (+steer) increases yaw → nose left. */
function forwardX(yaw) {
	return -Math.sin(yaw);
}
function forwardY(yaw) {
	return Math.cos(yaw);
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hash2(i, j) {
	let n = i * 374761393 + j * 668265263 | 0;
	n = n ^ n >>> 13 | 0;
	n = Math.imul(n, 1274126177);
	return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
var CONTROL = [
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
	[0, -250]
];
function catmull(p0, p1, p2, p3, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function sampleSpline(points, spacing) {
	const n = points.length;
	const dense = [];
	for (let i = 0; i < n; i++) {
		const p0 = points[(i - 1 + n) % n];
		const p1 = points[i];
		const p2 = points[(i + 1) % n];
		const p3 = points[(i + 2) % n];
		const est = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
		const steps = Math.max(4, Math.ceil(est / (spacing * .45)));
		for (let s = 0; s < steps; s++) {
			const t = s / steps;
			dense.push([catmull(p0[0], p1[0], p2[0], p3[0], t), catmull(p0[1], p1[1], p2[1], p3[1], t)]);
		}
	}
	const out = [];
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
function onTrack(x, y, raw, margin) {
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
var cached = null;
function getTrack() {
	if (cached) return cached;
	const raw = sampleSpline(CONTROL, 12);
	const n = raw.length;
	const pts = [];
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
		let da = Math.atan2(v2x, v2y) - Math.atan2(v1x, v1y);
		while (da > Math.PI) da -= Math.PI * 2;
		while (da < -Math.PI) da += Math.PI * 2;
		const curv = da / (Math.hypot(v2x, v2y) || 1);
		const halfW = 40 - 8 * clamp(Math.abs(curv) * 55, 0, 1);
		const inside = -Math.sign(curv || 1) * .28 * halfW;
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
			ry: cur[1] + ny * inside
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
	const checkpoints = [];
	for (let i = 0; i < cpCount; i++) checkpoints.push(i / cpCount * length);
	const billboards = [];
	for (const [u, text] of [
		[.08, "ELEONORA  ♥"],
		[.18, "BIMBA GP"],
		[.32, "1 YEAR  ♥"],
		[.46, "SEMPRE INSIEME"],
		[.58, "+365  ♥"],
		[.72, "FORZA BIMBA"],
		[.86, "POLE POSITION"]
	]) {
		const p = pointAtDist(pts, length, u * length);
		const side = -1;
		const off = p.halfW + 36;
		billboards.push({
			x: p.x + p.nx * side * off,
			y: p.y + p.ny * side * off,
			angle: Math.atan2(p.tx, p.ty) + Math.PI / 2,
			text,
			w: 18 + text.length * 6.2,
			h: 16
		});
	}
	const rng = mulberry32(365);
	const trees = [];
	for (let k = 0; k < 90; k++) {
		const p = pts[Math.floor(rng() * n)];
		const side = rng() > .35 ? -1 : 1;
		const dist = p.halfW + 48 + rng() * 90;
		const x = p.x + p.nx * side * dist + (rng() - .5) * 30;
		const y = p.y + p.ny * side * dist + (rng() - .5) * 30;
		if (onTrack(x, y, raw, p.halfW + 28)) continue;
		trees.push({
			x,
			y,
			r: 9 + rng() * 11,
			shade: .45 + rng() * .4
		});
	}
	const stands = [
		{
			x: -92,
			y: 40,
			angle: Math.PI / 2,
			w: 220,
			d: 38
		},
		{
			x: -92,
			y: 280,
			angle: Math.PI / 2,
			w: 180,
			d: 34
		},
		{
			x: 520,
			y: 760,
			angle: 0,
			w: 200,
			d: 32
		}
	];
	const poles = [];
	for (let i = 0; i < n; i += 14) {
		const p = pts[i];
		poles.push({
			x: p.x - p.nx * (p.halfW + 22),
			y: p.y - p.ny * (p.halfW + 22)
		});
	}
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	for (const p of pts) {
		minX = Math.min(minX, p.ox, p.ix);
		maxX = Math.max(maxX, p.ox, p.ix);
		minY = Math.min(minY, p.oy, p.iy);
		maxY = Math.max(maxY, p.oy, p.iy);
	}
	const pit = [];
	for (let i = 0; i < n; i++) {
		const p = pts[i];
		if (p.x > -30 && p.x < 40 && p.y > -200 && p.y < 320) pit.push({
			x1: p.x + p.nx * (p.halfW + 6),
			y1: p.y + p.ny * (p.halfW + 6),
			x2: p.x + p.nx * (p.halfW + 22),
			y2: p.y + p.ny * (p.halfW + 22)
		});
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
		heart: {
			x: 430,
			y: 40,
			s: 78
		}
	};
	return cached;
}
function pointAtDist(pts, length, dist) {
	const d = (dist % length + length) % length;
	let lo = 0;
	let hi = pts.length - 1;
	while (lo < hi) {
		const mid = lo + hi + 1 >> 1;
		if (pts[mid].dist <= d) lo = mid;
		else hi = mid - 1;
	}
	return pts[lo];
}
function projectOnTrack(track, x, y) {
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
	return {
		p: a,
		dist: Math.sqrt(bestD),
		along,
		side
	};
}
function crossedGate(prev, now, gate, len) {
	const dp = (now - prev + len) % len;
	if (dp <= 0 || dp > len * .45) return false;
	const dg = (gate - prev + len) % len;
	return dg > 0 && dg <= dp;
}
function aiActions(car, track, playerAlong, playerLap) {
	const off = projectOnTrack(track, car.x, car.y);
	const look = 70 + car.speed * .55 + car.aiLook;
	const wobble = Math.sin(off.along * .015 + car.id * 1.7) * 6 * (1 - car.aiSkill);
	const target = pointAtDist(track.pts, track.length, off.along + look);
	const lane = car.aiOffset * .22 + wobble;
	const aimX = target.rx + target.nx * lane;
	const aimY = target.ry + target.ny * lane;
	const steer = clamp(angNorm(Math.atan2(-(aimX - car.x), aimY - car.y) - car.yaw) * 1.55, -1, 1);
	let maxC = 0;
	for (let d = 30; d < 160; d += 18) {
		const q = pointAtDist(track.pts, track.length, off.along + d);
		maxC = Math.max(maxC, Math.abs(q.curv));
	}
	let want = car.maxSpeed * (1 - clamp(maxC * 42, 0, .62)) * car.aiSkill;
	want *= .9 + .12 * Math.sin(off.along * .02 + car.id);
	const gap = car.lap * track.length + off.along - (playerLap * track.length + playerAlong);
	if (gap > 180) want *= .88;
	if (gap > 420) want *= .78;
	if (gap > 700) want *= .72;
	if (gap < -220) want *= 1.07;
	if (gap < -480) want *= 1.12;
	const throttle = car.speed < want - 4 ? 1 : car.speed > want + 6 ? .15 : .7;
	const brake = car.speed > want + 12 || maxC > .018 && car.speed > want ? .55 : 0;
	const boost = maxC < .006 && car.speed > 50 && car.boost > .4 && car.id % 2 === 0;
	return {
		throttle: brake > .4 ? .2 : throttle,
		brake,
		steer,
		boost,
		pause: false,
		respawn: false
	};
}
var initial = {
	screen: "menu",
	position: 6,
	field: 6,
	lap: 1,
	totalLaps: 3,
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
	pausedFrom: null
};
var useGameUI = create(() => ({ ...initial }));
function loadPrefs() {
	try {
		const raw = localStorage.getItem("bimba-racing-v1");
		if (!raw) return;
		const p = JSON.parse(raw);
		useGameUI.setState({
			audioOn: p.audioOn !== false,
			musicOn: p.musicOn !== false,
			shakeOn: p.shakeOn !== false,
			forceTouch: p.forceTouch === true
		});
	} catch {}
}
function savePrefs() {
	const s = useGameUI.getState();
	try {
		localStorage.setItem("bimba-racing-v1", JSON.stringify({
			audioOn: s.audioOn,
			musicOn: s.musicOn,
			shakeOn: s.shakeOn,
			forceTouch: s.forceTouch
		}));
	} catch {}
}
function formatTime(t) {
	if (t <= 0) return "0:00.00";
	const m = Math.floor(t / 60);
	return `${m}:${(t - m * 60).toFixed(2).padStart(5, "0")}`;
}
var ctx = null;
var master = null;
var musicBus = null;
var sfxBus = null;
var engineOsc = null;
var engineGain = null;
var engineFilter = null;
var crowdGain = null;
var skidGain = null;
var musicTimer = null;
var musicStep = 0;
var unlocked = false;
var lastGear = 0;
var MENU_NOTES = [
	261.63,
	329.63,
	392,
	493.88,
	440,
	392,
	329.63,
	261.63
];
var RACE_NOTES = [
	196,
	246.94,
	293.66,
	246.94,
	220,
	196,
	174.61,
	196
];
var ROMANTIC = [
	261.63,
	329.63,
	392,
	523.25,
	493.88,
	392
];
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const C = window.AudioContext || window.webkitAudioContext;
		if (!C) return null;
		ctx = new C({ latencyHint: "interactive" });
		master = ctx.createGain();
		musicBus = ctx.createGain();
		sfxBus = ctx.createGain();
		musicBus.gain.value = .22;
		sfxBus.gain.value = .45;
		master.gain.value = .85;
		musicBus.connect(master);
		sfxBus.connect(master);
		master.connect(ctx.destination);
	}
	return ctx;
}
function unlockAudio() {
	const c = ac();
	if (!c) return;
	if (c.state === "suspended") c.resume();
	unlocked = true;
	ensureEngine();
	ensureCrowd();
	ensureSkid();
}
function ensureEngine() {
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
function ensureCrowd() {
	const c = ac();
	if (!c || !sfxBus || crowdGain) return;
	const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
	const data = buf.getChannelData(0);
	let last = 0;
	for (let i = 0; i < data.length; i++) {
		last = last * .96 + (Math.random() * 2 - 1) * .04;
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
function ensureSkid() {
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
function beep(freq, dur, vol = .3, type = "square") {
	const c = ac();
	if (!c || !sfxBus || !useGameUI.getState().audioOn) return;
	if (c.state === "suspended") return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = type;
	o.frequency.value = freq * (.97 + Math.random() * .06);
	g.gain.setValueAtTime(vol, c.currentTime);
	g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur);
	o.connect(g);
	g.connect(sfxBus);
	o.start();
	o.stop(c.currentTime + dur);
	o.onended = () => {
		o.disconnect();
		g.disconnect();
	};
}
function playCountdown(n) {
	if (n === "go") beep(1320, .35, .28, "triangle");
	else beep(780, .16, .22, "square");
}
function playCollision() {
	beep(90, .18, .35, "sawtooth");
}
function playFinish() {
	[
		523.25,
		659.25,
		783.99,
		1046.5
	].forEach((f, i) => {
		window.setTimeout(() => beep(f, .28, .22, "triangle"), i * 140);
	});
}
function playUi() {
	beep(660, .07, .12, "sine");
}
function updateAudio(opts) {
	const c = ac();
	if (!c || !master || !engineGain || !engineOsc || !engineFilter) return;
	const st = useGameUI.getState();
	const on = st.audioOn && unlocked;
	const now = c.currentTime;
	master.gain.setTargetAtTime(on ? .85 : 0, now, .04);
	if (musicBus) musicBus.gain.setTargetAtTime(st.musicOn && on ? .2 : 0, now, .08);
	const racing = opts.racing;
	const rpm = 50 + Math.abs(opts.speed) * 2.4 + (opts.boosting ? 40 : 0) + opts.throttle * 18;
	engineOsc.frequency.setTargetAtTime(rpm, now, .05);
	engineFilter.frequency.setTargetAtTime(500 + Math.abs(opts.speed) * 8 - (opts.braking ? 180 : 0), now, .08);
	const eg = racing && on ? clamp(.03 + opts.throttle * .08 + Math.abs(opts.speed) * .0012, 0, .14) : 0;
	engineGain.gain.setTargetAtTime(eg, now, .05);
	if (crowdGain) crowdGain.gain.setTargetAtTime(racing && on ? .035 + Math.abs(opts.speed) * 25e-5 : 0, now, .2);
	if (skidGain) {
		const sg = racing && on ? clamp(opts.skid * .07, 0, .08) : 0;
		skidGain.gain.setTargetAtTime(sg, now, .06);
	}
	const gear = Math.floor(Math.abs(opts.speed) / 14);
	if (racing && gear !== lastGear && opts.speed > 10) {
		lastGear = gear;
		beep(180 + gear * 20, .04, .08, "square");
	}
	tickMusic();
}
function tickMusic() {
	if (!ac() || !musicBus) return;
	if (musicTimer != null) return;
	const step = () => {
		const st = useGameUI.getState();
		const scr = st.screen;
		const isRace = scr === "race" || scr === "countdown";
		const isEnd = scr === "letter" || scr === "victory" || scr === "closing" || scr === "celebration";
		const interval = isEnd ? 520 : isRace ? 220 : 420;
		if (st.audioOn && st.musicOn && unlocked) {
			if (isEnd) tone(ROMANTIC[musicStep % ROMANTIC.length], .28, .05);
			else {
				const notes = isRace ? RACE_NOTES : MENU_NOTES;
				tone(notes[musicStep % notes.length], isRace ? .1 : .32, isRace ? .04 : .06);
			}
			musicStep += 1;
		}
		musicTimer = window.setTimeout(step, interval);
	};
	musicTimer = window.setTimeout(step, 80);
}
function tone(freq, dur, vol) {
	const c = ac();
	if (!c || !musicBus) return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = "sine";
	o.frequency.value = freq;
	g.gain.setValueAtTime(vol, c.currentTime);
	g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dur);
	o.connect(g);
	g.connect(musicBus);
	o.start();
	o.stop(c.currentTime + dur);
	o.onended = () => {
		o.disconnect();
		g.disconnect();
	};
}
function disposeAudio() {
	if (musicTimer != null) window.clearTimeout(musicTimer);
	musicTimer = null;
	try {
		engineOsc?.stop();
	} catch {}
	engineOsc = null;
	engineGain = null;
	engineFilter = null;
	crowdGain = null;
	skidGain = null;
	ctx?.close();
	ctx = null;
	master = null;
	musicBus = null;
	sfxBus = null;
	unlocked = false;
}
function stepCar(car, act, track, dt, canDrive) {
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
	const wantBoost = act.boost && car.boost > .08 && act.throttle > .2;
	car.boosting = wantBoost;
	if (wantBoost) car.boost = Math.max(0, car.boost - .28 * dt);
	else car.boost = Math.min(1, car.boost + .11 * dt);
	const cap = (car.boosting ? car.maxSpeed * 1.34 : car.maxSpeed) * (onTarmac ? 1 : .42);
	const accel = (car.isPlayer ? 64 : 54) * (car.boosting ? 1.45 : 1);
	const brakeF = car.isPlayer ? 90 : 78;
	if (act.throttle > 0) car.speed += accel * act.throttle * dt;
	if (act.brake > 0) {
		if (car.speed > 2) car.speed -= brakeF * act.brake * dt;
		else car.speed -= 28 * act.brake * dt;
	}
	const drag = (act.throttle > .1 ? .18 : .85) + (onTarmac ? 0 : 2.4);
	car.speed -= car.speed * drag * dt;
	if (car.speed > cap) car.speed += (cap - car.speed) * Math.min(1, 4 * dt);
	car.speed = clamp(car.speed, car.isPlayer ? -28 : -12, car.boosting ? 124 : cap + 4);
	const spd = Math.abs(car.speed);
	const speedFactor = clamp(spd / 26, 0, 1) * (1 - clamp(spd / 170, 0, .4));
	const reverse = car.speed >= 0 ? 1 : -1;
	const turnRate = (car.isPlayer ? 2.55 : 2.2) + (car.skid > .4 ? .35 : 0);
	car.yaw += act.steer * turnRate * speedFactor * reverse * dt;
	const grip = (onTarmac ? .92 : .55) - clamp(Math.abs(act.steer) * spd / 180, 0, .35) - (car.boosting ? .08 : 0);
	car.lateral += act.steer * spd * .22 * dt;
	car.lateral *= Math.pow(clamp(grip, .35, .96), dt * 60);
	car.skid = clamp(Math.abs(car.lateral) / 18, 0, 1);
	integrate(car, dt);
	if (!inRunoff) {
		const push = off.dist - (off.p.halfW + 16) + 2;
		const sx = Math.sign(off.side || 1);
		car.x -= off.p.nx * sx * push * .65;
		car.y -= off.p.ny * sx * push * .65;
		car.speed *= 1 - 2.2 * dt;
		car.flash = .25;
		car.lateral *= .4;
	}
	const fx = forwardX(car.yaw);
	const fy = forwardY(car.yaw);
	const alongDot = fx * off.p.tx + fy * off.p.ty;
	if (car.speed > 8 && alongDot < -.35) car.wrongWay += dt;
	else car.wrongWay = Math.max(0, car.wrongWay - dt * 2);
	if (!onTarmac && spd < 6) car.stuckT += dt;
	else if (spd < 1.2 && act.throttle < .1) car.stuckT += dt * .45;
	else car.stuckT = 0;
	car.flash = Math.max(0, car.flash - dt);
	car.rev = clamp(Math.abs(car.speed) / (car.maxSpeed + 10) + (car.boosting ? .2 : 0), 0, 1.2);
}
function integrate(car, dt) {
	const fx = forwardX(car.yaw);
	const fy = forwardY(car.yaw);
	const rx = fy;
	const ry = -fx;
	car.vx = fx * car.speed + rx * car.lateral;
	car.vy = fy * car.speed + ry * car.lateral;
	car.x += car.vx * dt;
	car.y += car.vy * dt;
}
function constrain(car, track, dt) {
	const off = projectOnTrack(track, car.x, car.y);
	if (off.dist > off.p.halfW + 18) {
		const push = off.dist - (off.p.halfW + 16);
		const sx = Math.sign(off.side || 1);
		car.x -= off.p.nx * sx * push * .8;
		car.y -= off.p.ny * sx * push * .8;
		car.speed *= 1 - 1.4 * dt;
	}
}
function idleCar(car, dt) {
	car.speed *= 1 - 4 * dt;
	car.lateral *= 1 - 6 * dt;
	car.boosting = false;
}
function respawnCar(car, track) {
	const p = pointAtDist(track.pts, track.length, car.lastCpAlong);
	const lane = car.isPlayer ? 0 : car.aiOffset * .35;
	car.x = p.x + p.nx * lane;
	car.y = p.y + p.ny * lane;
	car.yaw = Math.atan2(-p.tx, p.ty);
	car.speed = car.isPlayer ? 22 : 18;
	car.lateral = 0;
	car.vx = 0;
	car.vy = 0;
	car.stuckT = 0;
	car.wrongWay = 0;
	car.flash = .4;
	car.boosting = false;
	car.along = p.dist;
	car.lastAlong = p.dist;
}
function makeCar(partial) {
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
		rev: .2,
		wrongWay: 0,
		stuckT: 0,
		...partial
	};
}
var GAME_CODES = /* @__PURE__ */ new Set([
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
	"KeyR"
]);
var keys = /* @__PURE__ */ new Set();
var injectedKeys = null;
var injectedSteer = null;
var touch = {
	throttle: 0,
	brake: 0,
	steer: 0,
	boost: false
};
var pauseEdge = false;
var prevPause = false;
var prevRespawn = false;
function onKeyDown(e) {
	if (GAME_CODES.has(e.code)) e.preventDefault();
	keys.add(e.code);
}
function onKeyUp(e) {
	keys.delete(e.code);
}
function onBlur() {
	keys.clear();
}
function attachInput() {
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", onBlur);
	document.addEventListener("visibilitychange", onBlur);
}
function detachInput() {
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
function setInjectedKeys(codes) {
	injectedKeys = codes.length ? new Set(codes) : null;
}
function setInjectedSteer(v) {
	injectedSteer = v;
}
function readActions() {
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
	if (pads) for (const pad of pads) {
		if (!pad) continue;
		const ax = pad.axes[0] ?? 0;
		if (Math.abs(ax) > .18) {
			const v = (Math.abs(ax) - .18) / .82 * Math.sign(-ax);
			steer += v;
		}
		const rt = pad.buttons[7]?.value ?? 0;
		const lt = pad.buttons[6]?.value ?? 0;
		if (rt > .05) throttle = Math.max(throttle, rt);
		if (lt > .05) brake = Math.max(brake, lt);
		if (pad.buttons[0]?.pressed) boost = true;
		if (pad.buttons[9]?.pressed) pauseEdge = true;
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
		respawn
	};
}
function isCoarsePointer() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(pointer: coarse)").matches;
}
var POOL = 360;
var pool = [];
var cursor = 0;
var SKID_POOL = 240;
var skids = [];
var skidCursor = 0;
function slot() {
	if (pool.length < POOL) {
		const p = {
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
			b: 255
		};
		pool.push(p);
		return p;
	}
	const p = pool[cursor];
	cursor = (cursor + 1) % POOL;
	return p;
}
function spawn(kind, x, y, vx, vy, opts) {
	const p = slot();
	p.alive = true;
	p.kind = kind;
	p.x = x;
	p.y = y;
	p.vx = vx;
	p.vy = vy;
	p.life = opts?.max ?? .7;
	p.max = p.life;
	p.size = opts?.size ?? 3;
	p.rot = opts?.rot ?? 0;
	p.vr = opts?.vr ?? 0;
	p.r = opts?.r ?? 255;
	p.g = opts?.g ?? 80;
	p.b = opts?.b ?? 90;
}
function burstHearts(x, y, n = 10) {
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = 18 + Math.random() * 40;
		spawn("heart", x, y, Math.cos(a) * s, Math.sin(a) * s, {
			size: 5 + Math.random() * 7,
			max: 1.1 + Math.random() * .7,
			r: 208,
			g: 18,
			b: 45,
			vr: (Math.random() - .5) * 4
		});
	}
}
function burstConfetti(x, y, n = 40) {
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = 40 + Math.random() * 90;
		const red = Math.random() > .45;
		spawn("confetti", x, y, Math.cos(a) * s, Math.sin(a) * s + 20, {
			size: 3 + Math.random() * 4,
			max: 1.6 + Math.random(),
			r: red ? 208 : 244,
			g: red ? 18 : 241,
			b: red ? 45 : 238,
			vr: (Math.random() - .5) * 8
		});
	}
}
function stampSkid(x, y, yaw, strength) {
	if (skids.length < SKID_POOL) {
		skids.push({
			alive: true,
			x,
			y,
			yaw,
			life: .9 + strength * .5,
			w: 1.1 + strength
		});
		return;
	}
	const m = skids[skidCursor];
	skidCursor = (skidCursor + 1) % SKID_POOL;
	m.alive = true;
	m.x = x;
	m.y = y;
	m.yaw = yaw;
	m.life = .9 + strength * .5;
	m.w = 1.1 + strength;
}
function stepParticles(dt) {
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
		p.vx *= 1 - .8 * dt;
		p.vy *= 1 - .8 * dt;
		p.rot += p.vr * dt;
	}
	for (const m of skids) {
		if (!m.alive) continue;
		m.life -= dt * .12;
		if (m.life <= 0) m.alive = false;
	}
}
function eachParticle(fn) {
	for (const p of pool) if (p.alive) fn(p);
}
function eachSkid(fn) {
	for (const m of skids) if (m.alive) fn(m);
}
function clearParticles() {
	for (const p of pool) p.alive = false;
	for (const m of skids) m.alive = false;
}
var baked = null;
var bakeOrigin = {
	left: 0,
	top: 0,
	scale: 1
};
function bakeWorld(track) {
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
	ctx.setTransform(scale, 0, 0, -1.15, -left * scale, top * scale);
	ctx.fillStyle = "#0c1410";
	ctx.fillRect(left, bottom, worldW, worldH);
	for (let i = 0; i < 1400; i++) {
		const x = left + hash2(i, 3) * worldW;
		const y = bottom + hash2(i, 9) * worldH;
		ctx.fillStyle = `rgba(18, 40, 24, ${.15 + hash2(i, 1) * .35})`;
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
		const r = .15 + hash2(i, 12) * .7;
		ctx.beginPath();
		ctx.arc(Math.cos(a) * r * .55, .15 + Math.sin(a) * r * .5, .035, 0, Math.PI * 2);
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
		if (Math.abs(p.curv) < .008) continue;
		const n = pts[(i + 1) % pts.length];
		ctx.strokeStyle = i % 2 === 0 ? "#d0122d" : "#f4f1ee";
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
		ctx.rotate(-.05);
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
		for (let row = 0; row < 4; row++) for (let col = 0; col < 28; col++) {
			ctx.fillStyle = hash2(row, col + Math.floor(st.x)) > .35 ? `rgba(255, ${180 + col % 3 * 20}, 190, 0.7)` : "rgba(40,40,48,0.8)";
			ctx.fillRect(-st.w / 2 + 6 + col * (st.w - 12) / 28, 4 + row * 6, 3.2, 3.2);
		}
		ctx.restore();
	}
	for (const t of track.trees) {
		ctx.fillStyle = "rgba(0,0,0,0.28)";
		ctx.beginPath();
		ctx.ellipse(t.x + 3, t.y - 2, t.r * .9, t.r * .55, .4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = `rgb(${10 + t.shade * 20}, ${36 + t.shade * 40}, ${16 + t.shade * 18})`;
		ctx.beginPath();
		ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = `rgb(${16 + t.shade * 24}, ${52 + t.shade * 36}, 22)`;
		ctx.beginPath();
		ctx.arc(t.x - t.r * .25, t.y + t.r * .2, t.r * .55, 0, Math.PI * 2);
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
	bakeOrigin = {
		left,
		top,
		scale
	};
}
function heartPath(ctx) {
	ctx.beginPath();
	ctx.moveTo(0, .25);
	ctx.bezierCurveTo(0, -.15, -.55, -.15, -.55, .22);
	ctx.bezierCurveTo(-.55, .5, 0, .72, 0, .95);
	ctx.bezierCurveTo(0, .72, .55, .5, .55, .22);
	ctx.bezierCurveTo(.55, -.15, 0, -.15, 0, .25);
}
function applyCamera(ctx, cam, w, h, carY = .6) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.translate(w / 2 + cam.shakeX, h * carY + cam.shakeY);
	ctx.rotate(-cam.yaw);
	ctx.scale(cam.zoom, -cam.zoom);
	ctx.translate(-cam.x, -cam.y);
}
function drawWorld(ctx, track) {
	if (!baked) bakeWorld(track);
	if (!baked) return;
	const { left, top, scale } = bakeOrigin;
	ctx.save();
	ctx.translate(left, top);
	ctx.scale(1 / scale, -1 / scale);
	ctx.drawImage(baked, 0, 0);
	ctx.restore();
}
function drawHeart(ctx, x, y, s) {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, -s);
	ctx.beginPath();
	ctx.moveTo(0, .25);
	ctx.bezierCurveTo(0, -.2, -.6, -.2, -.6, .22);
	ctx.bezierCurveTo(-.6, .52, 0, .78, 0, 1);
	ctx.bezierCurveTo(0, .78, .6, .52, .6, .22);
	ctx.bezierCurveTo(.6, -.2, 0, -.2, 0, .25);
	ctx.fill();
	ctx.restore();
}
function drawSkids(ctx) {
	eachSkid((m) => {
		ctx.save();
		ctx.translate(m.x, m.y);
		ctx.rotate(m.yaw);
		ctx.globalAlpha = clamp(m.life * .35, 0, .4);
		ctx.fillStyle = "#0a0a0c";
		ctx.fillRect(-1.1, -2.2, m.w, 4.4);
		ctx.fillRect(1.1 - m.w, -2.2, m.w, 4.4);
		ctx.restore();
	});
	ctx.globalAlpha = 1;
}
function drawCar(ctx, car, lights = true) {
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
	roundedRect(ctx, -5.4, 5.2, 3.2, 5.4, .8);
	roundedRect(ctx, 2.2, 5.2, 3.2, 5.4, .8);
	roundedRect(ctx, -5.6, -9.4, 3.4, 5.6, .8);
	roundedRect(ctx, 2.2, -9.4, 3.4, 5.6, .8);
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
	ctx.lineWidth = .55;
	ctx.beginPath();
	ctx.arc(0, .4, 1.9, Math.PI * .15, Math.PI * .85);
	ctx.stroke();
	ctx.fillStyle = "#d8dbe2";
	ctx.fillRect(-5.2, 10.6, 10.4, 1.5);
	ctx.fillStyle = car.accent;
	ctx.fillRect(-4.4, -12.6, 8.8, 1.8);
	ctx.fillRect(-.45, -14.2, .9, 1.8);
	ctx.fillStyle = "#ffdca8";
	ctx.beginPath();
	ctx.arc(-1.5, 11.2, .55, 0, Math.PI * 2);
	ctx.arc(1.5, 11.2, .55, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#d0122d";
	ctx.beginPath();
	ctx.arc(-1.6, -11.8, .5, 0, Math.PI * 2);
	ctx.arc(1.6, -11.8, .5, 0, Math.PI * 2);
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
		ctx.moveTo(-.8, -12.5);
		ctx.lineTo(0, -16);
		ctx.lineTo(.8, -12.5);
		ctx.fill();
	}
	if (car.flash > 0) {
		ctx.fillStyle = `rgba(255,255,255,${car.flash * .45})`;
		ctx.fillRect(-6, -14, 12, 28);
	}
	ctx.restore();
}
function roundedRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
	ctx.fill();
}
function drawParticles(ctx) {
	eachParticle((p) => {
		const a = clamp(p.life / p.max, 0, 1);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(p.rot);
		ctx.globalAlpha = a;
		ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
		if (p.kind === "heart") drawHeart(ctx, 0, 0, p.size * .35);
		else if (p.kind === "confetti") ctx.fillRect(-p.size * .5, -p.size * .2, p.size, p.size * .4);
		else {
			ctx.beginPath();
			ctx.arc(0, 0, p.size, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	});
	ctx.globalAlpha = 1;
}
function drawMinimap(ctx, track, cars, x, y, size) {
	const tw = track.maxX - track.minX;
	const th = track.maxY - track.minY;
	const sc = (size - 16) / Math.max(tw, th);
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = .92;
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
function drawSpeedVignette(ctx, w, h, speed, boosting) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	const g = ctx.createRadialGradient(w / 2, h * .6, h * .2, w / 2, h * .6, h * .85);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(1, `rgba(0,0,0,${.28 + clamp(speed / 400, 0, .25)})`);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
	if (boosting) {
		ctx.fillStyle = "rgba(208,18,45,0.08)";
		ctx.fillRect(0, 0, w, h);
	}
}
function drawFinishFlash(ctx, w, h, t) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	const a = clamp(1 - t / 1.1, 0, 1);
	if (a <= 0) return;
	ctx.fillStyle = `rgba(244,241,238,${a * .22})`;
	ctx.fillRect(0, 0, w, h);
}
var OPPONENTS = [
	{
		name: "Bimba Racing",
		color: "#b91c1c",
		accent: "#f4f1ee",
		skill: .88,
		max: 84,
		look: 8
	},
	{
		name: "Love GP",
		color: "#e8e4dc",
		accent: "#d0122d",
		skill: .82,
		max: 81,
		look: 4
	},
	{
		name: "Heart Racing",
		color: "#9f1239",
		accent: "#f4f1ee",
		skill: .78,
		max: 79,
		look: 10
	},
	{
		name: "Red Heart Motorsport",
		color: "#7f1d1d",
		accent: "#d0122d",
		skill: .74,
		max: 77,
		look: 2
	},
	{
		name: "Forever GP",
		color: "#292524",
		accent: "#d0122d",
		skill: .7,
		max: 75,
		look: 12
	}
];
var TOASTS = [
	"Forza Bimba",
	"Un altro giro insieme.",
	"Sei la mia pole position",
	"Sempre al tuo fianco.",
	"+1 anno insieme",
	"Non mollare, Bimba."
];
var rt = null;
var EMPTY_ACT = {
	throttle: 0,
	brake: 0,
	steer: 0,
	boost: false,
	pause: false,
	respawn: false
};
function placeOnGrid(track, slot) {
	const row = Math.floor(slot / 2);
	const col = slot % 2 === 0 ? -1 : 1;
	const along = track.length - 22 - row * 24;
	const p = pointAtDist(track.pts, track.length, along);
	return {
		x: p.x + p.nx * col * 7,
		y: p.y + p.ny * col * 7,
		yaw: Math.atan2(-p.tx, p.ty),
		along
	};
}
function createCars(track) {
	const cars = [];
	for (let i = 0; i < OPPONENTS.length; i++) {
		const o = OPPONENTS[i];
		const g = placeOnGrid(track, i);
		cars.push(makeCar({
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
			lastCpAlong: g.along
		}));
	}
	const g = placeOnGrid(track, 5);
	cars.push(makeCar({
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
		lastCpAlong: g.along
	}));
	return cars;
}
function clearToastTimer(r) {
	if (r.toastHandle != null) {
		window.clearTimeout(r.toastHandle);
		r.toastHandle = null;
	}
}
function resetRace(r) {
	r.cars = createCars(r.track);
	r.player = r.cars.find((c) => c.isPlayer);
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
function progressOf(car, track) {
	return car.lap * track.length + car.along;
}
function racePosition(r, car) {
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
		if (progressOf(o, r.track) > mine + .5) pos += 1;
	}
	return pos;
}
function standingsOf(r) {
	return r.cars.map((c) => ({
		name: c.name,
		place: racePosition(r, c),
		isPlayer: c.isPlayer,
		finished: c.finished
	})).sort((a, b) => a.place - b.place);
}
function updateCheckpoints(r, car) {
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
				if (car.lap <= 3) pushToast(r, `Giro ${car.lap}`);
			}
			if (car.lap > 3) {
				car.lap = 3;
				car.finished = true;
				r.finishers += 1;
				car.finishPlace = r.finishers;
				if (car.isPlayer) beginCelebration(r);
				break;
			}
		} else car.nextCp = (next + 1) % cps.length;
	}
}
function beginCelebration(r) {
	burstConfetti(r.player.x, r.player.y, 55);
	burstHearts(r.player.x, r.player.y, 18);
	playFinish();
	r.celebrateT = 0;
	r.trauma = .45;
	const results = standingsOf(r);
	useGameUI.setState({
		screen: "celebration",
		finalPosition: racePosition(r, r.player),
		countdown: null,
		results,
		toast: null
	});
}
function pushToast(r, text) {
	clearToastTimer(r);
	r.toastCooldown = 2.4;
	useGameUI.setState({ toast: text });
	r.toastHandle = window.setTimeout(() => {
		r.toastHandle = null;
		if (useGameUI.getState().toast === text) useGameUI.setState({ toast: null });
	}, 2400);
}
function collideCars(r) {
	const cars = r.cars;
	for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) {
		const a = cars[i];
		const b = cars[j];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const d2 = dx * dx + dy * dy;
		const rad = 11;
		if (d2 > 121 || d2 < .001) continue;
		const d = Math.sqrt(d2);
		const nx = dx / d;
		const ny = dy / d;
		const pen = rad - d;
		a.x -= nx * pen * .5;
		a.y -= ny * pen * .5;
		b.x += nx * pen * .5;
		b.y += ny * pen * .5;
		a.speed *= .88;
		b.speed *= .88;
		a.flash = .15;
		b.flash = .15;
		if (a.isPlayer || b.isPlayer) {
			r.trauma = Math.max(r.trauma, .28);
			r.hitstop = Math.max(r.hitstop, 2);
			playCollision();
		}
	}
}
function updateCam(r, dt, chasing, cinematic) {
	const fx = forwardX(chasing.yaw);
	const fy = forwardY(chasing.yaw);
	const look = cinematic ? 40 : 18 + Math.abs(chasing.speed) * .22;
	const tx = chasing.x + fx * look;
	const ty = chasing.y + fy * look;
	r.cam.x = expLerp(r.cam.x, tx, cinematic ? 1.6 : 6.5, dt);
	r.cam.y = expLerp(r.cam.y, ty, cinematic ? 1.6 : 6.5, dt);
	r.cam.yaw = r.cam.yaw + angNorm(chasing.yaw - r.cam.yaw) * (1 - Math.exp(-(cinematic ? 2.2 : 8) * dt));
	const zWant = cinematic ? 3.4 : 5.4 - clamp(Math.abs(chasing.speed) / 140, 0, 1.1) - (chasing.boosting ? .25 : 0);
	r.cam.zoom = expLerp(r.cam.zoom, zWant, 3.2, dt);
	const s = useGameUI.getState().shakeOn ? r.trauma * r.trauma : 0;
	r.cam.shakeX = (Math.random() - .5) * s * 14;
	r.cam.shakeY = (Math.random() - .5) * s * 14;
	r.trauma = Math.max(0, r.trauma - dt * 1.6);
}
function maybeRespawn(r, car, forced) {
	if (car.finished) return;
	if (!forced && car.stuckT < 2.4 && car.wrongWay < 3.2) return;
	respawnCar(car, r.track);
	if (car.isPlayer) pushToast(r, "Riparti dal punto di controllo");
}
function update(r, dt) {
	const screen = useGameUI.getState().screen;
	const act = readActions();
	if (act.pause && (screen === "race" || screen === "countdown")) {
		useGameUI.setState({
			screen: "paused",
			pausedFrom: screen
		});
		playUi();
	} else if (act.pause && screen === "paused") {
		const from = useGameUI.getState().pausedFrom ?? "race";
		useGameUI.setState({
			screen: from === "countdown" ? "countdown" : "race",
			pausedFrom: null
		});
	}
	if (screen === "menu" || screen === "anniversary" || screen === "settings") {
		r.flyAlong = (r.flyAlong + dt * 42) % r.track.length;
		const p = pointAtDist(r.track.pts, r.track.length, r.flyAlong);
		updateCam(r, dt, {
			...r.player,
			x: p.x,
			y: p.y,
			yaw: Math.atan2(-p.tx, p.ty),
			speed: 40,
			boosting: false
		}, true);
		stepParticles(dt);
		updateAudio({
			screen,
			speed: 20,
			throttle: .2,
			boosting: false,
			racing: false,
			skid: 0,
			braking: false
		});
		return;
	}
	const racing = screen === "race";
	const counting = screen === "countdown";
	const paused = screen === "paused";
	const celebrating = screen === "celebration" || screen === "victory" || screen === "letter" || screen === "closing";
	if (counting) {
		r.countdownT += dt;
		const slot = Math.floor(r.countdownT);
		const cur = [
			3,
			2,
			1,
			"go"
		][Math.min(slot, 3)];
		if (useGameUI.getState().countdown !== cur) {
			useGameUI.setState({ countdown: cur });
			playCountdown(cur);
		}
		if (r.countdownT >= 3.85) {
			useGameUI.setState({
				screen: "race",
				countdown: null
			});
			burstHearts(r.player.x, r.player.y, 6);
		}
	}
	if (!paused) {
		const playerAct = racing || screen === "celebration" ? act : EMPTY_ACT;
		for (const car of r.cars) {
			const a = car.isPlayer ? playerAct : racing ? aiActions(car, r.track, r.player.along, r.player.lap) : EMPTY_ACT;
			const canDrive = car.isPlayer ? racing || screen === "celebration" : racing;
			if (counting) idleCar(car, dt);
			else stepCar(car, a, r.track, dt, canDrive);
			car.along = projectOnTrack(r.track, car.x, car.y).along;
			if (racing || screen === "celebration") updateCheckpoints(r, car);
			if (racing && car.isPlayer && (act.respawn || car.stuckT > 2.4 || car.wrongWay > 3.2)) maybeRespawn(r, car, act.respawn);
			if (car.skid > .45 && Math.random() < .6) spawn("smoke", car.x, car.y, -car.vx * .1, -car.vy * .1, {
				size: 2.5,
				max: .5,
				r: 80,
				g: 80,
				b: 86
			});
			if (car.skid > .42) {
				r.skidStamp += dt;
				if (r.skidStamp > .04) {
					r.skidStamp = 0;
					stampSkid(car.x, car.y, car.yaw, car.skid);
				}
			}
			if (car.isPlayer && car.boosting && !r.wasBoosting) burstHearts(car.x, car.y, 3);
			if (car.isPlayer && car.boosting && Math.random() < .5) spawn("spark", car.x, car.y, (Math.random() - .5) * 20, (Math.random() - .5) * 20, {
				size: 2,
				max: .35,
				r: 255,
				g: 90,
				b: 70
			});
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
			if (Math.random() < .35) burstConfetti(r.player.x + (Math.random() - .5) * 40, r.player.y + 20, 3);
			if (Math.random() < .2) burstHearts(r.player.x, r.player.y, 1);
		}
		if (r.celebrateT > 3.2 && screen === "celebration") useGameUI.setState({ screen: "victory" });
	}
	updateCam(r, dt, r.player, celebrating);
	updateAudio({
		screen,
		speed: r.player.speed,
		throttle: act.throttle,
		boosting: r.player.boosting,
		racing: racing || counting,
		skid: r.player.skid,
		braking: act.brake > .2
	});
	r.uiT += dt;
	if (r.uiT > .08) {
		r.uiT = 0;
		useGameUI.setState({
			position: racePosition(r, r.player),
			lap: clamp(r.player.lap, 1, 3),
			speed: Math.round(Math.abs(r.player.speed) * 2.35),
			boost: r.player.boost,
			wrongWay: r.player.wrongWay > .7,
			standings: racing || counting || paused ? standingsOf(r) : useGameUI.getState().standings,
			lapTime: r.lapClock,
			bestLap: r.bestLap,
			lastLap: r.lastLap,
			raceTime: r.raceTime
		});
	}
}
function draw(r) {
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
	applyCamera(ctx, cam, w, h, mobile ? .5 : .6);
	drawWorld(ctx, track);
	drawSkids(ctx);
	drawParticles(ctx);
	const sorted = [...cars].sort((a, b) => a.y - b.y);
	for (const c of sorted) drawCar(ctx, c, true);
	drawSpeedVignette(ctx, w, h, r.player.speed, r.player.boosting);
	if (screen === "celebration") drawFinishFlash(ctx, w, h, r.celebrateT);
	if (screen === "race" || screen === "countdown" || screen === "paused") {
		const pad = 16 * dpr;
		const mm = Math.min(148, canvas.clientWidth * .3) * dpr;
		const topOff = 108 * dpr;
		drawMinimap(ctx, track, cars, w - mm - pad, pad + topOff, mm);
	}
}
function fit(canvas) {
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const w = Math.max(1, canvas.clientWidth);
	const h = Math.max(1, canvas.clientHeight);
	const pw = Math.floor(w * dpr);
	const ph = Math.floor(h * dpr);
	if (canvas.width !== pw) canvas.width = pw;
	if (canvas.height !== ph) canvas.height = ph;
}
function loop(now) {
	const r = rt;
	if (!r || !r.running) return;
	r.raf = requestAnimationFrame(loop);
	let dt = (now - r.last) / 1e3;
	r.last = now;
	if (dt > .1) dt = .1;
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
function exposeDebug(r) {
	window.__controlsTest = {
		getYaw: () => r.player.yaw,
		getSpeed: () => r.player.speed,
		setSteer: (v) => setInjectedSteer(v),
		setKeys: (codes) => setInjectedKeys(codes)
	};
	window.__gameDebug = {
		finishRace: () => {
			r.player.lap = 3;
			r.player.nextCp = 0;
			r.player.along = 2;
			r.player.lastAlong = r.track.length - 4;
			r.player.finished = false;
			updateCheckpoints(r, r.player);
		},
		skipCountdown: () => {
			useGameUI.setState({
				screen: "race",
				countdown: null
			});
		},
		getHud: () => useGameUI.getState(),
		getPlayer: () => ({
			x: r.player.x,
			y: r.player.y,
			yaw: r.player.yaw,
			speed: r.player.speed
		})
	};
}
function mountGame(canvas) {
	const ctx = canvas.getContext("2d", {
		alpha: false,
		desynchronized: true
	});
	if (!ctx) return () => {};
	loadPrefs();
	const track = getTrack();
	bakeWorld(track);
	attachInput();
	const cars = createCars(track);
	const player = cars.find((c) => c.isPlayer);
	const r = {
		canvas,
		ctx,
		track,
		cars,
		player,
		cam: {
			x: player.x,
			y: player.y,
			yaw: player.yaw,
			zoom: 3.6,
			shakeX: 0,
			shakeY: 0
		},
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
		wasBoosting: false
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
var gameApi = {
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
			position: 6,
			pausedFrom: null,
			results: [],
			raceTime: 0,
			lapTime: 0,
			bestLap: 0,
			lastLap: 0
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
		useGameUI.setState({
			screen: "menu",
			countdown: null,
			toast: null,
			pausedFrom: null
		});
	},
	pause: () => {
		const s = useGameUI.getState().screen;
		if (s !== "race" && s !== "countdown") return;
		playUi();
		useGameUI.setState({
			screen: "paused",
			pausedFrom: s
		});
	},
	resume: () => {
		playUi();
		const from = useGameUI.getState().pausedFrom ?? "race";
		useGameUI.setState({
			screen: from === "countdown" ? "countdown" : "race",
			pausedFrom: null
		});
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
		useGameUI.setState({
			screen: "menu",
			countdown: null,
			toast: null,
			pausedFrom: null,
			results: []
		});
	},
	toggleAudio: () => {
		const on = !useGameUI.getState().audioOn;
		useGameUI.setState({ audioOn: on });
		savePrefs();
		unlockAudio();
	},
	setMusic: (v) => {
		useGameUI.setState({ musicOn: v });
		savePrefs();
	},
	setShake: (v) => {
		useGameUI.setState({ shakeOn: v });
		savePrefs();
	},
	setTouch: (v) => {
		useGameUI.setState({ forceTouch: v });
		savePrefs();
	},
	touch
};
function shouldShowTouch() {
	return useGameUI.getState().forceTouch || isCoarsePointer();
}
function bindHold(onDown, onUp) {
	return {
		onPointerDown: (e) => {
			e.preventDefault();
			onDown(e);
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		onPointerUp: onUp,
		onPointerCancel: onUp,
		onLostPointerCapture: onUp
	};
}
function TouchPad() {
	const t = gameApi.touch;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] sm:px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Sinistra",
				className: "flex size-16 items-center justify-center rounded-lg border border-fog/20 bg-ink/70 text-fog backdrop-blur-sm",
				...bindHold(() => {
					t.steer = 1;
				}, () => {
					if (t.steer > 0) t.steer = 0;
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-7",
					strokeWidth: 2.2
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Destra",
				className: "flex size-16 items-center justify-center rounded-lg border border-fog/20 bg-ink/70 text-fog backdrop-blur-sm",
				...bindHold(() => {
					t.steer = -1;
				}, () => {
					if (t.steer < 0) t.steer = 0;
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
					className: "size-7",
					strokeWidth: 2.2
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex flex-col items-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": "Boost",
				className: "flex h-12 items-center gap-1.5 rounded-lg border border-racing/40 bg-racing/85 px-4 font-display text-sm font-bold tracking-[0.18em] text-fog uppercase",
				...bindHold(() => {
					t.boost = true;
				}, () => {
					t.boost = false;
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), "Boost"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": "Freno",
					className: "flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-lg border border-fog/20 bg-ink/70 font-display text-[10px] font-bold tracking-widest text-fog uppercase",
					...bindHold(() => {
						t.brake = 1;
					}, () => {
						t.brake = 0;
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4 fill-fog" }), "Freno"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-label": "Acceleratore",
					className: "flex h-16 w-[4.6rem] flex-col items-center justify-center gap-0.5 rounded-lg bg-fog font-display text-[10px] font-bold tracking-widest text-ink uppercase",
					...bindHold(() => {
						t.throttle = 1;
					}, () => {
						t.throttle = 0;
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-5" }), "Gas"]
				})]
			})]
		})]
	});
}
var LETTER = [
	"Bimba, questo è solo un piccolo gioco, ma dietro ci ho messo tutto il mio cuore.",
	"È passato un anno da quando abbiamo iniziato questo viaggio insieme e, proprio come in una gara, ci sono stati rettilinei, curve, momenti facili e momenti più difficili.",
	"Ma la cosa più bella è che li abbiamo vissuti insieme.",
	"Se potessi scegliere ancora una volta con chi iniziare questa gara, sceglierei sempre te.",
	"Buon primo anniversario amore mio.",
	"E ricordati una cosa...",
	"questa gara non finisce al traguardo.",
	"Voglio continuare a fare tutti i prossimi giri insieme a te.",
	"Ti amo, Bimba."
];
function AudioBtn() {
	const on = useGameUI((s) => s.audioOn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": on ? "Disattiva audio" : "Attiva audio",
		onClick: () => gameApi.toggleAudio(),
		className: "flex size-11 items-center justify-center rounded-full border border-fog/15 bg-ink/55 text-fog backdrop-blur-sm",
		children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" })
	});
}
function Menu() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0 flex items-stretch",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex w-full max-w-xl flex-col justify-end bg-gradient-to-r from-ink via-ink/88 to-ink/10 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:justify-center sm:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "panel-enter flex items-center gap-2 font-sans text-sm tracking-[0.22em] text-mist uppercase",
					children: ["Per la mia Bimba", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "panel-enter stagger-1 mt-3 font-display text-5xl leading-[0.9] font-extrabold tracking-tight text-fog sm:text-7xl",
					children: [
						"F1: BIMBA",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-racing",
							children: "RACING"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "panel-enter stagger-2 mt-4 font-display text-xl tracking-[0.14em] text-fog/80 uppercase",
					children: "Il nostro primo anno insieme"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "panel-enter stagger-3 mt-5 max-w-md font-sans text-sm leading-relaxed text-mist",
					children: "365 giorni, migliaia di ricordi e ancora tantissimi giri da fare insieme."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-enter stagger-4 mt-8 flex w-full max-w-sm flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => gameApi.startRace(),
							className: "flex items-center justify-center gap-2 rounded-lg bg-fog px-5 py-3.5 text-center font-display text-lg font-bold tracking-[0.18em] text-ink uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), "Inizia la gara"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => gameApi.openAnniversary(),
							className: "flex items-center justify-center gap-2 rounded-lg border border-fog/20 bg-panel/70 px-5 py-3.5 font-display text-lg font-semibold tracking-[0.16em] text-fog uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 fill-racing text-racing" }), "Il nostro anniversario"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => gameApi.openSettings(),
							className: "rounded-lg border border-fog/15 bg-transparent px-5 py-3.5 font-display text-lg font-semibold tracking-[0.16em] text-mist uppercase",
							children: "Impostazioni"
						})
					]
				})
			]
		})
	});
}
function Anniversary() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-end justify-center bg-ink/55 px-5 pb-10 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter-slow max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl border border-fog/12 bg-panel p-6 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 font-display text-sm tracking-[0.22em] text-racing uppercase",
					children: ["Un anno", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-4xl font-bold tracking-tight",
					children: "Il nostro anniversario"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 font-sans text-base leading-relaxed text-fog/90",
					children: "365 giorni, migliaia di ricordi e ancora tantissimi giri da fare insieme."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-sans text-sm leading-relaxed text-mist",
					children: "Un rettilineo, una chicane, un tornante. Ogni curva di quest'anno è diventata parte del nostro tracciato. Bimba Grand Prix è solo un modo per dirtelo: la gara più bella la sto facendo con te."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.backToMenu(),
					className: "mt-7 w-full rounded-md bg-fog py-3 font-display text-base font-bold tracking-[0.16em] text-ink uppercase",
					children: "Torna al via"
				})
			]
		})
	});
}
function Toggle({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!value),
		className: "flex w-full items-center justify-between rounded-md border border-fog/10 bg-panel-2 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-sans text-sm text-fog",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `flex h-6 w-11 items-center rounded-full px-0.5 ${value ? "bg-racing" : "bg-line"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-5 rounded-full bg-fog transition-transform ${value ? "translate-x-5" : ""}` })
		})]
	});
}
function Settings() {
	const musicOn = useGameUI((s) => s.musicOn);
	const shakeOn = useGameUI((s) => s.shakeOn);
	const forceTouch = useGameUI((s) => s.forceTouch);
	const audioOn = useGameUI((s) => s.audioOn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-end justify-center bg-ink/55 px-5 pb-10 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter w-full max-w-md rounded-xl border border-fog/12 bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-bold tracking-tight",
					children: "Impostazioni"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Audio",
							value: audioOn,
							onChange: () => gameApi.toggleAudio()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Musica",
							value: musicOn,
							onChange: gameApi.setMusic
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Vibrazione inquadratura",
							value: shakeOn,
							onChange: gameApi.setShake
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Controlli touch",
							value: forceTouch,
							onChange: gameApi.setTouch
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 font-sans text-xs leading-relaxed text-mist",
					children: "PC: W/↑ accelera · S/↓ frena · A/D sterza · Spazio boost · R riparti · Esc pausa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.backToMenu(),
					className: "mt-6 w-full rounded-md bg-fog py-3 font-display font-bold tracking-[0.16em] text-ink uppercase",
					children: "Chiudi"
				})
			]
		})
	});
}
function Hud() {
	const position = useGameUI((s) => s.position);
	const field = useGameUI((s) => s.field);
	const lap = useGameUI((s) => s.lap);
	const totalLaps = useGameUI((s) => s.totalLaps);
	const speed = useGameUI((s) => s.speed);
	const boost = useGameUI((s) => s.boost);
	const toast = useGameUI((s) => s.toast);
	const wrongWay = useGameUI((s) => s.wrongWay);
	const screen = useGameUI((s) => s.screen);
	const standings = useGameUI((s) => s.standings);
	const lapTime = useGameUI((s) => s.lapTime);
	const bestLap = useGameUI((s) => s.bestLap);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute top-4 left-4 flex flex-col gap-2 sm:top-6 sm:left-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip rounded-md border border-fog/12 bg-ink/60 px-3 py-2 backdrop-blur-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[11px] tracking-[0.2em] text-mist uppercase",
						children: "Posizione"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-3xl leading-none font-bold",
						children: [
							"P",
							position,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-lg text-mist",
								children: [" / ", field]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip rounded-md border border-fog/12 bg-ink/60 px-3 py-2 backdrop-blur-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[11px] tracking-[0.2em] text-mist uppercase",
							children: "Giro"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl leading-none font-bold",
							children: [
								lap,
								" / ",
								totalLaps
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-display text-[11px] tracking-wide text-mist",
							children: [formatTime(lapTime), bestLap > 0 ? ` · best ${formatTime(bestLap)}` : ""]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-36",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 font-display text-[11px] tracking-[0.2em] text-mist uppercase",
						children: "Boost"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 overflow-hidden rounded-full bg-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-full bg-racing ${boost > .96 ? "boost-ready" : ""}`,
							style: { width: `${Math.round(boost * 100)}%` }
						})
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip rounded-md border border-fog/12 bg-ink/60 px-4 py-2 text-center backdrop-blur-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[11px] tracking-[0.2em] text-mist uppercase",
						children: "Velocità"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-3xl leading-none font-bold",
						children: [speed, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-sm text-mist",
							children: "km/h"
						})]
					})]
				}),
				wrongWay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md bg-racing px-3 py-1 font-display text-sm font-bold tracking-widest text-fog uppercase",
					children: "Senso di marcia"
				}),
				toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 rounded-full border border-fog/15 bg-ink/70 px-4 py-1.5 font-sans text-sm text-fog",
					children: toast
				})
			]
		}),
		standings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute bottom-28 left-4 hidden w-44 flex-col gap-0.5 rounded-md border border-fog/12 bg-ink/55 p-2 backdrop-blur-sm lg:flex",
			children: standings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex items-center justify-between px-1.5 py-0.5 font-display text-xs tracking-wide ${row.isPlayer ? "text-racing" : "text-fog/80"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"P",
					row.place,
					" ",
					row.name
				] }), row.finished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-mist",
					children: "fine"
				})]
			}, row.name))
		}),
		screen === "race" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Pausa",
			onClick: () => gameApi.pause(),
			className: "absolute top-16 right-4 z-20 flex size-11 items-center justify-center rounded-full border border-fog/15 bg-ink/55 text-fog sm:top-[4.75rem] sm:right-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
		})
	] });
}
function Countdown() {
	const n = useGameUI((s) => s.countdown);
	const onCount = n === "go" ? 5 : n == null ? 0 : n === 3 ? 3 : n === 2 ? 4 : 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-fog/15 bg-ink/70 px-8 py-6 text-center backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lights-row mb-4 justify-center",
					children: [
						0,
						1,
						2,
						3,
						4
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `light-dot ${n === "go" ? "go" : i < onCount ? "on" : ""}` }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-7xl font-extrabold tracking-tight",
					children: n === "go" ? "GO" : n ?? ""
				}),
				n === "go" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex items-center justify-center gap-1.5 font-sans text-sm tracking-[0.2em] text-racing",
					children: ["Per la mia Bimba", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })]
				})
			]
		})
	});
}
function Paused() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/60 px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter w-full max-w-sm rounded-xl border border-fog/12 bg-panel p-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl font-bold",
				children: "Pausa"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.resume(),
					className: "rounded-md bg-fog py-3 font-display font-bold tracking-[0.14em] text-ink uppercase",
					children: "Riprendi"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.backToMenu(),
					className: "rounded-md border border-fog/15 py-3 font-display font-semibold tracking-[0.14em] uppercase",
					children: "Torna al menu"
				})]
			})]
		})
	});
}
function CelebrationBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => gameApi.toVictory(),
		className: "absolute inset-0 flex items-end justify-center bg-ink/10 pb-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter flex flex-col items-center gap-3 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-10 text-fog" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl tracking-[0.22em] text-fog uppercase",
					children: "Traguardo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-sm text-mist",
					children: "Continua"
				})
			]
		})
	});
}
function Victory() {
	const pos = useGameUI((s) => s.finalPosition);
	const results = useGameUI((s) => s.results);
	const won = pos === 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/55 px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter-slow max-h-[88vh] w-full max-w-lg overflow-auto rounded-xl border border-fog/12 bg-panel/92 p-7 text-center backdrop-blur-sm sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center justify-center gap-2 font-display text-sm tracking-[0.24em] text-racing uppercase",
					children: ["Bimba Grand Prix", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto mt-4 size-10 text-fog" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl leading-tight font-extrabold sm:text-5xl",
					children: won ? "HAI VINTO, BIMBA" : "TRAGUARDO, BIMBA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-display text-lg text-mist",
					children: [
						"P",
						pos,
						" · 3 giri",
						!won && " · ogni gara con te è una vittoria"
					]
				}),
				results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 space-y-1 text-left",
					children: results.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `flex items-center justify-between rounded-md px-3 py-1.5 font-display text-sm ${row.isPlayer ? "bg-racing/20 text-fog" : "text-mist"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"P",
							row.place,
							" ",
							row.name
						] }), row.isPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3 fill-racing text-racing" })]
					}, row.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.toLetter(),
					className: "mt-7 w-full rounded-md bg-fog py-3.5 font-display text-lg font-bold tracking-[0.16em] text-ink uppercase",
					children: "Continua"
				})
			]
		})
	});
}
function Letter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-end justify-center bg-ink/70 px-4 py-6 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter-slow max-h-[88vh] w-full max-w-xl overflow-auto rounded-xl border border-fog/12 bg-panel p-6 sm:p-9",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 font-display text-sm tracking-[0.22em] text-racing uppercase",
					children: ["Per Eleonora", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-4 font-sans text-[15px] leading-relaxed text-fog/92 italic sm:text-base",
					children: LETTER.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "letter-line",
						style: { animationDelay: `${i * 80}ms` },
						children: p
					}, p))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.toClosing(),
					className: "mt-8 w-full rounded-md bg-fog py-3.5 font-display font-bold tracking-[0.16em] text-ink uppercase",
					children: "Continua"
				})
			]
		})
	});
}
function Closing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-ink/60 px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-enter-slow w-full max-w-md rounded-xl border border-fog/12 bg-panel p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center justify-center gap-2 font-display text-sm tracking-[0.28em] text-racing uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" }),
						"1 anno con te",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5 fill-racing text-racing" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-4xl font-extrabold tracking-tight",
					children: "La nostra gara continua..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-sans text-sm text-mist",
					children: "Abbiamo fatto il primo giro insieme. Ora voglio fare tutti gli altri con te."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => gameApi.restartToMenu(),
					className: "mt-8 w-full rounded-md bg-fog py-3.5 font-display font-bold tracking-[0.12em] text-ink uppercase",
					children: "Ricomincia la nostra gara"
				})
			]
		})
	});
}
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const screen = useGameUI((s) => s.screen);
	const forceTouch = useGameUI((s) => s.forceTouch);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		return mountGame(canvas);
	}, []);
	const showHud = screen === "race" || screen === "countdown" || screen === "paused";
	const showTouch = (screen === "race" || screen === "countdown") && (forceTouch || shouldShowTouch());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "game-root relative h-dvh w-full overflow-hidden bg-ink text-fog",
		onPointerDown: () => gameApi.unlock(),
		onContextMenu: (e) => e.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/50" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute top-4 right-4 z-20 sm:top-6 sm:right-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioBtn, {})
			}),
			showHud && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			screen === "menu" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {}),
			screen === "anniversary" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Anniversary, {}),
			screen === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}),
			screen === "countdown" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {}),
			screen === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paused, {}),
			screen === "celebration" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CelebrationBanner, {}),
			screen === "victory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Victory, {}),
			screen === "letter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Letter, {}),
			screen === "closing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Closing, {}),
			showTouch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, {})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
