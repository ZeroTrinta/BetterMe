"use client";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, children, className }: Props) {
  // Trava scroll do body quando aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — z-[55] cobre o BottomNav (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-bg/70 backdrop-blur-md"
          />

          {/* Sheet — z-60 fica acima do BottomNav (z-50) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md rounded-t-3xl",
              "glass-strong border-t border-white/10",
              "max-h-[92vh] overflow-y-auto",
              className
            )}
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-bg-surface/60 pt-3 pb-2 backdrop-blur-md">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div
              className="px-5"
              style={{
                paddingBottom: "calc(2rem + env(safe-area-inset-bottom))",
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
