import { energia, num } from "@/lib/format";
import type { Balanco } from "@/lib/types";
import { Cartao, COR, Valor } from "./ui";

export function BalancoEnergia({ dados }: { dados: Balanco | null }) {
  const d = dados;
  const dash = "—";
  const total = d?.e_carga ?? 0;
  const partes = d
    ? [
        { nome: "Renováveis", wh: d.e_ren_util, cor: COR.ren },
        { nome: "Bateria", wh: d.e_bat_forn, cor: COR.bat },
        { nome: "EDM", wh: d.e_edm, cor: COR.edm },
      ]
    : [];

  return (
    <Cartao titulo="Balanço de energia">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Valor rotulo="Gerada (renováveis)" valor={d ? energia(d.e_ren_ger) : dash} origem="medida" />
        <Valor rotulo="Entregue à carga" valor={d ? energia(d.e_carga) : dash} origem="estimada" />
        <Valor rotulo="Fracção renovável directa" valor={d ? num(d.fr_directa, 1) : dash} unidade="%" origem="estimada" />
        <Valor rotulo="Fracção renovável total" valor={d ? num(d.fr_total, 1) : dash} unidade="%" origem="estimada" />
      </div>

      <div className="mt-4">
        <div className="mb-1 text-xs text-slate-500">Origem da energia da carga</div>
        <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
          {partes.map((p) =>
            total > 0 ? (
              <div key={p.nome} style={{ width: `${(p.wh / total) * 100}%`, background: p.cor }} title={`${p.nome}: ${energia(p.wh)}`} />
            ) : null,
          )}
        </div>
        <ul className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
          {partes.map((p) => (
            <li key={p.nome} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: p.cor }} />
              {p.nome}: <strong className="tabular-nums text-slate-800">{energia(p.wh)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 text-sm text-slate-700">
        Redução da energia da EDM:{" "}
        <strong className="tabular-nums">{d ? `${num(d.r_edm, 1)} %` : dash}</strong>
      </div>
    </Cartao>
  );
}
