"use client";

import { Graficos } from "../Graficos";
import { useMonitorContext } from "../MonitorProvider";

export function PaginaGraficos() {
  const { historico, exportarCsv } = useMonitorContext();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          O website guarda os últimos 2000 pontos enquanto estiver aberto.
        </p>
        <button
          onClick={exportarCsv}
          disabled={historico.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Exportar CSV ({historico.length} pontos)
        </button>
      </div>
      <Graficos historico={historico} />
    </div>
  );
}
