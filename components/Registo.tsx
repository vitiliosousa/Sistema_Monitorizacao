import { hora } from "@/lib/format";
import type { EntradaRegisto } from "@/lib/useMonitor";
import { Cartao } from "./ui";

export function Registo({ registo }: { registo: EntradaRegisto[] }) {
  return (
    <Cartao titulo="Registo (últimas 12 mensagens)">
      {registo.length === 0 ? (
        <p className="text-sm text-slate-500">Sem mensagens.</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-auto font-mono text-[11px] leading-snug text-slate-700">
          {registo.map((r) => (
            <li key={r.ts} className="break-all rounded bg-slate-50 px-2 py-1">
              <span className="text-slate-500">{hora(r.ts)}</span>{" "}
              <span className="font-semibold">{r.topico}</span> {r.payload}
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}
