"use client";
import { Refeicao, REFEICAO_LABEL } from "@/types";
import { REFEICAO_DETALHES } from "@/lib/refeicoes";
import { Coffee, Soup, Apple, Moon, Check, Flame, Wheat, Beef } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = {
  cafe_manha: Coffee,
  almoco: Soup,
  pre_treino: Apple,
  jantar: Moon,
} as const;

interface Props {
  refeicao: Refeicao;
  checked: boolean;
  onToggle: () => void;
}

export function RefeicaoSheet({ refeicao, checked, onToggle }: Props) {
  const det = REFEICAO_DETALHES[refeicao];
  const Icon = ICONS[refeicao];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 pt-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15 text-lime">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-lime/80">
            {det.subtitulo}
          </p>
          <h2 className="font-display text-3xl text-ink">
            {REFEICAO_LABEL[refeicao]}
          </h2>
          <p className="mt-1 text-xs text-ink-dim">{det.proposito}</p>
        </div>
      </div>

      {/* Macros */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="glass rounded-2xl p-3 text-center">
          <Beef className="mx-auto h-4 w-4 text-lime" />
          <p className="mt-1 font-display text-xl text-ink">{det.proteina_g}g</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">Proteína</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <Wheat className="mx-auto h-4 w-4 text-lime" />
          <p className="mt-1 font-display text-xl text-ink">{det.carb_g}g</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">Carbo</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <Flame className="mx-auto h-4 w-4 text-lime" />
          <p className="mt-1 font-display text-xl text-ink">{det.kcal}</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">kcal</p>
        </div>
      </div>

      {/* Variante padrão */}
      <section className="mt-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          {det.padrao.titulo}
        </p>
        <div className="glass rounded-2xl p-4">
          <ul className="space-y-2.5">
            {det.padrao.itens.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime" />
                <div className="flex-1">
                  <p className="text-sm text-ink">{item.nome}</p>
                  <p className="text-xs text-ink-dim">{item.quantidade}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          {det.padrao.dica && (
            <p className="mt-3 border-t border-white/5 pt-3 text-xs italic text-ink-dim">
              💡 {det.padrao.dica}
            </p>
          )}
        </div>
      </section>

      {/* Variante whey */}
      {det.whey && (
        <section className="mt-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            {det.whey.titulo}
          </p>
          <div className="glass rounded-2xl border border-lime/10 p-4">
            <ul className="space-y-2.5">
              {det.whey.itens.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime/60" />
                  <div className="flex-1">
                    <p className="text-sm text-ink">{item.nome}</p>
                    <p className="text-xs text-ink-dim">{item.quantidade}</p>
                  </div>
                </li>
              ))}
            </ul>
            {det.whey.dica && (
              <p className="mt-3 border-t border-white/5 pt-3 text-xs italic text-ink-dim">
                💡 {det.whey.dica}
              </p>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
        className={
          checked
            ? "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-4 font-medium text-ink"
            : "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(123,184,255,0.35)]"
        }
      >
        {checked ? (
          <>Desmarcar refeição</>
        ) : (
          <>
            <Check className="h-4 w-4" strokeWidth={3} />
            Marcar como concluído
          </>
        )}
      </motion.button>
    </div>
  );
}
