"use client";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, Scale, AlertCircle } from "lucide-react";
import { HistoricoPeso } from "@/types";
import { parseISO, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  ultimo: HistoricoPeso | null;
  anterior: HistoricoPeso | null;
  onClick: () => void;
}

export function PesoCard({ ultimo, anterior, onClick }: Props) {
  const diasDesdeUltimo = ultimo
    ? differenceInDays(new Date(), parseISO(ultimo.data))
    : null;
  const precisaPesar = diasDesdeUltimo === null || diasDesdeUltimo >= 7;

  const delta =
    ultimo && anterior ? Number((ultimo.peso_kg - anterior.peso_kg).toFixed(1)) : null;

  const DeltaIcon = delta === null ? Minus : delta < 0 ? TrendingDown : delta > 0 ? TrendingUp : Minus;
  // Em corte, perder é bom (lime). Ganhar pode ser ruim ou bom — neutralizo se for pequeno.
  const deltaColor =
    delta === null
      ? "text-ink-mute"
      : delta < -0.1
      ? "text-lime"
      : delta > 0.3
      ? "text-red-300"
      : "text-ink-dim";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass relative flex w-full items-center gap-4 overflow-hidden rounded-2xl p-4 text-left",
        precisaPesar && ultimo && "ring-1 ring-lime/20"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          ultimo ? "bg-lime/10 text-lime" : "bg-white/[0.04] text-ink-dim"
        )}
      >
        <Scale className="h-5 w-5" />
      </div>

      {ultimo ? (
        <>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-ink">
                {ultimo.peso_kg.toFixed(1)}
              </span>
              <span className="text-xs text-ink-dim">kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              {delta !== null && (
                <>
                  <DeltaIcon className={cn("h-3 w-3", deltaColor)} strokeWidth={2.5} />
                  <span className={cn("text-xs", deltaColor)}>
                    {delta > 0 ? "+" : ""}
                    {delta} kg
                  </span>
                  <span className="text-[10px] text-ink-mute">vs anterior</span>
                </>
              )}
              {delta === null && (
                <span className="text-xs text-ink-dim">Primeira pesagem</span>
              )}
            </div>
          </div>

          {precisaPesar && (
            <div className="flex items-center gap-1 rounded-full bg-lime/10 px-2 py-1 text-[10px] font-medium text-lime">
              <AlertCircle className="h-3 w-3" />
              Pesar
            </div>
          )}
        </>
      ) : (
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Registrar peso</p>
          <p className="text-xs text-ink-dim">Toque para começar o tracking</p>
        </div>
      )}
    </motion.button>
  );
}
