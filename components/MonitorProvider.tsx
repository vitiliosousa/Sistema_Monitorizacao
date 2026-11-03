"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMonitor } from "@/lib/useMonitor";

type Monitor = ReturnType<typeof useMonitor>;

const MonitorContext = createContext<Monitor | null>(null);

/** Mantém um único simulador vivo enquanto o utilizador navega entre páginas. */
export function MonitorProvider({ children }: { children: ReactNode }) {
  const monitor = useMonitor();
  return <MonitorContext.Provider value={monitor}>{children}</MonitorContext.Provider>;
}

export function useMonitorContext(): Monitor {
  const ctx = useContext(MonitorContext);
  if (!ctx) throw new Error("useMonitorContext fora do MonitorProvider");
  return ctx;
}
