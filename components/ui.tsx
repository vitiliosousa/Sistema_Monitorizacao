import type { ReactNode } from "react";

export const COR = {
  ren: "#059669",
  bat: "#2563eb",
  edm: "#d97706",
  carga: "#475569",
} as const;

export function Cartao({
  titulo,
  accao,
  children,
  className = "",
}: {
  titulo?: string;
  accao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {(titulo || accao) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {titulo && <h2 className="text-sm font-semibold text-slate-800">{titulo}</h2>}
          {accao}
        </header>
      )}
      {children}
    </section>
  );
}

/** Círculo cheio = valor medido; círculo vazio = valor estimado. */
export function Origem({ tipo }: { tipo: "medida" | "estimada" }) {
  const medida = tipo === "medida";
  return (
    <span
      title={medida ? "Valor medido" : "Valor estimado"}
      aria-label={medida ? "Valor medido" : "Valor estimado"}
      className={`inline-block size-2 shrink-0 rounded-full border border-slate-500 ${
        medida ? "bg-slate-500" : "bg-transparent"
      }`}
    />
  );
}

export function Valor({
  rotulo,
  valor,
  unidade,
  origem,
}: {
  rotulo: string;
  valor: string;
  unidade?: string;
  origem?: "medida" | "estimada";
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {origem && <Origem tipo={origem} />}
        <span className="truncate">{rotulo}</span>
      </div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">
        {valor}
        {unidade && <span className="ml-1 text-sm font-normal text-slate-500">{unidade}</span>}
      </div>
    </div>
  );
}
