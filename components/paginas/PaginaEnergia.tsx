"use client";

import { BalancoEnergia } from "../BalancoEnergia";
import { useMonitorContext } from "../MonitorProvider";
import { Cartao } from "../ui";

export function PaginaEnergia() {
  const { ultima } = useMonitorContext();
  return (
    <div className="flex flex-col gap-4">
      <BalancoEnergia dados={ultima} />
      <Cartao titulo="Como ler estes valores">
        <p className="text-sm text-slate-600">
          No protótipo actual não há medidor na carga: a potência da carga é a que o utilizador indica, por isso a
          energia da carga, da EDM e a fracção renovável são <strong>estimadas</strong>. A energia gerada pelas
          renováveis é <strong>medida</strong>. Com um medidor AC nos terminais da carga, o balanço passa a ser
          totalmente medido.
        </p>
      </Cartao>
    </div>
  );
}
