"use client";

import { useMonitorContext } from "./MonitorProvider";

export function AvisoSemDados() {
  const { esp } = useMonitorContext();
  if (esp !== "sem-dados") return null;
  return (
    <div role="alert" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      Sem dados: não chega nenhuma mensagem há mais de 15 s. Os valores abaixo podem estar desactualizados.
    </div>
  );
}
