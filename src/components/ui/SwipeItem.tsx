"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  item: { id: string; nome: string; done: boolean };
  onToggle: () => void;
  onDelete: () => void;
}

export function SwipeItem({ item, onToggle, onDelete }: Props) {
  const x = useMotionValue(0);
  const bg = useTransform(
    x,
    [-120, -40, 0, 40, 120],
    [
      "rgba(255,80,80,0.18)",
      "rgba(255,255,255,0)",
      "rgba(255,255,255,0)",
      "rgba(217,255,92,0.10)",
      "rgba(217,255,92,0.22)",
    ]
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 text-ink-dim">
        <Trash2 className="h-5 w-5 text-red-300/80" />
        <Check className="h-5 w-5 text-lime" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) onDelete();
          else if (info.offset.x > 70) onToggle();
        }}
        style={{ x, backgroundColor: bg }}
        className={cn(
          "glass relative flex items-center gap-3 rounded-2xl p-4 cursor-grab active:cursor-grabbing",
          item.done && "opacity-50"
        )}
      >
        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
            item.done
              ? "border-lime bg-lime text-bg"
              : "border-white/15"
          )}
        >
          {item.done && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>
        <p
          className={cn(
            "flex-1 text-sm",
            item.done ? "line-through text-ink-dim" : "text-ink"
          )}
        >
          {item.nome}
        </p>
      </motion.div>
    </div>
  );
}
