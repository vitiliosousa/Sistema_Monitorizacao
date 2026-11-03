import type { Alarme, NivelAlarme } from "@/lib/types";
import { Cartao } from "./ui";

const ESTILO: Record<NivelAlarme, { rotulo: string; classe: string }> = {
  informacao: { rotulo: "Informação", classe: "bg-sky-100 text-sky-800" },
  aviso: { rotulo: "Aviso", classe: "bg-amber-100 text-amber-800" },
  critico: { rotulo: "Crítico", classe: "bg-red-100 text-red-800" },
};

const PREVISTOS = ["Limiares eléctricos (sobretensão, subtensão, sobrecorrente)", "Notificações fora do website"];

export function Alarmes({ alarmes }: { alarmes: Alarme[] }) {
  return (
    <Cartao titulo={`Avisos (${alarmes.length})`}>
      {alarmes.length === 0 ? (
        <p className="text-sm text-slate-500">Sem alarmes activos.</p>
      ) : (
        <ul className="space-y-2">
          {alarmes.map((a) => (
            <li key={a.id} className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-2.5">
              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${ESTILO[a.nivel].classe}`}>
                {ESTILO[a.nivel].rotulo}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">{a.titulo}</div>
                <div className="text-xs text-slate-600">{a.detalhe}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <details className="mt-3 text-xs text-slate-500">
        <summary className="cursor-pointer">Alarmes previstos (a acrescentar)</summary>
        <ul className="mt-1.5 list-disc pl-5">
          {PREVISTOS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </details>
    </Cartao>
  );
}
