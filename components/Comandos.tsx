"use client";

import { useState } from "react";
import { descreverComando } from "@/lib/derivados";
import type { ComandoEnviado } from "@/lib/useMonitor";
import { NOMES_FONTE, RELE_FONTE, type Balanco, type Comando, type Fonte } from "@/lib/types";
import { Cartao } from "./ui";

const botao =
  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const activo = "border-slate-900 bg-slate-900 text-white";
const inactivo = "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

export function Comandos({
  dados,
  ligado,
  comando,
  enviar,
}: {
  dados: Balanco | null;
  ligado: boolean;
  comando: ComandoEnviado | null;
  enviar: (c: Comando) => boolean;
}) {
  const [carga, setCarga] = useState("40");
  const manual = dados?.modo === "MANUAL";
  const desligado = !ligado || !dados;
  const watts = Number(carga);
  const cargaValida = carga.trim() !== "" && Number.isFinite(watts) && watts >= 0 && watts <= 500;

  return (
    <Cartao titulo="Comandos">
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 text-xs text-slate-500">Modo</div>
          <div className="flex gap-2">
            {(["AUTO", "MANUAL"] as const).map((m) => (
              <button
                key={m}
                disabled={desligado}
                onClick={() => enviar({ tipo: "modo", modo: m })}
                className={`${botao} ${dados?.modo === m ? activo : inactivo}`}
              >
                {m === "AUTO" ? "Automático" : "Manual"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs text-slate-500">
            Fonte {manual ? "" : "(só em modo manual)"}
          </div>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3] as Fonte[]).map((f) => (
              <button
                key={f}
                disabled={desligado || !manual}
                onClick={() => enviar({ tipo: "fonte", fonte: f })}
                className={`${botao} ${dados?.fonte === f ? activo : inactivo}`}
              >
                {RELE_FONTE[f]} · {NOMES_FONTE[f]}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (cargaValida) enviar({ tipo: "carga", watts });
          }}
        >
          <label className="text-xs text-slate-500">
            Potência da carga de ensaio (W)
            <input
              type="number"
              min={0}
              max={500}
              step={1}
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
              className="mt-1.5 block w-32 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900"
            />
          </label>
          <button type="submit" disabled={desligado || !cargaValida} className={`${botao} ${inactivo}`}>
            Enviar
          </button>
        </form>

        <Confirmacao comando={comando} ligado={ligado} />
      </div>
    </Cartao>
  );
}

function Confirmacao({ comando, ligado }: { comando: ComandoEnviado | null; ligado: boolean }) {
  if (!ligado) {
    return <p className="text-xs text-amber-700">Sem ligação: os comandos não podem ser enviados.</p>;
  }
  if (!comando) {
    return <p className="text-xs text-slate-500">Os comandos só ficam confirmados quando o ESP32 os reflecte na mensagem seguinte.</p>;
  }
  const { resultado } = comando;
  const estilo =
    resultado.estado === "confirmado"
      ? "bg-emerald-50 text-emerald-800"
      : resultado.estado === "recusado"
        ? "bg-red-50 text-red-800"
        : "bg-slate-100 text-slate-700";
  const texto =
    resultado.estado === "confirmado"
      ? "confirmado pelo ESP32"
      : resultado.estado === "recusado"
        ? `recusado (${resultado.motivo})`
        : "a aguardar confirmação do ESP32…";
  return (
    <p className={`rounded-lg px-3 py-2 text-xs ${estilo}`} role="status">
      {descreverComando(comando.comando)}: {texto}
    </p>
  );
}
