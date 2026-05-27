import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Converte ritmo em min/km decimal para "m:ss/km" (ex: 5.5 → "5:30/km") */
export const formatPace = (ritmoDecimal: number): string => {
  if (!isFinite(ritmoDecimal) || ritmoDecimal <= 0) return "--:--";
  const minutos = Math.floor(ritmoDecimal);
  const segundos = Math.round((ritmoDecimal - minutos) * 60);
  return `${minutos}:${String(segundos).padStart(2, "0")}/km`;
};

/** Converte minutos decimais em "Xh Ym" ou "Xm Ys" */
export const formatDuracao = (min: number): string => {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
};
