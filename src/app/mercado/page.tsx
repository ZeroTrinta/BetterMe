"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SwipeItem } from "@/components/ui/SwipeItem";
import { Plus, Receipt, TrendingDown } from "lucide-react";
import { getComprasMes, monthKey, registrarCompra } from "@/lib/firestore";
import { formatBRL } from "@/lib/utils";
import { CompraMercado } from "@/types";

interface ListaItem {
  id: string;
  nome: string;
  done: boolean;
}

const STORAGE_KEY = "betterme:lista-mercado";

const TEMPLATE: ListaItem[] = [
  { id: "1", nome: "Frango (1kg)", done: false },
  { id: "2", nome: "Ovos (30un)", done: false },
  { id: "3", nome: "Pão Integral", done: false },
  { id: "4", nome: "Arroz Integral", done: false },
  { id: "5", nome: "Feijão", done: false },
  { id: "6", nome: "Whey Protein", done: false },
  { id: "7", nome: "Aveia", done: false },
  { id: "8", nome: "Frutas (banana, maçã)", done: false },
];

export default function MercadoPage() {
  const [lista, setLista] = useState<ListaItem[]>([]);
  const [novo, setNovo] = useState("");
  const [valor, setValor] = useState("");
  const [compras, setCompras] = useState<CompraMercado[]>([]);

  // Persistência local (lista é pessoal, sem necessidade de Firebase)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    setLista(raw ? JSON.parse(raw) : TEMPLATE);
    getComprasMes(monthKey()).then(setCompras);
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
    const c = await getComprasMes(monthKey());
    setCompras(c);
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
          <p className="text-xs text-ink-dim">Gasto no mês</p>
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
