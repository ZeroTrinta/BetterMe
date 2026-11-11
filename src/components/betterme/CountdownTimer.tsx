"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw, Timer } from "lucide-react";

type ClockStatus = "idle" | "running" | "paused" | "done";
type ClockState = { selected: number; remaining: number; deadline: number; status: ClockStatus };
type Props = {
  id: string;
  label: string;
  initialSeconds: number;
  presets?: number[];
  onRecord?: (seconds: number) => void;
  canRecord?: boolean;
  recordLabel?: string;
};

const initial = (seconds: number): ClockState => ({
  selected: seconds, remaining: seconds, deadline: 0, status: "idle"
});
const showTime = (seconds: number) =>
  String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");

export default function CountdownTimer({
  id, label, initialSeconds, presets, onRecord, canRecord = true, recordLabel
}: Props) {
  const storageKey = "betterme:countdown:" + id;
  const [clock, setClock] = useState<ClockState>(() => initial(initialSeconds));
  const [ready, setReady] = useState(false);
  const lastStatus = useRef<ClockStatus>("idle");

  useEffect(() => {
    setReady(false);
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        setClock(initial(initialSeconds));
      } else {
        const parsed = JSON.parse(raw) as ClockState;
        if (!(parsed.selected > 0) || !Number.isFinite(parsed.remaining)) {
          setClock(initial(initialSeconds));
        } else if (parsed.status === "running") {
          const left = Math.max(0, Math.ceil((parsed.deadline - Date.now()) / 1000));
          setClock({ ...parsed, remaining: left, status: left > 0 ? "running" : "done" });
        } else {
          setClock(parsed);
        }
      }
    } catch {
      setClock(initial(initialSeconds));
    }
    lastStatus.current = "idle";
    setReady(true);
  }, [storageKey, initialSeconds]);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify(clock)); } catch { /* storage blocked */ }
  }, [ready, storageKey, clock]);

  useEffect(() => {
    if (!ready) return;
    const update = () => {
      setClock(previous => {
        if (previous.status !== "running") return previous;
        const left = Math.max(0, Math.ceil((previous.deadline - Date.now()) / 1000));
        if (left === previous.remaining && left > 0) return previous;
        return { ...previous, remaining: left, status: left === 0 ? "done" : "running" };
      });
    };
    const timer = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [ready, storageKey]);

  useEffect(() => {
    if (!ready) return;
    if (clock.status === "done" && lastStatus.current === "running") {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate([120, 60, 120]);
      }
    }
    lastStatus.current = clock.status;
  }, [clock.status, ready]);

  function start() {
    const remaining = clock.status === "paused" && clock.remaining > 0
      ? clock.remaining
      : clock.selected;
    setClock({ ...clock, remaining, deadline: Date.now() + remaining * 1000, status: "running" });
  }
  function pause() {
    const remaining = Math.max(0, Math.ceil((clock.deadline - Date.now()) / 1000));
    setClock({ ...clock, remaining, deadline: 0, status: remaining ? "paused" : "done" });
  }
  function reset() { setClock(initial(clock.selected)); }
  function selectDuration(seconds: number) { setClock(initial(seconds)); }

  const isActive = clock.status === "running";
  const isDone = clock.status === "done";
  const percent = Math.max(0, Math.min(100, (clock.remaining / clock.selected) * 100));

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-[#0e1512] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-dim">
          <Timer size={16} className="text-lime" />
          {label}
        </div>
        <div className="flex gap-1.5">
          {(presets || [initialSeconds]).map(seconds => (
            <button
              type="button" key={seconds}
              onClick={() => selectDuration(seconds)}
              disabled={isActive}
              aria-pressed={clock.selected === seconds}
              className={"rounded-lg border px-2 py-1.5 text-[11px] font-medium transition disabled:opacity-40 " +
                (clock.selected === seconds
                  ? "border-lime/35 bg-lime/10 text-lime"
                  : "border-white/10 text-ink-mute hover:text-white")}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="min-w-[104px] font-mono text-3xl font-bold tracking-tight text-white" aria-label={"Restam " + clock.remaining + " segundos"}>
          {showTime(clock.remaining)}
        </div>
        <div className="min-w-[100px] flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-lime transition-[width] duration-300" style={{ width: percent + "%" }}/>
          </div>
          <p className="mt-1.5 text-[10px] text-ink-mute">
            {isDone ? "Tempo concluído!" : isActive ? "Contando..." : clock.status === "paused" ? "Pausado" : "Pronto para começar"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <button type="button" onClick={pause} className="flex h-10 items-center gap-1.5 rounded-xl border border-white/15 px-3 text-xs font-medium">
              <Pause size={15}/> Pausar
            </button>
          ) : (
            <button type="button" onClick={start} className="flex h-10 items-center gap-1.5 rounded-xl bg-lime px-3 text-xs font-bold text-[#0d1211]">
              <Play size={15}/> {clock.status === "paused" ? "Retomar" : "Iniciar"}
            </button>
          )}
          <button type="button" aria-label="Reiniciar timer" title="Reiniciar timer" onClick={reset} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-ink-dim hover:text-white">
            <RotateCcw size={16}/>
          </button>
        </div>
      </div>
      {isDone && onRecord && (
        <button
          type="button" disabled={!canRecord}
          onClick={() => { onRecord(clock.selected); reset(); }}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-lime/15 px-3 py-2 text-xs font-semibold text-lime disabled:opacity-40"
        >
          <Check size={15}/> {canRecord ? (recordLabel || "Registrar série concluída") : "Todas as séries já registradas"}
        </button>
      )}
    </div>
  );
}
