"use client";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * BottomSheet com 2 snap points controlados via `top`:
 *   - "half"  → top: 40dvh  (ocupa 60% inferior da tela)
 *   - "full"  → top: 5dvh   (ocupa 95% da tela)
 *
 * Implementação:
 *   - `position: fixed` com `top` animado, `bottom: 0`
 *   - Drag handler funciona em qualquer parte do header (alça + título)
 *   - Conteúdo interno tem `overflow-y-auto` próprio
 *   - dvh em vez de vh para respeitar a barra de navegação móvel
 */
export function BottomSheet({ open, onClose, children, className }: Props) {
  const [snap, setSnap] = useState<"half" | "full">("half");

  useEffect(() => {
    if (open) {
      setSnap("half");
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y > 100 || velocity.y > 500) {
      if (snap === "full") setSnap("half");
      else onClose();
    } else if (offset.y < -60 || velocity.y < -500) {
      if (snap === "half") setSnap("full");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-bg/70 backdrop-blur-md"
          />

          {/* Sheet container — top animado */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              top: snap === "full" ? "5dvh" : "40dvh",
            }}
            exit={{ y: "100%", transition: { duration: 0.25 } }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-w-md flex-col rounded-t-3xl",
              "glass-strong border-t border-white/10",
              "shadow-[0_-12px_40px_rgba(0,0,0,0.4)]",
              className
            )}
          >
            {/* Header arrastável: alça + área de toque */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.4 }}
              onDragEnd={handleDragEnd}
              onClick={() => setSnap(snap === "half" ? "full" : "half")}
              className="flex shrink-0 cursor-grab flex-col items-center pt-3 pb-2 active:cursor-grabbing touch-none"
            >
              <div className="h-1.5 w-12 rounded-full bg-white/30 transition-colors hover:bg-white/50" />
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-ink-mute">
                {snap === "half" ? "puxe pra ver tudo" : "arraste pra baixo"}
              </p>
            </motion.div>

            {/* Área de conteúdo com scroll próprio */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2"
              style={{
                paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
