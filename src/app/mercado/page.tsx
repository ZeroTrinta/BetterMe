"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SwipeItem } from "@/components/ui/SwipeItem";
import { Plus, Receipt, TrendingDown, Sparkles } from "lucide-react";
import {
  getComprasMes,
  getTodasCompras,
  monthKey,
  registrarCompra,
} from "@/lib/firestore";
import { formatBRL } from "@/lib/utils";
import { CompraMercado } from "@/types";
import {
  LISTA_MERCADO_SEMANAL,
  calcularGastoSemanalAdaptativo,
} from "@/lib/refeicoes";

interface ListaItem {
  id: string;
  nome: string;
  done: boolean;
}

const STORAGE_KEY = "betterme:lista-mercado-v2";

// Template gerado a partir da lista nutricional oficial
const TEMPLATE: ListaItem[] = LISTA_MERCADO_SEMANAL.map((item, i) => ({
  id: String(i + 1),
  nome: `${item.alimento} · ${item.quantidade}`,
  done: false,
}));

export default function MercadoPage() {
  const [lista, setLista] = useState<ListaItem[]>([]);
  const [novo, setNovo] = useState("");
  const [valor, setValor] = useState("");
  const [compras, setCompras] = useState<CompraMercado[]>([]);
  const [todasCompras, setTodasCompras] = useState<CompraMercado[]>([]);

  // Persistência local (lista é pessoal, sem necessidade de Firebase)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    setLista(raw ? JSON.parse(raw) : TEMPLATE);
    Promise.all([getComprasMes(monthKey()), getTodasCompras()]).then(
      ([mes, todas]) => {
        setCompras(mes);
        setTodasCompras(todas);
      }
    );
  }, []);

  useEffect(() => {
    if (lista.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }, [lista]);

  const addItem = () => {
    if (!novo.trim()) return;
    setLista((l) => [{ id: crypto.randomUUID(), nome: novo.trim(), done: false }, ...l]);
    setNovo("");
  };

  const total = compras.reduce((a, c) => a + (c.valor_pago || 0), 0);
  const concluidos = lista.filter((l) => l.done).length;

  const salvarCompra = async () => {
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) return;
    await registrarCompra(v);
    setValor("");
    const [c, t] = await Promise.all([getComprasMes(monthKey()), getTodasCompras()]);
    setCompras(c);
    setTodasCompras(t);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Eficiência financeira"
        title="Hub de"
        serifWord="mercado"
        subtitle="Densidade nutricional por real investido."
      />

      {/* KPI */}
      <section className="grid grid-cols-2 gap-3 px-5">
        <Card className="p-4">
          <Receipt className="h-5 w-5 text-lime" />
          <p className="mt-3 font-display text-3xl text-ink">{formatBRL(total)}</p>
          <p className="text-xs text-ink-dim">Gasto real (mês)</p>
        </Card>
        <Card className="p-4">
          <TrendingDown className="h-5 w-5 text-lime" />
          <p className="mt-3 font-display text-3xl text-ink">
            {concluidos}
            <span className="text-ink-mute">/{lista.length}</span>
          </p>
          <p className="text-xs text-ink-dim">Itens comprados</p>
        </Card>
      </section>

      {/* ORÇAMENTO ESTIMADO — adaptativo */}
      <BlocoOrcamento gastoReal={total} todasCompras={todasCompras} />

      {/* REGISTRAR COMPRA */}
      <section className="mt-4 px-5">
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Nova compra
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-ink-dim">R$</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="flex-1 bg-transparent font-display text-3xl text-ink outline-none placeholder:text-ink-mute"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={salvarCompra}
              className="rounded-full bg-lime px-4 py-2 text-sm font-medium text-bg"
            >
              Salvar
            </motion.button>
          </div>
        </Card>
      </section>

      {/* LISTA */}
      <section className="mt-5 px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Lista de compras
          </p>
          <span className="text-[11px] text-ink-mute">← apagar · marcar →</span>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <input
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Adicionar item..."
            className="glass flex-1 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-ink-mute"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={addItem}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-bg"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {lista.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 120, transition: { duration: 0.25 } }}
              >
                <SwipeItem
                  item={item}
                  onToggle={() =>
                    setLista((l) =>
                      l.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x))
                    )
                  }
                  onDelete={() =>
                    setLista((l) => l.filter((x) => x.id !== item.id))
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ---------- Bloco de orçamento estimado (adaptativo) ---------- */
function BlocoOrcamento({
  gastoReal,
  todasCompras,
}: {
  gastoReal: number;
  todasCompras: CompraMercado[];
}) {
  const estimativa = calcularGastoSemanalAdaptativo(todasCompras);
  const semanalEstimado = estimativa.valor;
  const mensalEstimado = Math.round(semanalEstimado * 4.33);

  // Status do gasto real do mês vs estimado mensal
  const dentroDaMeta = gastoReal > 0 && gastoReal <= mensalEstimado * 1.1;
  const corStatus =
    gastoReal === 0
      ? "text-ink-dim"
      : dentroDaMeta
      ? "text-lime"
      : "text-red-300";

  return (
    <section className="mt-4 px-5">
      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-lime" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Gasto estimado
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-ink">Por semana</p>
            <p className="font-display text-2xl text-ink">
              {formatBRL(semanalEstimado)}
            </p>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex items-baseline justify-between">
            <p className="text-sm text-ink">Por mês</p>
            <p className="font-display text-2xl text-lime text-glow">
              {formatBRL(mensalEstimado)}
            </p>
          </div>
        </div>

        {/* Origem do cálculo */}
        <p className="mt-3 text-[10px] text-ink-mute">
          {estimativa.baseadoEm === "padrao"
            ? `Estimativa padrão · faltam ${4 - estimativa.amostras} compra${
                4 - estimativa.amostras === 1 ? "" : "s"
              } pra calcular pela sua média`
            : `Baseado em ${estimativa.amostras} compras suas`}
        </p>

        {/* Status do gasto real */}
        {gastoReal > 0 && (
          <div className="mt-4 rounded-2xl bg-white/[0.03] p-3 text-xs">
            <p className={corStatus}>
              {dentroDaMeta
                ? `✓ ${formatBRL(gastoReal)} no mês · dentro da média`
                : `⚠ ${formatBRL(gastoReal)} no mês · acima da média estimada`}
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
