import type { PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Gauge, Square, Zap } from "lucide-react";
import { gameApi } from "@/game/engine";

function bindHold(
  onDown: (e: PointerEvent<HTMLButtonElement>) => void,
  onUp: () => void,
) {
  return {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDown(e);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerUp: onUp,
    onPointerCancel: onUp,
    onLostPointerCapture: onUp,
  };
}

export function TouchPad() {
  const t = gameApi.touch;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] sm:px-5">
      <div className="pointer-events-auto flex gap-2">
        <button
          type="button"
          aria-label="Sinistra"
          className="flex size-16 items-center justify-center rounded-lg border border-fog/20 bg-ink/70 text-fog backdrop-blur-sm"
          {...bindHold(
            () => {
              t.steer = 1;
            },
            () => {
              if (t.steer > 0) t.steer = 0;
            },
          )}
        >
          <ChevronLeft className="size-7" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Destra"
          className="flex size-16 items-center justify-center rounded-lg border border-fog/20 bg-ink/70 text-fog backdrop-blur-sm"
          {...bindHold(
            () => {
              t.steer = -1;
            },
            () => {
              if (t.steer < 0) t.steer = 0;
            },
          )}
        >
          <ChevronRight className="size-7" strokeWidth={2.2} />
        </button>
      </div>
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          aria-label="Boost"
          className="flex h-12 items-center gap-1.5 rounded-lg border border-racing/40 bg-racing/85 px-4 font-display text-sm font-bold tracking-[0.18em] text-fog uppercase"
          {...bindHold(
            () => {
              t.boost = true;
            },
            () => {
              t.boost = false;
            },
          )}
        >
          <Zap className="size-4" />
          Boost
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Freno"
            className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-lg border border-fog/20 bg-ink/70 font-display text-[10px] font-bold tracking-widest text-fog uppercase"
            {...bindHold(
              () => {
                t.brake = 1;
              },
              () => {
                t.brake = 0;
              },
            )}
          >
            <Square className="size-4 fill-fog" />
            Freno
          </button>
          <button
            type="button"
            aria-label="Acceleratore"
            className="flex h-16 w-[4.6rem] flex-col items-center justify-center gap-0.5 rounded-lg bg-fog font-display text-[10px] font-bold tracking-widest text-ink uppercase"
            {...bindHold(
              () => {
                t.throttle = 1;
              },
              () => {
                t.throttle = 0;
              },
            )}
          >
            <Gauge className="size-5" />
            Gas
          </button>
        </div>
      </div>
    </div>
  );
}
