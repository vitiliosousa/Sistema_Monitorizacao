"use client";

import { Alarmes } from "../Alarmes";
import { EsquemaFluxo } from "../EsquemaFluxo";
import { FonteActiva, Medicoes } from "../Medicoes";
import { useMonitorContext } from "../MonitorProvider";
import { Cartao, Origem } from "../ui";

export function VisaoGeral() {
  const { ultima, alarmes } = useMonitorContext();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <Cartao titulo="Esquema de fluxo" className="lg:col-span-3">
          <EsquemaFluxo dados={ultima} />
          <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Origem tipo="medida" /> medido</span>
            <span className="flex items-center gap-1.5"><Origem tipo="estimada" /> estimado</span>
          </p>
        </Cartao>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <FonteActiva dados={ultima} />
          <Alarmes alarmes={alarmes} />
        </div>
      </div>
      <Medicoes dados={ultima} />
    </div>
  );
}
