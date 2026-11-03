"use client";

import { hora } from "@/lib/format";
import { useMonitorContext } from "../MonitorProvider";
import { Registo } from "../Registo";
import { Cartao } from "../ui";

const TOPICOS = [
  ["escn/balanco", "Dados do ESP32 (JSON, publicado periodicamente)"],
  ["escn/status", "online ou offline (última vontade do MQTT)"],
  ["escn/cmd/modo", "AUTO ou MANUAL"],
  ["escn/cmd/fonte", "K1, K2 ou K3"],
  ["escn/cmd/carga", "Potência da carga, em W"],
];

export function PaginaSistema() {
  const { wsLigado, esp, ultima, historico, registo } = useMonitorContext();
  const linhas = [
    ["Servidor (WebSocket)", wsLigado ? "ligado" : "desligado"],
    ["ESP32", esp === "online" ? "online" : esp === "offline" ? "offline" : "sem dados"],
    ["Última mensagem", ultima ? hora(ultima.ts) : "—"],
    ["Pontos guardados", `${historico.length} de 2000`],
    ["Origem dos dados", "Simulação (modo demonstração)"],
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Estado da ligação">
          <dl className="divide-y divide-slate-100 text-sm">
            {linhas.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Cartao>
        <Cartao titulo="Tópicos MQTT">
          <ul className="divide-y divide-slate-100 text-sm">
            {TOPICOS.map(([t, d]) => (
              <li key={t} className="py-2">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{t}</code>
                <div className="mt-0.5 text-xs text-slate-500">{d}</div>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>
      <Registo registo={registo} />
    </div>
  );
}
