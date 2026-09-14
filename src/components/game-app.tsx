import { useEffect, useRef } from "react";
import { Flag, Heart, Pause, Trophy, Volume2, VolumeX } from "lucide-react";
import { gameApi, mountGame, shouldShowTouch } from "@/game/engine";
import { formatTime, useGameUI } from "@/game/store";
import { TouchPad } from "@/components/touch-pad";

const LETTER = [
  "Bimba, questo è solo un piccolo gioco, ma dietro ci ho messo tutto il mio cuore.",
  "È passato un anno da quando abbiamo iniziato questo viaggio insieme e, proprio come in una gara, ci sono stati rettilinei, curve, momenti facili e momenti più difficili.",
  "Ma la cosa più bella è che li abbiamo vissuti insieme.",
  "Se potessi scegliere ancora una volta con chi iniziare questa gara, sceglierei sempre te.",
  "Buon primo anniversario amore mio.",
  "E ricordati una cosa...",
  "questa gara non finisce al traguardo.",
  "Voglio continuare a fare tutti i prossimi giri insieme a te.",
  "Ti amo, Bimba.",
];

function AudioBtn() {
  const on = useGameUI((s) => s.audioOn);
  return (
    <button
      type="button"
      aria-label={on ? "Disattiva audio" : "Attiva audio"}
      onClick={() => gameApi.toggleAudio()}
      className="flex size-11 items-center justify-center rounded-full border border-fog/15 bg-ink/55 text-fog backdrop-blur-sm"
    >
      {on ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}

function OurPhoto({
  className = "",
  imgClassName = "h-full w-full object-cover object-[center_62%]",
  framed = true,
}: {
  className?: string;
  imgClassName?: string;
  framed?: boolean;
}) {
  return (
    <figure className={`overflow-hidden ${framed ? "border border-fog/12" : ""} ${className}`}>
      <img
        src="/amore.jpg"
        alt="Noi due. Il nostro primo anno insieme."
        className={imgClassName}
        decoding="async"
        draggable={false}
      />
    </figure>
  );
}

function Menu() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-stretch">
      <div className="pointer-events-auto flex w-full max-w-xl flex-col justify-end bg-gradient-to-r from-ink via-ink/88 to-ink/10 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:justify-center sm:px-10">
        <OurPhoto className="panel-enter mb-5 rounded-lg lg:hidden" imgClassName="h-32 w-full object-cover object-[center_62%] sm:h-40" />
        <p className="panel-enter flex items-center gap-2 font-sans text-sm tracking-[0.22em] text-mist uppercase">
          Per la mia Bimba
          <Heart className="size-3.5 fill-racing text-racing" />
        </p>
        <h1 className="panel-enter stagger-1 mt-3 font-display text-5xl leading-[0.9] font-extrabold tracking-tight text-fog sm:text-7xl">
          F1: BIMBA
          <br />
          <span className="text-racing">RACING</span>
        </h1>
        <p className="panel-enter stagger-2 mt-4 font-display text-xl tracking-[0.14em] text-fog/80 uppercase">
          Il nostro primo anno insieme
        </p>
        <p className="panel-enter stagger-3 mt-5 max-w-md font-sans text-sm leading-relaxed text-mist">
          365 giorni, migliaia di ricordi e ancora tantissimi giri da fare insieme.
        </p>
        <div className="panel-enter stagger-4 mt-8 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={() => gameApi.startRace()}
            className="flex items-center justify-center gap-2 rounded-lg bg-fog px-5 py-3.5 text-center font-display text-lg font-bold tracking-[0.18em] text-ink uppercase"
          >
            <Flag className="size-4" />
            Inizia la gara
          </button>
          <button
            type="button"
            onClick={() => gameApi.openAnniversary()}
            className="flex items-center justify-center gap-2 rounded-lg border border-fog/20 bg-panel/70 px-5 py-3.5 font-display text-lg font-semibold tracking-[0.16em] text-fog uppercase"
          >
            <Heart className="size-4 fill-racing text-racing" />
            Il nostro anniversario
          </button>
          <button
            type="button"
            onClick={() => gameApi.openSettings()}
            className="rounded-lg border border-fog/15 bg-transparent px-5 py-3.5 font-display text-lg font-semibold tracking-[0.16em] text-mist uppercase"
          >
            Impostazioni
          </button>
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-end pr-10 lg:flex xl:pr-16">
        <OurPhoto className="panel-enter-slow w-[min(40vw,420px)] rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)]" imgClassName="aspect-[4/3] w-full object-cover object-[center_62%]" />
      </div>
    </div>
  );
}

function Anniversary() {
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-ink/55 px-5 pb-10 sm:items-center">
      <div className="panel-enter-slow max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl border border-fog/12 bg-panel p-6 sm:p-8">
        <OurPhoto className="-mx-6 -mt-6 mb-5 rounded-t-xl sm:-mx-8 sm:-mt-8" imgClassName="h-44 w-full object-cover object-[center_62%] sm:h-56" framed={false} />
        <p className="flex items-center gap-2 font-display text-sm tracking-[0.22em] text-racing uppercase">
          Un anno
          <Heart className="size-3.5 fill-racing text-racing" />
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Il nostro anniversario</h2>
        <p className="mt-5 font-sans text-base leading-relaxed text-fog/90">
          365 giorni, migliaia di ricordi e ancora tantissimi giri da fare insieme.
        </p>
        <p className="mt-4 font-sans text-sm leading-relaxed text-mist">
          Un rettilineo, una chicane, un tornante. Ogni curva di quest'anno è diventata parte del nostro
          tracciato. Bimba Grand Prix è solo un modo per dirtelo: la gara più bella la sto facendo con te.
        </p>
        <button
          type="button"
          onClick={() => gameApi.backToMenu()}
          className="mt-7 w-full rounded-md bg-fog py-3 font-display text-base font-bold tracking-[0.16em] text-ink uppercase"
        >
          Torna al via
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-md border border-fog/10 bg-panel-2 px-4 py-3"
    >
      <span className="font-sans text-sm text-fog">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full px-0.5 ${value ? "bg-racing" : "bg-line"}`}>
        <span className={`size-5 rounded-full bg-fog transition-transform ${value ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function Settings() {
  const musicOn = useGameUI((s) => s.musicOn);
  const shakeOn = useGameUI((s) => s.shakeOn);
  const forceTouch = useGameUI((s) => s.forceTouch);
  const audioOn = useGameUI((s) => s.audioOn);
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-ink/55 px-5 pb-10 sm:items-center">
      <div className="panel-enter w-full max-w-md rounded-xl border border-fog/12 bg-panel p-6">
        <h2 className="font-display text-3xl font-bold tracking-tight">Impostazioni</h2>
        <div className="mt-5 flex flex-col gap-2">
          <Toggle label="Audio" value={audioOn} onChange={() => gameApi.toggleAudio()} />
          <Toggle label="Musica" value={musicOn} onChange={gameApi.setMusic} />
          <Toggle label="Vibrazione inquadratura" value={shakeOn} onChange={gameApi.setShake} />
          <Toggle label="Controlli touch" value={forceTouch} onChange={gameApi.setTouch} />
        </div>
        <p className="mt-5 font-sans text-xs leading-relaxed text-mist">
          PC: W/↑ accelera · S/↓ frena · A/D sterza · Spazio boost · R riparti · Esc pausa
        </p>
        <button
          type="button"
          onClick={() => gameApi.backToMenu()}
          className="mt-6 w-full rounded-md bg-fog py-3 font-display font-bold tracking-[0.16em] text-ink uppercase"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
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
  return (
    <>
      <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-2 sm:top-6 sm:left-6">
        <div className="hud-chip rounded-md border border-fog/12 bg-ink/60 px-3 py-2 backdrop-blur-sm">
          <p className="font-display text-[11px] tracking-[0.2em] text-mist uppercase">Posizione</p>
          <p className="font-display text-3xl leading-none font-bold">
            P{position}
            <span className="text-lg text-mist"> / {field}</span>
          </p>
        </div>
        <div className="hud-chip rounded-md border border-fog/12 bg-ink/60 px-3 py-2 backdrop-blur-sm">
          <p className="font-display text-[11px] tracking-[0.2em] text-mist uppercase">Giro</p>
          <p className="font-display text-2xl leading-none font-bold">
            {lap} / {totalLaps}
          </p>
          <p className="mt-1 font-display text-[11px] tracking-wide text-mist">
            {formatTime(lapTime)}
            {bestLap > 0 ? ` · best ${formatTime(bestLap)}` : ""}
          </p>
        </div>
        <div className="w-36">
          <p className="mb-1 font-display text-[11px] tracking-[0.2em] text-mist uppercase">Boost</p>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full bg-racing ${boost > 0.96 ? "boost-ready" : ""}`}
              style={{ width: `${Math.round(boost * 100)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <div className="hud-chip rounded-md border border-fog/12 bg-ink/60 px-4 py-2 text-center backdrop-blur-sm">
          <p className="font-display text-[11px] tracking-[0.2em] text-mist uppercase">Velocità</p>
          <p className="font-display text-3xl leading-none font-bold">
            {speed}
            <span className="ml-1 text-sm text-mist">km/h</span>
          </p>
        </div>
        {wrongWay && (
          <p className="rounded-md bg-racing px-3 py-1 font-display text-sm font-bold tracking-widest text-fog uppercase">
            Senso di marcia
          </p>
        )}
        {toast && (
          <p className="mt-2 rounded-full border border-fog/15 bg-ink/70 px-4 py-1.5 font-sans text-sm text-fog">
            {toast}
          </p>
        )}
      </div>
      {standings.length > 0 && (
        <div className="pointer-events-none absolute bottom-28 left-4 hidden w-44 flex-col gap-0.5 rounded-md border border-fog/12 bg-ink/55 p-2 backdrop-blur-sm lg:flex">
          {standings.map((row) => (
            <div
              key={row.name}
              className={`flex items-center justify-between px-1.5 py-0.5 font-display text-xs tracking-wide ${row.isPlayer ? "text-racing" : "text-fog/80"}`}
            >
              <span>
                P{row.place} {row.name}
              </span>
              {row.finished && <span className="text-mist">fine</span>}
            </div>
          ))}
        </div>
      )}
      {screen === "race" && (
        <button
          type="button"
          aria-label="Pausa"
          onClick={() => gameApi.pause()}
          className="absolute top-16 right-4 z-20 flex size-11 items-center justify-center rounded-full border border-fog/15 bg-ink/55 text-fog sm:top-[4.75rem] sm:right-6"
        >
          <Pause className="size-4" />
        </button>
      )}
    </>
  );
}

function Countdown() {
  const n = useGameUI((s) => s.countdown);
  const onCount = n === "go" ? 5 : n == null ? 0 : n === 3 ? 3 : n === 2 ? 4 : 5;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <div className="rounded-xl border border-fog/15 bg-ink/70 px-8 py-6 text-center backdrop-blur-sm">
        <div className="lights-row mb-4 justify-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`light-dot ${n === "go" ? "go" : i < onCount ? "on" : ""}`} />
          ))}
        </div>
        <p className="font-display text-7xl font-extrabold tracking-tight">{n === "go" ? "GO" : (n ?? "")}</p>
        {n === "go" && (
          <p className="mt-2 flex items-center justify-center gap-1.5 font-sans text-sm tracking-[0.2em] text-racing">
            Per la mia Bimba
            <Heart className="size-3.5 fill-racing text-racing" />
          </p>
        )}
      </div>
    </div>
  );
}

function Paused() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/60 px-5">
      <div className="panel-enter w-full max-w-sm rounded-xl border border-fog/12 bg-panel p-6 text-center">
        <h2 className="font-display text-3xl font-bold">Pausa</h2>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => gameApi.resume()}
            className="rounded-md bg-fog py-3 font-display font-bold tracking-[0.14em] text-ink uppercase"
          >
            Riprendi
          </button>
          <button
            type="button"
            onClick={() => gameApi.backToMenu()}
            className="rounded-md border border-fog/15 py-3 font-display font-semibold tracking-[0.14em] uppercase"
          >
            Torna al menu
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebrationBanner() {
  return (
    <button
      type="button"
      onClick={() => gameApi.toVictory()}
      className="absolute inset-0 flex items-end justify-center bg-ink/10 pb-16"
    >
      <div className="panel-enter flex flex-col items-center gap-3 text-center">
        <Trophy className="size-10 text-fog" />
        <p className="font-display text-3xl tracking-[0.22em] text-fog uppercase">Traguardo</p>
        <p className="font-sans text-sm text-mist">Continua</p>
      </div>
    </button>
  );
}

function Victory() {
  const pos = useGameUI((s) => s.finalPosition);
  const results = useGameUI((s) => s.results);
  const won = pos === 1;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/55 px-5">
      <div className="panel-enter-slow max-h-[88vh] w-full max-w-lg overflow-auto rounded-xl border border-fog/12 bg-panel/92 p-7 text-center backdrop-blur-sm sm:p-8">
        <p className="flex items-center justify-center gap-2 font-display text-sm tracking-[0.24em] text-racing uppercase">
          Bimba Grand Prix
          <Heart className="size-3.5 fill-racing text-racing" />
        </p>
        <Trophy className="mx-auto mt-4 size-10 text-fog" />
        <h2 className="mt-3 font-display text-4xl leading-tight font-extrabold sm:text-5xl">
          {won ? "HAI VINTO, BIMBA" : "TRAGUARDO, BIMBA"}
        </h2>
        <p className="mt-3 font-display text-lg text-mist">
          P{pos} · 3 giri
          {!won && " · ogni gara con te è una vittoria"}
        </p>
        {results.length > 0 && (
          <ul className="mt-5 space-y-1 text-left">
            {results.map((row) => (
              <li
                key={row.name}
                className={`flex items-center justify-between rounded-md px-3 py-1.5 font-display text-sm ${row.isPlayer ? "bg-racing/20 text-fog" : "text-mist"}`}
              >
                <span>
                  P{row.place} {row.name}
                </span>
                {row.isPlayer && <Heart className="size-3 fill-racing text-racing" />}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => gameApi.toLetter()}
          className="mt-7 w-full rounded-md bg-fog py-3.5 font-display text-lg font-bold tracking-[0.16em] text-ink uppercase"
        >
          Continua
        </button>
      </div>
    </div>
  );
}

function Letter() {
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-ink/70 px-4 py-6 sm:items-center">
      <div className="panel-enter-slow max-h-[88vh] w-full max-w-xl overflow-auto rounded-xl border border-fog/12 bg-panel p-6 sm:p-9">
        <OurPhoto className="-mx-6 -mt-6 mb-5 rounded-t-xl sm:-mx-9 sm:-mt-9" imgClassName="h-40 w-full object-cover object-[center_62%] sm:h-48" framed={false} />
        <p className="flex items-center gap-2 font-display text-sm tracking-[0.22em] text-racing uppercase">
          Per Eleonora
          <Heart className="size-3.5 fill-racing text-racing" />
        </p>
        <div className="mt-5 space-y-4 font-sans text-[15px] leading-relaxed text-fog/92 italic sm:text-base">
          {LETTER.map((p, i) => (
            <p key={p} className="letter-line" style={{ animationDelay: `${i * 80}ms` }}>
              {p}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => gameApi.toClosing()}
          className="mt-8 w-full rounded-md bg-fog py-3.5 font-display font-bold tracking-[0.16em] text-ink uppercase"
        >
          Continua
        </button>
      </div>
    </div>
  );
}

function Closing() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/70 px-5">
      <div className="panel-enter-slow max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-fog/12 bg-panel text-center">
        <OurPhoto className="rounded-t-xl" imgClassName="h-52 w-full object-cover object-[center_62%] sm:h-64" framed={false} />
        <div className="p-7 sm:p-8">
          <p className="flex items-center justify-center gap-2 font-display text-sm tracking-[0.28em] text-racing uppercase">
            <Heart className="size-3.5 fill-racing text-racing" />
            1 anno con te
            <Heart className="size-3.5 fill-racing text-racing" />
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight">La nostra gara continua...</h2>
          <p className="mt-4 font-sans text-sm text-mist">
            Abbiamo fatto il primo giro insieme. Ora voglio fare tutti gli altri con te.
          </p>
          <button
            type="button"
            onClick={() => gameApi.restartToMenu()}
            className="mt-8 w-full rounded-md bg-fog py-3.5 font-display font-bold tracking-[0.12em] text-ink uppercase"
          >
            Ricomincia la nostra gara
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screen = useGameUI((s) => s.screen);
  const forceTouch = useGameUI((s) => s.forceTouch);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountGame(canvas);
  }, []);

  const showHud = screen === "race" || screen === "countdown" || screen === "paused";
  const showTouch = (screen === "race" || screen === "countdown") && (forceTouch || shouldShowTouch());

  return (
    <div
      className="game-root relative h-dvh w-full overflow-hidden bg-ink text-fog"
      onPointerDown={() => gameApi.unlock()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/50" />

      <div className="pointer-events-auto absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <AudioBtn />
      </div>

      {showHud && <Hud />}
      {screen === "menu" && <Menu />}
      {screen === "anniversary" && <Anniversary />}
      {screen === "settings" && <Settings />}
      {screen === "countdown" && <Countdown />}
      {screen === "paused" && <Paused />}
      {screen === "celebration" && <CelebrationBanner />}
      {screen === "victory" && <Victory />}
      {screen === "letter" && <Letter />}
      {screen === "closing" && <Closing />}
      {showTouch && <TouchPad />}
    </div>
  );
}
