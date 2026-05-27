"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ConsistencyHeatmap } from "@/components/charts/ConsistencyHeatmap";
import { getDietaDoDia, getDietaIntervalo, toggleRefeicao, todayKey } from "@/lib/firestore";
import {
  HistoricoAlimentacao,
  REFEICOES_ORDEM,
  REFEICAO_LABEL,
} from "@/types";
import { Check, Coffee, Soup, Apple, Moon } from "lucide-react";
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

  useEffect(() => {
    (async () => {
      const hoje = todayKey();
      const inicio = format(subDays(new Date(), 14 * 7), "yyyy-MM-dd");
      const [d, hist] = await Promise.all([
        getDietaDoDia(hoje),
        getDietaIntervalo(inicio, hoje),
      ]);
      setDieta(d);
      const map: Record<string, number> = {};
      hist.forEach((h) => {
        const total = REFEICOES_ORDEM.filter((r) => (h as any)[r]).length;
        map[h.data] = total / 4;
      });
      setHeatmap(map);
    })();
  }, []);

  const handle = async (r: (typeof REFEICOES_ORDEM)[number]) => {
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
        subtitle="Déficit estratégico, massa preservada."
      />

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
                      style={{ background: `rgba(217,255,92,${i})` }}
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
            <motion.button
              key={r}
              onClick={() => handle(r)}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all",
                checked && "ring-1 ring-lime/40"
              )}
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
                  {checked ? "Concluído" : "Toque para registrar"}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
                  checked
                    ? "border-lime bg-lime text-bg"
                    : "border-white/15 bg-transparent"
                )}
              >
                {checked && <Check className="h-4 w-4" strokeWidth={3} />}
              </div>
            </motion.button>
          );
        })}
      </section>
    </div>
  );
}
