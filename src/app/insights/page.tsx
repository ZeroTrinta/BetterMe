"use client";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  getDietaIntervalo,
  getTreinosIntervalo,
  getTodasCompras,
  todayKey,
} from "@/lib/firestore";
import { REFEICOES_ORDEM, TREINO_LABEL } from "@/types";
import { format, subDays, subMonths, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/utils";

const LIME = "#D9FF5C";
const LIME_DIM = "#8FAB3D";
const SLATE = "#3a3d44";

export default function InsightsPage() {
  const [aderencia, setAderencia] = useState(0);
  const [aderenciaSemanal, setAderenciaSemanal] = useState<{ dia: string; pct: number }[]>([]);
  const [distrib, setDistrib] = useState<{ name: string; value: number; key: string }[]>([]);
  const [gastoMensal, setGastoMensal] = useState<{ mes: string; valor: number }[]>([]);
  const [tendenciaPct, setTendenciaPct] = useState(0);

  useEffect(() => {
    (async () => {
      const hoje = new Date();
      const inicio7 = format(subDays(hoje, 6), "yyyy-MM-dd");
      const inicio30 = format(subDays(hoje, 29), "yyyy-MM-dd");

      // ADERÊNCIA 7 DIAS
      const dieta7 = await getDietaIntervalo(inicio7, todayKey());
      const mapaDieta: Record<string, number> = {};
      dieta7.forEach((d) => {
        const total = REFEICOES_ORDEM.filter((r) => (d as any)[r]).length;
        mapaDieta[d.data] = total / 4;
      });
      const dias = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(hoje, 6 - i);
        const key = format(d, "yyyy-MM-dd");
        return {
          dia: format(d, "EEE", { locale: ptBR }).slice(0, 3),
          pct: Math.round((mapaDieta[key] ?? 0) * 100),
        };
      });
      setAderenciaSemanal(dias);
      setAderencia(dias.reduce((a, b) => a + b.pct, 0) / 7);

      // DISTRIBUIÇÃO TREINOS 30D
      const treinos30 = await getTreinosIntervalo(inicio30, todayKey());
      const cont: Record<string, number> = { A: 0, B: 0, C: 0 };
      treinos30.forEach((t) => (cont[t.tipo_treino] = (cont[t.tipo_treino] || 0) + 1));
      setDistrib(
        (["A", "B", "C"] as const).map((k) => ({
          key: k,
          name: TREINO_LABEL[k],
          value: cont[k] || 0,
        }))
      );

      // GASTO MENSAL (últimos 6 meses)
      const todas = await getTodasCompras();
      const meses = eachMonthOfInterval({ start: subMonths(hoje, 5), end: hoje });
      const dados = meses.map((m) => {
        const mk = format(m, "yyyy-MM");
        const total = todas
          .filter((c) => c.mes === mk)
          .reduce((a, c) => a + (c.valor_pago || 0), 0);
        return { mes: format(m, "MMM", { locale: ptBR }), valor: Math.round(total) };
      });
      setGastoMensal(dados);

      // tendência: compara último vs penúltimo mês
      if (dados.length >= 2) {
        const ult = dados[dados.length - 1].valor;
        const pen = dados[dados.length - 2].valor;
        if (pen > 0) setTendenciaPct(((ult - pen) / pen) * 100);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Insights &"
        serifWord="tendências"
        subtitle="Dados que viram disciplina."
      />

      {/* HERO KPI */}
      <section className="px-5">
        <Card className="overflow-hidden">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Aderência · 7 dias
          </p>
          <div className="flex items-end justify-between">
            <p className="font-display text-6xl text-ink text-glow">
              {Math.round(aderencia)}
              <span className="text-lime">%</span>
            </p>
            <div className="h-16 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aderenciaSemanal}>
                  <defs>
                    <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LIME} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={LIME} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="pct"
                    stroke={LIME}
                    strokeWidth={2}
                    fill="url(#areaG)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            {aderenciaSemanal.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center">
                <div
                  className="w-1.5 rounded-full"
                  style={{
                    height: `${Math.max(4, (d.pct / 100) * 32)}px`,
                    background:
                      d.pct >= 75
                        ? LIME
                        : d.pct >= 50
                        ? "rgba(217,255,92,0.5)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
                <span className="mt-1 text-[9px] uppercase text-ink-mute">{d.dia}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* DISTRIBUIÇÃO TREINOS */}
      <section className="mt-4 px-5">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
              Distribuição · 30 dias
            </p>
            <p className="text-[10px] text-ink-mute">
              {distrib.reduce((a, b) => a + b.value, 0)} treinos
            </p>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distrib.some((d) => d.value > 0) ? distrib : [{ name: "Sem dados", value: 1, key: "x" }]}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={66}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {distrib.map((entry, i) => (
                      <Cell
                        key={entry.key}
                        fill={
                          distrib.some((d) => d.value > 0)
                            ? [LIME, LIME_DIM, "#5A6E26"][i]
                            : "rgba(255,255,255,0.06)"
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {distrib.map((d, i) => (
                <div key={d.key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: [LIME, LIME_DIM, "#5A6E26"][i] }}
                  />
                  <span className="text-xs text-ink-dim">
                    {d.key} · {d.name}
                  </span>
                  <span className="ml-auto font-display text-lg text-ink">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* GASTOS */}
      <section className="mt-4 px-5">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
                Mercado · 6 meses
              </p>
              <p className="mt-1 font-display text-3xl text-ink">
                {formatBRL(gastoMensal[gastoMensal.length - 1]?.valor || 0)}
              </p>
            </div>
            <p
              className="text-xs font-medium"
              style={{ color: tendenciaPct <= 0 ? LIME : "#ff7a7a" }}
            >
              {tendenciaPct === 0
                ? "—"
                : `${tendenciaPct > 0 ? "↑" : "↓"} ${Math.abs(tendenciaPct).toFixed(1)}%`}
            </p>
          </div>

          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gastoMensal} barCategoryGap={8}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5A5E68", fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(217,255,92,0.06)" }}
                  contentStyle={{
                    background: "#101114",
                    border: "1px solid #22252B",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatBRL(v), "Gasto"]}
                />
                <Bar dataKey="valor" radius={[6, 6, 2, 2]}>
                  {gastoMensal.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === gastoMensal.length - 1 ? LIME : SLATE}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <div className="h-6" />
    </div>
  );
}
