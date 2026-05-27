"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface UIState {
  /** Algum bottom sheet está aberto? */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

const UIContext = createContext<UIState>({
  sheetOpen: false,
  setSheetOpen: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <UIContext.Provider value={{ sheetOpen, setSheetOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
