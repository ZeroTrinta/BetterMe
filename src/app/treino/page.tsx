"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { RestTimer } from "@/components/ui/RestTimer";
import { ConsistencyHeatmap } from "@/components/charts/ConsistencyHeatmap";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CorridaForm } from "@/components/hub/CorridaForm";
import {
  getTreinosIntervalo,
  registrarTreino,
  todayKey,
  getCorridasIntervalo,
} from "@/lib/firestore";
import { TREINOS } from "@/lib/treinos";
import { TipoTreino, HistoricoCorrida } from "@/types";
import { Timer, Check, ChevronRight, Zap, Plus, Route, TrendingDown } from "lucide-react";
import { cn, formatPace, formatDuracao } from "@/lib/utils";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type Aba = TipoTreino | "R";

export default function TreinoPage() {
  const [selected, setSelected] = useState<Aba>("A");
  const [done, setDone] = useState<Set<number>>(new Set());
  const [timerOpen, setTimerOpen] = useState(false);
  const [corridaSheetOpen, setCorridaSheetOpen] = useState(false);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [registradoHoje, setRegistradoHoje] = useState<TipoTreino | null>(null);
  const [corridas, setCorridas] = useState<HistoricoCorrida[]>([]);

  const loadAll = useCallback(async () => {
    const inicio = format(subDays(new Date(), 14 * 7), "yyyy-MM-dd");
    const [treinos, corridasData] = await Promise.all([
      getTreinosIntervalo(inicio, todayKey()),
      getCorridasIntervalo(inicio, todayKey()),
    ]);
    const map: Record<string, number> = {};
    treinos.forEach((t) => (map[t.data] = 1));
    corridasData.forEach((c) => (map[c.data] = Math.max(map[c.data] || 0, 0.7)));
    setHeatmap(map);
    setCorridas(corridasData);
    const hj = treinos.find((t) => t.data === todayKey());
    if (hj) {
      setRegistradoHoje(hj.tipo_treino);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isCorrida = selected === "R";
  const treino = isCorrida ? null : TREINOS[selected as TipoTreino];

  const toggleEx = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const finalizar = async () => {
    if (isCorrida) return;
    await registrarTreino(selected as TipoTreino);
    setRegistradoHoje(selected as TipoTreino);
    setHeatmap((m) => ({ ...m, [todayKey()]: 1 }));
  };

  // KPIs de corrida
  const kmTotal7d = corridas
    .filter((c) => {
      const diff = (Date.now() - parseISO(c.data).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    .reduce((a, c) => a + c.distancia_km, 0);

  const melhorRitmo = corridas.length
    ? Math.min(...corridas.filter((c) => c.distancia_km >= 1).map((c) => c.ritmo_min_km))
    : 0;

  const progresso = treino ? done.size / treino.exercicios.length : 0;

  return (
    <div>
      <PageHeader
        eyebrow={isCorrida ? "Cardio" : "Calistenia"}
        title={isCorrida ? "Corrida &" : "Metodologia"}
        serifWord={isCorrida ? "ritmo" : "ABC+R"}
        subtitle={isCorrida ? "Cada km registrado vira evolução." : "Selecione o treino do dia."}
      />

      {/* SELETOR A/B/C/R */}
      <section className="px-5">
        <div className="grid grid-cols-4 gap-2">
          {(["A", "B", "C", "R"] as Aba[]).map((t) => {
            const active = selected === t;
            const labels: Record<Aba, string> = {
              A: "Empurrar",
              B: "Puxar",
              C: "Pernas",
              R: "Corrida",
            };
            return (
              <motion.button
                key={t}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelected(t);
                  setDone(new Set());
                }}
                className={cn(
                  "glass relative overflow-hidden rounded-2xl p-3 text-left transition-all",
                  active && "ring-1 ring-lime/50 bg-lime/[0.06]"
                )}
              >
                <span className="text-[9px] uppercase tracking-[0.18em] text-ink-dim">
                  {t === "R" ? "Run" : "Treino"}
                </span>
                <p
                  className={cn(
                    "font-display text-3xl",
                    active ? "text-lime text-glow" : "text-ink"
                  )}
                >
                  {t}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-dim leading-tight">
                  {labels[t]}
                </p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* CONTEÚDO CONDICIONAL */}
      {isCorrida ? (
        <CorridaTab
          corridas={corridas}
          kmTotal7d={kmTotal7d}
          melhorRitmo={melhorRitmo}
          heatmap={heatmap}
          onAdd={() => setCorridaSheetOpen(true)}
        />
      ) : (
        <CalisteniaTab
          treino={treino!}
          done={done}
          progresso={progresso}
          registradoHoje={registradoHoje}
          selected={selected as TipoTreino}
          heatmap={heatmap}
          onToggle={toggleEx}
          onTimer={() => setTimerOpen(true)}
          onFinalize={finalizar}
        />
      )}

      <AnimatePresence>
        {timerOpen && <RestTimer onClose={() => setTimerOpen(false)} />}
      </AnimatePresence>

      <BottomSheet open={corridaSheetOpen} onClose={() => setCorridaSheetOpen(false)}>
        <CorridaForm
          onSaved={async () => {
            await loadAll();
            setCorridaSheetOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}

/* ---------- Sub-componentes ---------- */

function CalisteniaTab({
  treino,
  done,
  progresso,
  registradoHoje,
  selected,
  heatmap,
  onToggle,
  onTimer,
  onFinalize,
}: {
  treino: typeof TREINOS["A"];
  done: Set<number>;
  progresso: number;
  registradoHoje: TipoTreino | null;
  selected: TipoTreino;
  heatmap: Record<string, number>;
  onToggle: (i: number) => void;
  onTimer: () => void;
  onFinalize: () => void;
}) {
  return (
    <>
      <section className="mt-4 px-5">
        <p className="px-1 text-xs text-ink-dim">{treino.descricao}</p>
      </section>

      <section className="mt-3 px-5">
        <div className="relative h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className="absolute inset-y-0 left-0 bg-lime"
            animate={{ width: `${progresso * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: "0 0 12px rgba(123, 184, 255, 0.6)" }}
          />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          {done.size}/{treino.exercicios.length} exercícios
        </p>
      </section>

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
                onClick={() => onToggle(i)}
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
                onClick={onTimer}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/10 text-lime active:bg-lime/20"
                aria-label="Iniciar descanso"
              >
                <Timer className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </section>

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
            onClick={onFinalize}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(123,184,255,0.35)]"
          >
            Finalizar treino {selected}
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </motion.button>
        )}
      </section>

      <section className="mt-6 px-5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Consistência · 14 semanas
        </p>
        <Card className="p-4">
          <ConsistencyHeatmap data={heatmap} weeks={14} />
        </Card>
      </section>
    </>
  );
}

function CorridaTab({
  corridas,
  kmTotal7d,
  melhorRitmo,
  heatmap,
  onAdd,
}: {
  corridas: HistoricoCorrida[];
  kmTotal7d: number;
  melhorRitmo: number;
  heatmap: Record<string, number>;
  onAdd: () => void;
}) {
  return (
    <>
      {/* KPIs */}
      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Card className="p-4">
          <Route className="h-5 w-5 text-lime" />
          <p className="mt-3 font-display text-3xl text-ink">
            {kmTotal7d.toFixed(1)}
            <span className="text-base text-ink-dim"> km</span>
          </p>
          <p className="text-xs text-ink-dim">Últimos 7 dias</p>
        </Card>
        <Card className="p-4">
          <TrendingDown className="h-5 w-5 text-lime" />
          <p className="mt-3 font-display text-3xl text-ink">
            {melhorRitmo > 0 ? formatPace(melhorRitmo) : "--:--"}
          </p>
          <p className="text-xs text-ink-dim">Melhor ritmo</p>
        </Card>
      </section>

      {/* CTA add */}
      <section className="mt-4 px-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(123,184,255,0.35)]"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Registrar nova corrida
        </motion.button>
      </section>

      {/* HISTÓRICO */}
      <section className="mt-6 px-5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Histórico recente
        </p>
        {corridas.length === 0 ? (
          <Card className="text-center text-sm text-ink-dim">
            Nenhuma corrida registrada ainda.
            <br />
            <span className="text-xs">Cadastre a primeira pra começar o tracking.</span>
          </Card>
        ) : (
          <div className="space-y-2">
            {corridas.slice(0, 8).map((c, i) => (
              <motion.div
                key={c.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass flex items-center gap-3 rounded-2xl p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime/10 text-lime">
                  <Route className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">
                    {c.distancia_km.toFixed(2)} km
                  </p>
                  <p className="text-xs text-ink-dim">
                    {format(parseISO(c.data), "dd 'de' MMM", { locale: ptBR })} ·{" "}
                    {formatDuracao(c.duracao_min)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-lime">
                    {formatPace(c.ritmo_min_km)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* HEATMAP combinado */}
      <section className="mt-6 px-5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Atividade · 14 semanas
        </p>
        <Card className="p-4">
          <ConsistencyHeatmap data={heatmap} weeks={14} />
          <p className="mt-3 text-[10px] text-ink-mute">
            Calistenia + corridas combinadas
          </p>
        </Card>
      </section>
    </>
  );
}
