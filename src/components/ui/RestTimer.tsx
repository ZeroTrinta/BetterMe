"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X } from "lucide-react";

interface Props {
  durationSec?: number;
  onClose?: () => void;
}

export function RestTimer({ durationSec = 90, onClose }: Props) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(true);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (ref.current) window.clearInterval(ref.current);
          // vibração e som leve
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.([60, 40, 120]);
          }
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const size = 260;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = remaining / durationSec;

  const reset = () => {
    setRemaining(durationSec);
    setRunning(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full glass"
        >
          <X className="h-4 w-4 text-ink-dim" />
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="rotate-[-90deg]">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7BB8FF" />
                <stop offset="100%" stopColor="#4A7FBF" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
              fill="none"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#timerGrad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              animate={{ strokeDashoffset: c * (1 - progress) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={remaining}
              initial={{ scale: 1.1, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-display text-7xl tabular-nums text-ink"
            >
              {String(Math.floor(remaining / 60)).padStart(1, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </motion.span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-dim">
              {remaining === 0 ? "Vamos!" : "Descanso"}
            </span>
          </div>
        </motion.div>

        <div className="absolute bottom-[15%] flex items-center gap-4">
          <button
            onClick={reset}
            className="flex h-14 w-14 items-center justify-center rounded-full glass"
          >
            <RotateCcw className="h-5 w-5 text-ink-dim" />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-lime text-bg shadow-[0_0_40px_rgba(123, 184, 255,0.4)]"
          >
            {running ? (
              <Pause className="h-6 w-6" strokeWidth={2.5} />
            ) : (
              <Play className="h-6 w-6" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
