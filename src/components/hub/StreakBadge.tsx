"use client";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { StreakResult } from "@/lib/streak";
import { cn } from "@/lib/utils";

interface Props {
  streak: StreakResult;
}

export function StreakBadge({ streak }: Props) {
  const { atual, recorde, hoje_valido, refeicoes_faltando, tem_atividade_hoje } = streak;
  const ativa = atual > 0;

  const subtitulo = hoje_valido
    ? "Dia fechado · streak ativa"
    : atual === 0
    ? "Cumpra a meta de hoje pra começar"
    : `Faltam ${refeicoes_faltando > 0 ? `${refeicoes_faltando} refeições` : ""}${
        refeicoes_faltando > 0 && !tem_atividade_hoje ? " + " : ""
      }${!tem_atividade_hoje ? "1 treino" : ""} hoje`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-5",
        ativa && "ring-1 ring-lime/30"
      )}
    >
      {/* Glow de fundo quando ativa */}
      {ativa && (
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(123,184,255,0.25), transparent 70%)",
          }}
        />
      )}

      <div className="relative flex items-center gap-4">
        {/* Chama */}
        <motion.div
          animate={
            ativa
              ? { scale: [1, 1.08, 1], rotate: [-2, 2, -2] }
              : { scale: 1, rotate: 0 }
          }
          transition={{
            duration: 2.4,
            repeat: ativa ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            ativa ? "bg-lime/15" : "bg-white/[0.04]"
          )}
        >
          <Flame
            className={cn("h-7 w-7", ativa ? "text-lime" : "text-ink-mute")}
            strokeWidth={2}
          />
        </motion.div>

        {/* Números */}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">
            Sequência
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-display text-5xl leading-none",
                ativa ? "text-ink text-glow" : "text-ink-mute"
              )}
            >
              {atual}
            </span>
            <span className="text-sm text-ink-dim">
              dia{atual === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Recorde */}
        {recorde > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">
              Recorde
            </p>
            <p className="font-display text-2xl text-ink-dim">{recorde}</p>
          </div>
        )}
      </div>

      <p className="relative mt-3 text-xs text-ink-dim">{subtitulo}</p>
    </motion.div>
  );
}
