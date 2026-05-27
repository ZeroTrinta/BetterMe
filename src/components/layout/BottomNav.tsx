"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Utensils, Dumbbell, ShoppingBag, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/ui-context";

const items = [
  { href: "/", label: "Hub", icon: Home },
  { href: "/dieta", label: "Dieta", icon: Utensils },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/mercado", label: "Mercado", icon: ShoppingBag },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { sheetOpen } = useUI();

  return (
    <AnimatePresence>
      {!sheetOpen && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4 pb-safe"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="glass-strong mx-2 mb-2 flex items-center justify-around rounded-full p-2 shadow-2xl">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="relative flex h-12 w-12 items-center justify-center"
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-lime/15"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative h-5 w-5 transition-colors",
                      active ? "text-lime" : "text-ink-dim"
                    )}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
