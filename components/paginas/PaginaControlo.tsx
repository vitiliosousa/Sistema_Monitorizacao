"use client";

import { Comandos } from "../Comandos";
import { FonteActiva } from "../Medicoes";
import { useMonitorContext } from "../MonitorProvider";
import { Cartao } from "../ui";

const REGRAS = [
  "Ao trocar de fonte, os três relés abrem, esperam 200 ms e só então fecha o escolhido (interbloqueio).",
  "Tempo mínimo de 10 s entre trocas; a saída da bateria no mínimo é imediata.",
  "Em modo manual, o ESP32 recusa a bateria se o SoC estiver no mínimo ou o sensor falhar.",
  "Falha de sensor: a fonte associada deixa de ser usada e a carga passa para a EDM.",
  "Sem Wi-Fi ou servidor, o controlo dos relés continua a funcionar localmente.",
];

export function PaginaControlo() {
  const { ultima, wsLigado, esp, comando, enviarComando } = useMonitorContext();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <FonteActiva dados={ultima} />
        <Comandos dados={ultima} ligado={wsLigado && esp !== "offline"} comando={comando} enviar={enviarComando} />
      </div>
      <Cartao titulo="Regras de segurança do ESP32">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {REGRAS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Cartao>
    </div>
  );
}
