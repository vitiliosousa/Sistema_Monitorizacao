import { estadoBateria, razaoDaFonte } from "@/lib/derivados";
import { energia, num } from "@/lib/format";
import { NOMES_FONTE, RELE_FONTE, SOC_MINIMO, SOC_RETOMA, type Balanco } from "@/lib/types";
import { Cartao, COR, Origem, Valor } from "./ui";

const COR_FONTE = { 1: COR.ren, 2: COR.bat, 3: COR.edm } as const;

export function FonteActiva({ dados }: { dados: Balanco | null }) {
  return (
    <Cartao titulo="Fonte activa">
      {dados ? (
        <div className="flex items-start gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
            style={{ background: COR_FONTE[dados.fonte] }}
          >
            {RELE_FONTE[dados.fonte]}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-slate-900">{NOMES_FONTE[dados.fonte]}</div>
            <div className="text-xs text-slate-500">
              Relé {RELE_FONTE[dados.fonte]} fechado · modo{" "}
              <strong className="text-slate-700">
                {dados.modo === "AUTO" ? "automático" : "manual"}
              </strong>
            </div>
            <p className="mt-1.5 text-sm text-slate-700">{razaoDaFonte(dados)}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">A aguardar dados…</p>
      )}
    </Cartao>
  );
}

export function Medicoes({ dados }: { dados: Balanco | null }) {
  const d = dados;
  const dash = "—";
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Cartao titulo="Geração renovável">
        <div className="grid grid-cols-3 gap-3">
          <Valor rotulo="Tensão" valor={d ? num(d.v_ren, 2) : dash} unidade="V" origem="medida" />
          <Valor rotulo="Corrente" valor={d ? num(d.i_ren, 2) : dash} unidade="A" origem="medida" />
          <Valor rotulo="Potência" valor={d ? num(d.p_ren, 1) : dash} unidade="W" origem="medida" />
        </div>
        {d && !d.ok_ren && <p className="mt-2 text-xs text-amber-700">Sensor sem leitura</p>}
      </Cartao>

      <Cartao titulo="Bateria">
        <div className="grid grid-cols-3 gap-3">
          <Valor rotulo="Tensão" valor={d ? num(d.v_bat, 2) : dash} unidade="V" origem="medida" />
          <Valor rotulo="Corrente" valor={d ? num(d.i_bat, 2) : dash} unidade="A" origem="medida" />
          <Valor rotulo="Potência" valor={d ? num(d.p_bat, 1) : dash} unidade="W" origem="medida" />
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Origem tipo="estimada" />
              Estado de carga (SoC)
            </span>
            <span>{d ? (d.ok_bat ? estadoBateria(d) : "sem leitura") : dash}</span>
          </div>
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${d ? d.soc : 0}%`,
                background: d && d.soc <= SOC_MINIMO ? "#dc2626" : COR.bat,
              }}
            />
            {[SOC_MINIMO, SOC_RETOMA].map((l) => (
              <div
                key={l}
                className="absolute inset-y-0 w-px bg-slate-700/60"
                style={{ left: `${l}%` }}
                title={`Limite ${l} %`}
              />
            ))}
          </div>
          <div className="relative mt-0.5 h-4 text-[10px] text-slate-500">
            <span className="absolute -translate-x-1/2" style={{ left: `${SOC_MINIMO}%` }}>
              {SOC_MINIMO} %
            </span>
            <span className="absolute -translate-x-1/2" style={{ left: `${SOC_RETOMA}%` }}>
              {SOC_RETOMA} %
            </span>
          </div>
          <div className="text-2xl font-semibold tabular-nums text-slate-900">
            {d ? num(d.soc, 0) : dash}
            <span className="ml-1 text-sm font-normal text-slate-500">%</span>
          </div>
        </div>
      </Cartao>

      <Cartao titulo="Carga">
        <div className="grid grid-cols-2 gap-3">
          <Valor rotulo="Potência" valor={d ? num(d.p_carga, 0) : dash} unidade="W" origem="estimada" />
          <Valor rotulo="Energia acumulada" valor={d ? energia(d.e_carga) : dash} origem="estimada" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sem medidor AC no protótipo: a potência é a indicada pelo utilizador.
        </p>
      </Cartao>
    </div>
  );
}
