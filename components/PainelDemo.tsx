"use client";

import { useState } from "react";
import type { CenarioSimulacao } from "@/lib/simulator";
import { useMonitorContext } from "./MonitorProvider";

const VELOCIDADES = [1, 10, 60, 300];

/** Botão flutuante com os controlos da simulação; só serve para demonstração. */
export function PainelDemo() {
  const [aberto, setAberto] = useState(false);
  const { cenario, setCenario, espOffline, setEspOffline, wsDesligado, setWsDesligado } =
    useMonitorContext();
  const alt = (p: Partial<CenarioSimulacao>) => setCenario((c) => ({ ...c, ...p }));
  const caixa = "flex items-center gap-2 text-sm text-slate-700";

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {aberto && (
        <div
          role="dialog"
          aria-label="Controlos da simulação"
          className="w-72 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
        >
          <div className="text-sm font-semibold text-slate-800">Simulação (demonstração)</div>

          <div>
            <div className="mb-1.5 text-xs text-slate-500">Velocidade (× tempo real)</div>
            <div className="flex flex-wrap gap-1.5">
              {VELOCIDADES.map((v) => (
                <button
                  key={v}
                  onClick={() => alt({ velocidade: v })}
                  className={`rounded-lg border px-2.5 py-1 text-sm ${
                    cenario.velocidade === v
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {v}×
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={caixa}>
              <input type="checkbox" checked={cenario.solAutomatico} onChange={(e) => alt({ solAutomatico: e.target.checked })} />
              Ciclo dia/noite automático
            </label>
            <label className="mt-2 block text-xs text-slate-500">
              Sol manual: {Math.round(cenario.sol * 100)} %
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={cenario.sol}
                disabled={cenario.solAutomatico}
                onChange={(e) => alt({ sol: Number(e.target.value) })}
                className="mt-1 block w-full disabled:opacity-40"
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className={caixa}>
              <input type="checkbox" checked={cenario.falhaGeracao} onChange={(e) => alt({ falhaGeracao: e.target.checked })} />
              Falha do sensor da geração
            </label>
            <label className={caixa}>
              <input type="checkbox" checked={cenario.falhaBateria} onChange={(e) => alt({ falhaBateria: e.target.checked })} />
              Falha do sensor da bateria
            </label>
            <label className={caixa}>
              <input type="checkbox" checked={espOffline} onChange={(e) => setEspOffline(e.target.checked)} />
              ESP32 offline
            </label>
            <label className={caixa}>
              <input type="checkbox" checked={wsDesligado} onChange={(e) => setWsDesligado(e.target.checked)} />
              WebSocket desligado
            </label>
          </div>
        </div>
      )}
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-violet-700"
      >
        {aberto ? "Fechar simulação" : "Simulação"}
      </button>
    </div>
  );
}
