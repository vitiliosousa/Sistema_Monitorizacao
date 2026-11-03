import type { Balanco, Comando, Fonte, Modo } from "./types";
import { SOC_MINIMO, SOC_RETOMA } from "./types";

export interface CenarioSimulacao {
  /** Segundos simulados por segundo real. */
  velocidade: number;
  solAutomatico: boolean;
  /** 0–1, usado quando `solAutomatico` é falso. */
  sol: number;
  falhaGeracao: boolean;
  falhaBateria: boolean;
}

export const CENARIO_INICIAL: CenarioSimulacao = {
  velocidade: 60,
  solAutomatico: true,
  sol: 0.8,
  falhaGeracao: false,
  falhaBateria: false,
};

const P_GERACAO_MAX = 130; // W
const CAPACIDADE_AH = 20;
const V_SOC_0 = 11.6;
const V_SOC_100 = 12.8;
const INTERVALO_MIN_TROCA_MS = 10_000;

const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));
const ruido = (amp: number) => (Math.random() - 0.5) * 2 * amp;

/**
 * Imita o ESP32: lê sensores, aplica as regras de decisão da secção 5.2 e
 * produz a mensagem `escn/balanco`. Apenas dados simulados.
 */
export class Simulador {
  private horaSim = 9.5;
  private socReal = 62;
  private vFiltrada = V_SOC_0 + ((V_SOC_100 - V_SOC_0) * 62) / 100;
  private socEstimado = 62;
  private fonte: Fonte = 3; // estado inicial seguro: EDM
  private modo: Modo = "AUTO";
  private fonteManual: Fonte = 3;
  private pCarga = 40;
  private ultimaTroca = 0;
  private ultimoPasso: number | null = null;
  private e = {
    ren_ger: 0,
    ren_util: 0,
    bat_forn: 0,
    edm: 0,
  };

  comando(c: Comando) {
    if (c.tipo === "modo") {
      this.modo = c.modo;
      if (c.modo === "MANUAL") this.fonteManual = this.fonte;
    } else if (c.tipo === "fonte") {
      this.fonteManual = c.fonte;
    } else {
      this.pCarga = clamp(c.watts, 0, 500);
    }
  }

  passo(agora: number, cenario: CenarioSimulacao): Balanco {
    const dtReal =
      this.ultimoPasso === null ? 1 : clamp((agora - this.ultimoPasso) / 1000, 0, 5);
    this.ultimoPasso = agora;
    const dtSim = dtReal * cenario.velocidade;
    const dtH = dtSim / 3600;
    this.horaSim = (this.horaSim + dtSim / 3600) % 24;

    // Geração (solar + eólica, depois do controlador de carga)
    const h = this.horaSim;
    const solDia =
      h > 6 && h < 18 ? Math.sin((Math.PI * (h - 6)) / 12) : 0;
    const nuvens = 1 - 0.25 * (0.5 + 0.5 * Math.sin(h * 3.1));
    const sol = cenario.solAutomatico ? solDia * nuvens : cenario.sol;
    const vento = 14 * (0.5 + 0.5 * Math.sin(h * 1.7 + 1)) * (0.6 + 0.4 * Math.sin(h * 0.45));
    const pGeracaoReal = Math.max(
      0,
      P_GERACAO_MAX * sol * (1 + ruido(0.03)) + Math.max(0, vento) + ruido(0.4),
    );
    const vRenReal = 12.6 + 1.6 * Math.min(1, pGeracaoReal / P_GERACAO_MAX) + ruido(0.03);
    const okRen = !cenario.falhaGeracao;
    const pRenMedida = okRen ? pGeracaoReal : 0;

    // Bateria (a corrente positiva carrega)
    const vBatSemCarga = V_SOC_0 + ((V_SOC_100 - V_SOC_0) * this.socReal) / 100;
    const potenciaLiquida =
      this.fonte === 1
        ? Math.max(0, pGeracaoReal - this.pCarga)
        : pGeracaoReal - (this.fonte === 2 ? this.pCarga : 0);
    let iBatReal = clamp(potenciaLiquida / vBatSemCarga, -15, 10);
    if (this.socReal >= 100 && iBatReal > 0) iBatReal = 0;
    if (this.socReal <= 0 && iBatReal < 0) iBatReal = 0;
    this.socReal = clamp(this.socReal + ((iBatReal * dtSim) / 3600 / CAPACIDADE_AH) * 100, 0, 100);
    const vBatReal = vBatSemCarga + iBatReal * 0.03; // resistência interna
    const okBat = !cenario.falhaBateria;
    const vBatMedida = vBatReal + ruido(0.01);

    // SoC estimado pela tensão, suavizada (cada ciclo avança 20 %)
    if (okBat) {
      this.vFiltrada += 0.2 * (vBatMedida - this.vFiltrada);
      this.socEstimado = clamp(
        ((this.vFiltrada - V_SOC_0) / (V_SOC_100 - V_SOC_0)) * 100,
        0,
        100,
      );
    }

    // Decisão
    const alvo = this.decidir(okRen, okBat, pRenMedida);
    if (alvo !== this.fonte) {
      const urgente =
        alvo === 3 &&
        ((this.fonte === 2 && (!okBat || this.socEstimado <= SOC_MINIMO)) ||
          (this.fonte === 1 && !okRen));
      if (urgente || agora - this.ultimaTroca >= INTERVALO_MIN_TROCA_MS) {
        this.fonte = alvo;
        this.ultimaTroca = agora;
      }
    }

    // Energia
    if (okRen) this.e.ren_ger += pRenMedida * dtH;
    const eCargaPasso = this.pCarga * dtH;
    if (this.fonte === 1) this.e.ren_util += eCargaPasso;
    else if (this.fonte === 2) this.e.bat_forn += eCargaPasso;
    else this.e.edm += eCargaPasso;
    const eCarga = this.e.ren_util + this.e.bat_forn + this.e.edm;
    const pct = (x: number) => (eCarga > 0 ? (x / eCarga) * 100 : 0);

    return {
      ts: agora,
      ok_ren: okRen ? 1 : 0,
      ok_bat: okBat ? 1 : 0,
      v_ren: okRen ? vRenReal : 0,
      i_ren: okRen ? pRenMedida / vRenReal : 0,
      p_ren: pRenMedida,
      v_bat: okBat ? vBatMedida : 0,
      i_bat: okBat ? iBatReal + ruido(0.02) : 0,
      p_bat: okBat ? vBatMedida * iBatReal : 0,
      soc: this.socEstimado,
      fonte: this.fonte,
      modo: this.modo,
      p_carga: this.pCarga,
      e_ren_ger: this.e.ren_ger,
      e_ren_util: this.e.ren_util,
      e_bat_forn: this.e.bat_forn,
      e_edm: this.e.edm,
      e_carga: eCarga,
      fr_directa: pct(this.e.ren_util),
      fr_total: pct(this.e.ren_util + this.e.bat_forn),
      r_edm: pct(eCarga - this.e.edm),
    };
  }

  private decidir(okRen: boolean, okBat: boolean, pRen: number): Fonte {
    if (this.modo === "MANUAL") {
      const f = this.fonteManual;
      // O ESP32 recusa a bateria no mínimo ou com sensor em falha, mesmo em manual
      if (f === 2 && (!okBat || this.socEstimado <= SOC_MINIMO)) return 3;
      if (f === 1 && !okRen) return 3;
      return f;
    }
    const pC = this.pCarga;
    const renOk =
      okRen && (this.fonte === 1 ? pRen >= 0.9 * pC : pRen >= 1.1 * pC);
    if (renOk) return 1;
    const batOk =
      okBat && (this.fonte === 2 ? this.socEstimado > SOC_MINIMO : this.socEstimado > SOC_RETOMA);
    if (batOk) return 2;
    return 3;
  }
}
