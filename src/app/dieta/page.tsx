"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ConsistencyHeatmap } from "@/components/charts/ConsistencyHeatmap";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { RefeicaoSheet } from "@/components/hub/RefeicaoSheet";
import { PesoCard } from "@/components/hub/PesoCard";
import { PesoSheet } from "@/components/hub/PesoSheet";
import {
  getDietaDoDia,
  getDietaIntervalo,
  toggleRefeicao,
  todayKey,
  getTodosPesos,
} from "@/lib/firestore";
import {
  HistoricoAlimentacao,
  HistoricoPeso,
  REFEICOES_ORDEM,
  REFEICAO_LABEL,
  Refeicao,
} from "@/types";
import { Check, Coffee, Soup, Apple, Moon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  cafe_manha: Coffee,
  almoco: Soup,
  pre_treino: Apple,
  jantar: Moon,
} as const;

export default function DietaPage() {
  const [dieta, setDieta] = useState<HistoricoAlimentacao | null>(null);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState<Refeicao | null>(null);
  const [pesos, setPesos] = useState<HistoricoPeso[]>([]);
  const [pesoSheetOpen, setPesoSheetOpen] = useState(false);

  const refresh = async () => {
    const hoje = todayKey();
    const inicio = format(subDays(new Date(), 14 * 7), "yyyy-MM-dd");
    const [d, hist, todosPesos] = await Promise.all([
      getDietaDoDia(hoje),
      getDietaIntervalo(inicio, hoje),
      getTodosPesos(),
    ]);
    setDieta(d);
    setPesos(todosPesos);
    const map: Record<string, number> = {};
    hist.forEach((h) => {
      const total = REFEICOES_ORDEM.filter((r) => (h as any)[r]).length;
      map[h.data] = total / 4;
    });
    setHeatmap(map);
  };

  useEffect(() => {
    refresh();
  }, []);

  const ultimoPeso = pesos.length > 0 ? pesos[pesos.length - 1] : null;
  const anteriorPeso = pesos.length > 1 ? pesos[pesos.length - 2] : null;

  const handleToggle = async (r: Refeicao) => {
    if (!dieta) return;
    const novo = !dieta[r];
    setDieta({ ...dieta, [r]: novo });
    await toggleRefeicao(r, novo);
    setHeatmap((prev) => {
      const total = REFEICOES_ORDEM.filter((x) =>
        x === r ? novo : dieta[x]
      ).length;
      return { ...prev, [todayKey()]: total / 4 };
    });
  };

  const aderencia = Object.values(heatmap).slice(-7).reduce((a, b) => a + b, 0) / 7;

  return (
    <div>
      <PageHeader
        eyebrow="Nutrição"
        title="Arquitetura"
        serifWord="nutricional"
        subtitle="Toque numa refeição para ver os detalhes."
      />

      {/* PESO — Card discreto no topo */}
      <section className="px-5 pb-4">
        <PesoCard
          ultimo={ultimoPeso}
          anterior={anteriorPeso}
          onClick={() => setPesoSheetOpen(true)}
        />
      </section>

      <section className="px-5">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                Aderência 7d
              </p>
              <p className="mt-1 font-display text-5xl text-ink">
                {Math.round(aderencia * 100)}
                <span className="text-lime">%</span>
              </p>
            </div>
            <div className="flex-1 pl-4">
              <ConsistencyHeatmap data={heatmap} weeks={14} />
              <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-mute">
                <span>menos</span>
                <div className="flex gap-1">
                  {[0.15, 0.4, 0.65, 0.9].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-sm"
                      style={{ background: `rgba(123, 184, 255, ${i})` }}
                    />
                  ))}
                </div>
                <span>mais</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-4 space-y-3 px-5">
        <p className="px-1 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Refeições de hoje
        </p>
        {REFEICOES_ORDEM.map((r, i) => {
          const Icon = ICONS[r];
          const checked = dieta?.[r] ?? false;
          return (
            <motion.div
              key={r}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "glass flex w-full items-center gap-3 rounded-2xl p-4 transition-all",
                checked && "ring-1 ring-lime/40"
              )}
            >
              <button
                onClick={() => setSheetOpen(r)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    checked ? "bg-lime/20 text-lime" : "bg-white/[0.04] text-ink-dim"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">{REFEICAO_LABEL[r]}</p>
                  <p className="text-xs text-ink-dim">
                    {checked ? "Concluído" : "Toque para ver detalhes"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-mute" />
              </button>

              <button
                onClick={() => handleToggle(r)}
                aria-label={checked ? "Desmarcar" : "Marcar"}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  checked
                    ? "border-lime bg-lime text-bg"
                    : "border-white/15 bg-transparent active:bg-white/5"
                )}
              >
                {checked && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
            </motion.div>
          );
        })}
      </section>

      <BottomSheet open={sheetOpen !== null} onClose={() => setSheetOpen(null)}>
        {sheetOpen && (
          <RefeicaoSheet
            refeicao={sheetOpen}
            checked={dieta?.[sheetOpen] ?? false}
            onToggle={async () => {
              await handleToggle(sheetOpen);
              setTimeout(() => setSheetOpen(null), 200);
            }}
          />
        )}
      </BottomSheet>

      <BottomSheet open={pesoSheetOpen} onClose={() => setPesoSheetOpen(false)}>
        <PesoSheet
          ultimo={ultimoPeso}
          historico={pesos}
          onSaved={async () => {
            await refresh();
            setPesoSheetOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}
