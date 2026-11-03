"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMonitorContext } from "./MonitorProvider";

const PAGINAS = [
  { href: "/", nome: "Visão geral" },
  { href: "/graficos", nome: "Gráficos" },
  { href: "/energia", nome: "Energia" },
  { href: "/controlo", nome: "Controlo" },
  { href: "/sistema", nome: "Sistema" },
];

function Estado({ ok, aviso, texto }: { ok: boolean; aviso?: boolean; texto: string }) {
  const cor = ok ? "bg-emerald-500" : aviso ? "bg-amber-500" : "bg-red-500";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
      <span className={`size-2 rounded-full ${cor}`} />
      {texto}
    </span>
  );
}

export function Navegacao() {
  const pathname = usePathname();
  const { wsLigado, esp, alarmes } = useMonitorContext();
  const avisos = alarmes.filter((a) => a.nivel !== "informacao").length;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            ⚡
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Sistema híbrido de energia</div>
            <div className="text-[11px] text-slate-500">Renováveis · Bateria · EDM</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Estado ok={wsLigado} texto={wsLigado ? "Servidor ligado" : "Servidor desligado"} />
          <Estado
            ok={esp === "online"}
            aviso={esp === "sem-dados"}
            texto={`ESP32 ${esp === "online" ? "online" : esp === "offline" ? "offline" : "sem dados"}`}
          />
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              avisos > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
            }`}
            aria-label={`${avisos} avisos activos`}
          >
            {avisos} {avisos === 1 ? "aviso" : "avisos"}
          </Link>
        </div>

        <nav aria-label="Páginas" className="-mx-1 flex w-full gap-1 overflow-x-auto px-1">
          {PAGINAS.map((p) => {
            const activa = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-current={activa ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activa ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.nome}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
