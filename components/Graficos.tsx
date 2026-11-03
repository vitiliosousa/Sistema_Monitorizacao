"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { hora, num } from "@/lib/format";
import { JANELA_GRAFICO_MS, RELE_FONTE, SOC_MINIMO, SOC_RETOMA, type Balanco } from "@/lib/types";
import { Cartao, COR } from "./ui";

const EIXO = { fontSize: 11, fill: "#64748b" } as const;
/** Marcas fixas e únicas: com o intervalo curto do início, o Recharts repetia marcas. */
function eixoX(dados: Balanco[]) {
  const ini = dados.length ? dados[0].ts : 0;
  const fim = dados.length ? dados[dados.length - 1].ts : 0;
  const ticks = Array.from(new Set([0, 1, 2, 3, 4].map((i) => Math.round(ini + ((fim - ini) * i) / 4))));
  return {
    dataKey: "ts",
    type: "number" as const,
    domain: [ini, fim] as [number, number],
    ticks,
    tickFormatter: (v: number) => hora(v),
    tick: EIXO,
  };
}

function Vazio() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      A aguardar dados…
    </div>
  );
}

export function Graficos({ historico }: { historico: Balanco[] }) {
  const fim = historico.length ? historico[historico.length - 1].ts : 0;
  const dados = historico.filter((p) => p.ts >= fim - JANELA_GRAFICO_MS);
  const eixo = eixoX(dados);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Cartao titulo="Potência (últimos 5 min)" className="lg:col-span-2">
        <div className="h-64">
          {dados.length < 2 ? (
            <Vazio />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados} syncId="tempo" margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis {...eixo} />
                <YAxis tick={EIXO} unit=" W" width={56} />
                <Tooltip
                  labelFormatter={(v) => hora(Number(v))}
                  formatter={(v, nome) => [`${num(Number(v), 1)} W`, nome]}
                />
                <Line name="Geração" dataKey="p_ren" stroke={COR.ren} dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line name="Bateria" dataKey="p_bat" stroke={COR.bat} dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line name="Carga" dataKey="p_carga" stroke={COR.carga} dot={false} strokeWidth={2} strokeDasharray="5 4" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <Legenda
          itens={[
            ["Geração", COR.ren],
            ["Bateria (+ carrega, − descarrega)", COR.bat],
            ["Carga (estimada)", COR.carga],
          ]}
        />
      </Cartao>

      <Cartao titulo="Fonte activa ao longo do tempo">
        <div className="h-44">
          {dados.length < 2 ? (
            <Vazio />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dados} syncId="tempo" margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis {...eixo} />
                <YAxis
                  tick={EIXO}
                  domain={[0.5, 3.5]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v: number) => RELE_FONTE[v as 1 | 2 | 3]}
                  width={56}
                />
                <Tooltip
                  labelFormatter={(v) => hora(Number(v))}
                  formatter={(v) => [RELE_FONTE[Number(v) as 1 | 2 | 3], "Relé"]}
                />
                <Area
                  dataKey="fonte"
                  type="stepAfter"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Cartao>

      <Cartao titulo="Estado de carga (SoC)">
        <div className="h-44">
          {dados.length < 2 ? (
            <Vazio />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados} syncId="tempo" margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis {...eixo} />
                <YAxis tick={EIXO} domain={[0, 100]} unit=" %" width={56} />
                <Tooltip
                  labelFormatter={(v) => hora(Number(v))}
                  formatter={(v) => [`${num(Number(v), 1)} %`, "SoC"]}
                />
                <ReferenceLine y={SOC_MINIMO} stroke="#dc2626" strokeDasharray="4 3" label={{ value: `${SOC_MINIMO} %`, fontSize: 10, fill: "#dc2626", position: "insideTopRight" }} />
                <ReferenceLine y={SOC_RETOMA} stroke="#d97706" strokeDasharray="4 3" label={{ value: `${SOC_RETOMA} %`, fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                <Line dataKey="soc" stroke={COR.bat} dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Cartao>
    </div>
  );
}

function Legenda({ itens }: { itens: [string, string][] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {itens.map(([nome, cor]) => (
        <li key={nome} className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: cor }} />
          {nome}
        </li>
      ))}
    </ul>
  );
}
