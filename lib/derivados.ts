import type { Alarme, Balanco, Comando, EstadoEsp } from "./types";
import { NOMES_FONTE, RELE_FONTE, SOC_MINIMO, SOC_RETOMA } from "./types";

export function estadoBateria(b: Balanco): "a carregar" | "a descarregar" | "em repouso" {
  if (!b.ok_bat) return "em repouso";
  if (b.i_bat > 0.05) return "a carregar";
  if (b.i_bat < -0.05) return "a descarregar";
  return "em repouso";
}

/** A mensagem não traz o motivo; o website deduz-o das regras da secção 5.2. */
export function razaoDaFonte(b: Balanco): string {
  if (b.modo === "MANUAL") {
    const pedido = `Modo manual: ${RELE_FONTE[b.fonte]} escolhido pelo utilizador`;
    if (b.fonte === 3 && b.soc <= SOC_MINIMO) {
      return "Modo manual: a bateria foi recusada (SoC no mínimo) ou a fonte pedida não está disponível";
    }
    return pedido;
  }
  if (b.fonte === 1) return "Potência renovável cobre a carga";
  if (b.fonte === 2) return `Renováveis insuficientes e SoC acima de ${SOC_RETOMA} % (sai a ${SOC_MINIMO} %)`;
  if (!b.ok_bat && !b.ok_ren) return "Sensores de geração e bateria sem leitura";
  if (!b.ok_bat) return "Sensor da bateria sem leitura";
  if (b.soc <= SOC_RETOMA) return `Bateria abaixo de ${SOC_RETOMA} % de SoC; renováveis insuficientes`;
  return "Renováveis e bateria não servem; retaguarda da rede";
}

export function calcularAlarmes(args: {
  ultima: Balanco | null;
  esp: EstadoEsp;
  wsLigado: boolean;
}): Alarme[] {
  const { ultima, esp, wsLigado } = args;
  const lista: Alarme[] = [];
  if (!wsLigado) {
    lista.push({
      id: "ws",
      nivel: "aviso",
      titulo: "Sem ligação ao servidor",
      detalhe: "WebSocket desligado; o website tenta religar de 3 em 3 s.",
    });
  }
  if (esp === "offline") {
    lista.push({
      id: "esp-offline",
      nivel: "aviso",
      titulo: "ESP32 offline",
      detalhe: "escn/status = offline. Os relés continuam comandados localmente.",
    });
  }
  if (esp === "sem-dados") {
    lista.push({
      id: "sem-dados",
      nivel: "aviso",
      titulo: "Dados desactualizados",
      detalhe: "Sem mensagem há mais de 15 s; os valores podem estar desactualizados.",
    });
  }
  if (ultima) {
    if (!ultima.ok_ren) {
      lista.push({
        id: "ok-ren",
        nivel: "aviso",
        titulo: "Sensor da geração sem leitura",
        detalhe: "Assume-se sem geração; as renováveis não são usadas.",
      });
    }
    if (!ultima.ok_bat) {
      lista.push({
        id: "ok-bat",
        nivel: "aviso",
        titulo: "Sensor da bateria sem leitura",
        detalhe: "A bateria deixa de ser usada; a carga passa para a EDM de imediato.",
      });
    }
    if (ultima.ok_bat && ultima.soc <= SOC_MINIMO) {
      lista.push({
        id: "bat-min",
        nivel: "aviso",
        titulo: "Bateria no mínimo",
        detalhe: `SoC igual ou abaixo de ${SOC_MINIMO} %; só volta a ser usada acima de ${SOC_RETOMA} %.`,
      });
    }
    if (ultima.fonte === 3) {
      lista.push({
        id: "carga-edm",
        nivel: "informacao",
        titulo: "Carga na EDM",
        detalhe: "A carga está a ser alimentada pela rede (K3).",
      });
    }
  }
  return lista;
}

export type ResultadoComando =
  | { estado: "pendente" }
  | { estado: "confirmado" }
  | { estado: "recusado"; motivo: string };

export function descreverComando(c: Comando): string {
  if (c.tipo === "modo") return `Modo ${c.modo === "AUTO" ? "automático" : "manual"}`;
  if (c.tipo === "fonte") return `${RELE_FONTE[c.fonte]} · ${NOMES_FONTE[c.fonte]}`;
  return `Carga de ${c.watts} W`;
}

/** Compara o comando enviado com o que o ESP32 reporta, para dar a confirmação. */
export function avaliarComando(
  c: Comando,
  b: Balanco,
  enviadoEm: number,
): ResultadoComando {
  if (c.tipo === "modo") {
    return b.modo === c.modo ? { estado: "confirmado" } : { estado: "pendente" };
  }
  if (c.tipo === "carga") {
    return Math.abs(b.p_carga - c.watts) < 0.5 ? { estado: "confirmado" } : { estado: "pendente" };
  }
  if (b.fonte === c.fonte) return { estado: "confirmado" };
  if (c.fonte === 2 && (!b.ok_bat || b.soc <= SOC_MINIMO)) {
    return {
      estado: "recusado",
      motivo: b.ok_bat ? "SoC da bateria no mínimo" : "sensor da bateria sem leitura",
    };
  }
  if (c.fonte === 1 && !b.ok_ren) {
    return { estado: "recusado", motivo: "sensor da geração sem leitura" };
  }
  if (b.ts - enviadoEm > 15_000) {
    return { estado: "recusado", motivo: "sem resposta do ESP32" };
  }
  return { estado: "pendente" };
}
