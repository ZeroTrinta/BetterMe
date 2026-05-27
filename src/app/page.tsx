"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Check, Dumbbell, Target, Sparkles, Route, Zap } from "lucide-react";
import {
  getDietaDoDia,
  getTreinosIntervalo,
  toggleRefeicao,
  todayKey,
  monthKey,
  getComprasMes,
  getDietaIntervalo,
  getCorridasIntervalo,
} from "@/lib/firestore";
import {
  HistoricoAlimentacao,
  REFEICOES_ORDEM,
  REFEICAO_LABEL,
  TREINO_LABEL,
} from "@/types";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { PageHeader } from "@/components/layout/PageHeader";
import { StreakBadge } from "@/components/hub/StreakBadge";
import { calcularStreak, StreakResult } from "@/lib/streak";
import { formatBRL, cn, formatPace } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomePage() {
  const [dieta, setDieta] = useState<HistoricoAlimentacao | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<string | null>(null);
  const [gastoMes, setGastoMes] = useState(0);
  const [streak, setStreak] = useState<StreakResult | null>(null);
  const [kmSemana, setKmSemana] = useState(0);
  const [ultimoPace, setUltimoPace] = useState<number | null>(null);
  const [corridasNoMes, setCorridasNoMes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [celebra, setCelebra] = useState(false);

  const refresh = async () => {
    const hoje = todayKey();
    // Janela de 90 dias é o suficiente pra streak comum
    const inicio = format(subDays(new Date(), 90), "yyyy-MM-dd");
    const [d, treinos, compras, dietasHist, corridasHist, treinosHist] = await Promise.all([
      getDietaDoDia(hoje),
      getTreinosIntervalo(hoje, hoje),
      getComprasMes(monthKey()),
      getDietaIntervalo(inicio, hoje),
      getCorridasIntervalo(inicio, hoje),
      getTreinosIntervalo(inicio, hoje),
    ]);
    setDieta(d);
    setTreinoHoje(treinos[0]?.tipo_treino ?? null);
    setGastoMes(compras.reduce((acc, c) => acc + (c.valor_pago || 0), 0));
    setStreak(calcularStreak(dietasHist, treinosHist, corridasHist, hoje));

    // KPIs de corrida
    const inicio7 = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const corridasSemana = corridasHist.filter((c) => c.data >= inicio7);
    setKmSemana(corridasSemana.reduce((a, c) => a + c.distancia_km, 0));
    setCorridasNoMes(corridasHist.filter((c) => c.data.startsWith(monthKey())).length);
    // último pace (mais recente)
    const ordenadas = [...corridasHist].sort((a, b) => b.data.localeCompare(a.data));
    setUltimoPace(ordenadas[0]?.ritmo_min_km ?? null);

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const refsCount = dieta
    ? REFEICOES_ORDEM.filter((r) => dieta[r]).length
    : 0;
  const progresso = refsCount / 4;
  const tudoFeito = refsCount === 4;

  const handleToggle = async (r: (typeof REFEICOES_ORDEM)[number]) => {
    if (!dieta) return;
    const novo = !dieta[r];
    setDieta({ ...dieta, [r]: novo });
    await toggleRefeicao(r, novo);
    const total = REFEICOES_ORDEM.filter((x) =>
      x === r ? novo : dieta[x]
    ).length;
    if (total === 4 && novo) {
      setCelebra(true);
      setTimeout(() => setCelebra(false), 2400);
    }
  };

  const dataLabel = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="relative">
      <PageHeader
        eyebrow={`Hoje · ${format(new Date(), "dd MMM").toUpperCase()}`}
        title="Boa,"
        serifWord="atleta."
        subtitle={dataLabel.charAt(0).toUpperCase() + dataLabel.slice(1)}
      />

      {/* STREAK */}
      {streak && (
        <section className="px-5 pb-4">
          <StreakBadge streak={streak} />
        </section>
      )}

      {/* RING PRINCIPAL */}
      <section className="px-5">
        <Card className="flex flex-col items-center pt-7" glow={tudoFeito}>
          <ProgressRing
            value={progresso}
            label={
              <>
                <span className="font-display text-6xl leading-none text-ink">
                  {refsCount}
                  <span className="text-ink-mute">/4</span>
                </span>
                <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
                  Refeições
                </span>
              </>
            }
          />
          <p className="mt-4 text-sm text-ink-dim">
            {tudoFeito ? (
              <span className="text-lime">Dia fechado. Massa preservada. ✦</span>
            ) : (
              `Faltam ${4 - refsCount} refeições para fechar o dia`
            )}
          </p>
        </Card>
      </section>

      {/* GRID DE REFEIÇÕES */}
      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        {REFEICOES_ORDEM.map((r, i) => {
          const checked = dieta?.[r] ?? false;
          return (
            <motion.button
              key={r}
              onClick={() => handleToggle(r)}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={cn(
                "glass relative aspect-[1.4/1] rounded-2xl p-4 text-left transition-all",
                checked && "ring-1 ring-lime/40 bg-lime/[0.06]"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
                  checked
                    ? "border-lime bg-lime text-bg"
                    : "border-white/15 bg-white/[0.03]"
                )}
              >
                {checked && <Check className="h-4 w-4" strokeWidth={3} />}
              </div>
              <p
                className={cn(
                  "mt-auto pt-4 text-sm font-medium leading-tight",
                  checked ? "text-ink" : "text-ink-dim"
                )}
              >
                {REFEICAO_LABEL[r]}
              </p>
            </motion.button>
          );
        })}
      </section>

      {/* STATS GRID 2x2 */}
      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <Dumbbell className="h-5 w-5 text-lime" />
            <span className="text-[10px] uppercase tracking-wider text-ink-mute">
              Treino
            </span>
          </div>
          <p className="mt-3 font-display text-2xl text-ink">
            {treinoHoje ? `Treino ${treinoHoje}` : "—"}
          </p>
          <p className="text-xs text-ink-dim">
            {treinoHoje ? TREINO_LABEL[treinoHoje as "A" | "B" | "C"] : "Sem registro"}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <Route className="h-5 w-5 text-lime" />
            <span className="text-[10px] uppercase tracking-wider text-ink-mute">
              7 dias
            </span>
          </div>
          <p className="mt-3 font-display text-2xl text-ink">
            {kmSemana.toFixed(1)}
            <span className="text-sm text-ink-dim"> km</span>
          </p>
          <p className="text-xs text-ink-dim">
            {ultimoPace ? `Último ${formatPace(ultimoPace)}` : "Corra esta semana"}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <Zap className="h-5 w-5 text-lime" />
            <span className="text-[10px] uppercase tracking-wider text-ink-mute">
              Mês
            </span>
          </div>
          <p className="mt-3 font-display text-2xl text-ink">
            {corridasNoMes}
            <span className="text-sm text-ink-dim"> corridas</span>
          </p>
          <p className="text-xs text-ink-dim">
            {corridasNoMes === 0 ? "Comece a contagem" : "Sessões registradas"}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <Target className="h-5 w-5 text-lime" />
            <span className="text-[10px] uppercase tracking-wider text-ink-mute">
              Mercado
            </span>
          </div>
          <p className="mt-3 font-display text-2xl text-ink">{formatBRL(gastoMes)}</p>
          <p className="text-xs text-ink-dim">Gasto no mês</p>
        </Card>
      </section>

      {/* CTA INSIGHT */}
      <section className="mt-4 px-5">
        <Card className="bg-gradient-to-br from-lime/[0.08] to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/15 text-lime">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Continue a sequência</p>
              <p className="text-xs text-ink-dim">
                Veja sua aderência e tendências em Insights.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* CONFETE / CELEBRAÇÃO */}
      <AnimatePresence>
        {celebra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="glass-strong rounded-3xl px-8 py-6 text-center ring-glow"
            >
              <Flame className="mx-auto h-10 w-10 text-lime" />
              <p className="mt-2 font-display text-3xl text-ink">
                Dia <span className="italic text-lime">fechado.</span>
              </p>
              <p className="text-xs text-ink-dim">+1 dia de aderência</p>
            </motion.div>
            {/* partículas */}
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-lime"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 18) * Math.PI * 2) * 160,
                  y: Math.sin((i / 18) * Math.PI * 2) * 160,
                  opacity: 0,
                }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <p className="px-5 pt-2 text-xs text-ink-mute">Carregando...</p>
      )}
    </div>
  );
}
