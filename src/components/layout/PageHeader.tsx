"use client";
import { motion } from "framer-motion";

interface Props {
  eyebrow?: string;
  title: string;
  serifWord?: string; // palavra renderizada em serif itálico (estilo BetterMe)
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, serifWord, subtitle }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-5 pt-6 pb-4"
    >
      {eyebrow && (
        <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-lime/80">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[34px] leading-[1.05] font-semibold tracking-tight text-ink">
        {title}{" "}
        {serifWord && (
          <span className="font-display italic text-lime text-glow">{serifWord}</span>
        )}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-ink-dim">{subtitle}</p>}
    </motion.header>
  );
}
