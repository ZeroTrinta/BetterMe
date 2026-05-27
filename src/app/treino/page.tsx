"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { RestTimer } from "@/components/ui/RestTimer";
import { ConsistencyHeatmap } from "@/components/charts/ConsistencyHeatmap";
import { getTreinosIntervalo, registrarTreino, todayKey } from "@/lib/firestore";
import { TREINOS } from "@/lib/treinos";
import { TipoTreino } from "@/types";
import { Timer, Check, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

export default function TreinoPage() {
  const [selected, setSelected] = useState<TipoTreino>("A");
  const [done, setDone] = useState<Set<number>>(new Set());
  const [timerOpen, setTimerOpen] = useState(false);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [registradoHoje, setRegistradoHoje] = useState<TipoTreino | null>(null);

  useEffect(() => {
    (async () => {
      const inicio = format(subDays(new Date(), 14 * 7), "yyyy-MM-dd");
      const treinos = await getTreinosIntervalo(inicio, todayKey());
      const map: Record<string, number> = {};
      treinos.forEach((t) => (map[t.data] = 1));
      setHeatmap(map);
      const hj = treinos.find((t) => t.data === todayKey());
      if (hj) {
        setRegistradoHoje(hj.tipo_treino);
        setSelected(hj.tipo_treino);
      }
    })();
  }, []);

  const treino = TREINOS[selected];

  const toggleEx = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const finalizar = async () => {
    await registrarTreino(selected);
    setRegistradoHoje(selected);
    setHeatmap((m) => ({ ...m, [todayKey()]: 1 }));
  };

  const progresso = done.size / treino.exercicios.length;

  return (
    <div>
      <PageHeader
        eyebrow="Calistenia"
        title="Metodologia"
        serifWord="ABC"
        subtitle="Selecione o treino do dia."
      />

      {/* SELETOR A/B/C */}
      <section className="px-5">
        <div className="grid grid-cols-3 gap-2">
          {(["A", "B", "C"] as TipoTreino[]).map((t) => {
            const active = selected === t;
            return (
              <motion.button
                key={t}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelected(t);
                  setDone(new Set());
                }}
                className={cn(
                  "glass relative overflow-hidden rounded-2xl p-4 text-left transition-all",
                  active && "ring-1 ring-lime/50 bg-lime/[0.06]"
                )}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                  Treino
                </span>
                <p
                  className={cn(
                    "font-display text-4xl",
                    active ? "text-lime text-glow" : "text-ink"
                  )}
                >
                  {t}
                </p>
                <p className="mt-1 text-[11px] text-ink-dim leading-tight">
                  {TREINOS[t].titulo}
                </p>
                {active && (
                  <motion.div
                    layoutId="treino-underline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-lime"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* DESCRIÇÃO */}
      <section className="mt-4 px-5">
        <p className="px-1 text-xs text-ink-dim">{treino.descricao}</p>
      </section>

      {/* PROGRESS BAR */}
      <section className="mt-3 px-5">
        <div className="relative h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="absolute inset-y-0 left-0 bg-lime"
            animate={{ width: `${progresso * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: "0 0 12px rgba(217,255,92,0.6)" }}
          />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          {done.size}/{treino.exercicios.length} exercícios
        </p>
      </section>

      {/* EXERCÍCIOS */}
      <section className="mt-3 space-y-2 px-5">
        {treino.exercicios.map((ex, i) => {
          const isDone = done.has(i);
          return (
            <motion.div
              key={ex.nome}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "glass flex items-center gap-3 rounded-2xl p-3 transition-all",
                isDone && "opacity-50"
              )}
            >
              <button
                onClick={() => toggleEx(i)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isDone
                    ? "border-lime bg-lime text-bg"
                    : "border-white/15 bg-transparent"
                )}
              >
                {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", isDone && "line-through")}>
                  {ex.nome}
                </p>
                <p className="text-xs text-ink-dim">
                  {ex.series} {ex.foco && `· ${ex.foco}`}
                </p>
              </div>
              <button
                onClick={() => setTimerOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/10 text-lime active:bg-lime/20"
                aria-label="Iniciar descanso"
              >
                <Timer className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </section>

      {/* AÇÃO FINAL */}
      <section className="mt-4 px-5">
        {registradoHoje === selected ? (
          <Card className="flex items-center gap-3 bg-lime/[0.06]">
            <Zap className="h-5 w-5 text-lime" />
            <p className="text-sm">
              Treino <span className="font-semibold">{selected}</span> registrado hoje
            </p>
          </Card>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={finalizar}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(217,255,92,0.35)]"
          >
            Finalizar treino {selected}
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </motion.button>
        )}
      </section>

      {/* HEATMAP */}
      <section className="mt-6 px-5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Consistência · 14 semanas
        </p>
        <Card className="p-4">
          <ConsistencyHeatmap data={heatmap} weeks={14} />
        </Card>
      </section>

      <AnimatePresence>
        {timerOpen && <RestTimer onClose={() => setTimerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
