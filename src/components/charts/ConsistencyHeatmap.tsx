"use client";
import { motion } from "framer-motion";
import { subDays, format, startOfDay } from "date-fns";
import { useMemo } from "react";

interface Props {
  /** mapa de YYYY-MM-DD -> intensidade 0-1 */
  data: Record<string, number>;
  weeks?: number;
}

export function ConsistencyHeatmap({ data, weeks = 14 }: Props) {
  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const totalDays = weeks * 7;
    return Array.from({ length: totalDays }).map((_, i) => {
      const d = subDays(today, totalDays - 1 - i);
      const key = format(d, "yyyy-MM-dd");
      return { key, intensity: data[key] ?? 0, date: d };
    });
  }, [data, weeks]);

  // organizar em colunas (semanas)
  const cols: typeof cells[] = Array.from({ length: weeks }, (_, w) =>
    cells.slice(w * 7, (w + 1) * 7)
  );

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((cell, i) => (
            <motion.div
              key={cell.key}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (ci * 7 + i) * 0.005, duration: 0.3 }}
              title={`${cell.key} · ${Math.round(cell.intensity * 100)}%`}
              className="h-3 w-3 rounded-[3px]"
              style={{
                background:
                  cell.intensity === 0
                    ? "rgba(255,255,255,0.04)"
                    : `rgba(123, 184, 255, ${0.18 + cell.intensity * 0.72})`,
                boxShadow:
                  cell.intensity > 0.6
                    ? "0 0 8px rgba(123, 184, 255,0.35)"
                    : undefined,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
