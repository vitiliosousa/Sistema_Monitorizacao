import { num } from "@/lib/format";
import type { Balanco, Fonte } from "@/lib/types";
import { COR } from "./ui";

const FONTES: { fonte: Fonte; nome: string; rele: string; y: number; cor: string }[] = [
  { fonte: 1, nome: "Renováveis", rele: "K1", y: 20, cor: COR.ren },
  { fonte: 2, nome: "Bateria", rele: "K2", y: 110, cor: COR.bat },
  { fonte: 3, nome: "EDM", rele: "K3", y: 200, cor: COR.edm },
];

const caminhoDe = (y: number) => `M160,${y + 35} H240 M300,${y + 35} H400 V145 H470`;

export function EsquemaFluxo({ dados }: { dados: Balanco | null }) {
  const activa = dados?.fonte;
  const potencia = (f: Fonte) => {
    if (!dados) return "";
    if (f === 1) return `${num(dados.p_ren, 1)} W`;
    if (f === 2) return `${num(dados.p_bat, 1)} W`;
    return "rede";
  };

  return (
    <svg
      viewBox="0 0 660 290"
      role="img"
      aria-label={
        activa ? `Fonte activa: relé K${activa} a alimentar a carga` : "Esquema de fluxo de energia"
      }
      className="h-auto w-full"
    >
      {FONTES.map(({ fonte, y }) => (
        <path key={fonte} d={caminhoDe(y)} fill="none" stroke="#cbd5e1" strokeWidth={3} strokeLinejoin="round" />
      ))}
      {FONTES.filter((f) => f.fonte === activa).map(({ fonte, y, cor }) => (
        <path key={fonte} d={caminhoDe(y)} fill="none" stroke={cor} strokeWidth={4} strokeLinejoin="round" className="fluxo" />
      ))}
      {FONTES.map(({ fonte, nome, rele, y, cor }) => {
        const on = activa === fonte;
        const cy = y + 35;
        return (
          <g key={fonte}>
            <rect
              x={20}
              y={y}
              width={140}
              height={70}
              rx={10}
              fill="#fff"
              stroke={on ? cor : "#cbd5e1"}
              strokeWidth={on ? 3 : 1.5}
            />
            <text x={90} y={y + 30} textAnchor="middle" fontSize={15} fontWeight={600} fill="#0f172a">
              {nome}
            </text>
            <text x={90} y={y + 52} textAnchor="middle" fontSize={13} fill="#64748b">
              {potencia(fonte)}
            </text>
            <rect
              x={240}
              y={cy - 18}
              width={60}
              height={36}
              rx={8}
              fill={on ? cor : "#f1f5f9"}
              stroke={on ? cor : "#cbd5e1"}
              strokeWidth={1.5}
            />
            <text
              x={270}
              y={cy + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill={on ? "#fff" : "#64748b"}
            >
              {rele}
            </text>
            <text x={270} y={cy - 24} textAnchor="middle" fontSize={11} fill={on ? cor : "#94a3b8"}>
              {on ? "fechado" : "aberto"}
            </text>
          </g>
        );
      })}
      <rect x={470} y={95} width={170} height={100} rx={12} fill="#fff" stroke={COR.carga} strokeWidth={2} />
      <text x={555} y={130} textAnchor="middle" fontSize={16} fontWeight={600} fill="#0f172a">
        Carga
      </text>
      <text x={555} y={156} textAnchor="middle" fontSize={20} fontWeight={600} fill="#0f172a">
        {dados ? `${num(dados.p_carga, 0)} W` : "—"}
      </text>
      <text x={555} y={178} textAnchor="middle" fontSize={11} fill="#64748b">
        ○ estimada
      </text>
    </svg>
  );
}
