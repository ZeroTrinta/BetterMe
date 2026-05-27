"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Scale, Check } from "lucide-react";
import { registrarPeso, todayKey } from "@/lib/firestore";
import { HistoricoPeso } from "@/types";
import { parseISO, format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  ultimo: HistoricoPeso | null;
  historico: HistoricoPeso[];
  onSaved: () => void;
}

export function PesoSheet({ ultimo, historico, onSaved }: Props) {
  const [peso, setPeso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const valor = parseFloat(peso.replace(",", "."));
  const valido = !isNaN(valor) && valor > 30 && valor < 250;

  const delta = useMemo(() => {
    if (!valido || !ultimo) return null;
    return Number((valor - ultimo.peso_kg).toFixed(1));
  }, [valor, valido, ultimo]);

  const diasDesde = ultimo
    ? differenceInDays(new Date(), parseISO(ultimo.data))
    : null;

  const salvar = async () => {
    if (!valido) return;
    setSalvando(true);
    await registrarPeso(valor);
    setSalvando(false);
    onSaved();
  };

  // Mini histórico (últimos 5)
  const ultimos5 = [...historico].slice(-5).reverse();

  return (
    <div>
      <div className="flex items-start gap-4 pt-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15 text-lime">
          <Scale className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-lime/80">
            Composição
          </p>
          <h2 className="font-display text-3xl text-ink">Pesagem</h2>
          <p className="mt-1 text-xs text-ink-dim">
            {diasDesde !== null
              ? `Última pesagem há ${diasDesde} dia${diasDesde === 1 ? "" : "s"}`
              : "Primeira pesagem do tracking"}
          </p>
        </div>
      </div>

      {/* Input */}
      <section className="mt-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Peso de hoje
        </p>
        <div className="glass flex items-center gap-3 rounded-2xl p-4">
          <input
            inputMode="decimal"
            placeholder={ultimo ? ultimo.peso_kg.toFixed(1).replace(".", ",") : "00,0"}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent font-display text-5xl text-ink outline-none placeholder:text-ink-mute"
          />
          <span className="text-sm text-ink-dim">kg</span>
        </div>

        {/* Preview do delta enquanto digita */}
        {delta !== null && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              delta < -0.1
                ? "mt-2 text-xs text-lime"
                : delta > 0.3
                ? "mt-2 text-xs text-red-300"
                : "mt-2 text-xs text-ink-dim"
            }
          >
            {delta > 0 ? "+" : ""}
            {delta} kg em relação à última pesagem
          </motion.p>
        )}
      </section>

      {/* Dica de melhor horário */}
      <section className="mt-4 rounded-2xl bg-white/[0.02] p-3 text-xs text-ink-dim">
        💡 <strong className="text-ink">Dica:</strong> pese-se sempre no mesmo
        horário (idealmente ao acordar, em jejum, depois do banheiro) pra reduzir
        ruído da medição.
      </section>

      {/* Histórico recente */}
      {ultimos5.length > 0 && (
        <section className="mt-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Últimas pesagens
          </p>
          <div className="glass space-y-1.5 rounded-2xl p-3">
            {ultimos5.map((p) => (
              <div
                key={p.data}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-ink-dim">
                  {format(parseISO(p.data), "dd 'de' MMM", { locale: ptBR })}
                </span>
                <span className="font-medium text-ink">
                  {p.peso_kg.toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={salvar}
        disabled={!valido || salvando}
        className={
          valido
            ? "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(123,184,255,0.35)]"
            : "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] py-4 font-medium text-ink-mute"
        }
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {salvando ? "Salvando..." : "Registrar pesagem"}
      </motion.button>
    </div>
  );
}
