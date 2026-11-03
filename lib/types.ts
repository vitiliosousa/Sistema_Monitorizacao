export type Fonte = 1 | 2 | 3;
export type Modo = "AUTO" | "MANUAL";

/** Mensagem do tópico `escn/balanco` (a hora `ts` é atribuída pelo website à chegada). */
export interface Balanco {
  ts: number;
  ok_ren: 0 | 1;
  ok_bat: 0 | 1;
  v_ren: number;
  i_ren: number;
  p_ren: number;
  v_bat: number;
  i_bat: number;
  p_bat: number;
  soc: number;
  fonte: Fonte;
  modo: Modo;
  p_carga: number;
  e_ren_ger: number;
  e_ren_util: number;
  e_bat_forn: number;
  e_edm: number;
  e_carga: number;
  fr_directa: number;
  fr_total: number;
  r_edm: number;
}

export type Comando =
  | { tipo: "modo"; modo: Modo }
  | { tipo: "fonte"; fonte: Fonte }
  | { tipo: "carga"; watts: number };

export type NivelAlarme = "informacao" | "aviso" | "critico";

export interface Alarme {
  id: string;
  nivel: NivelAlarme;
  titulo: string;
  detalhe: string;
}

export type EstadoEsp = "online" | "offline" | "sem-dados";

export const NOMES_FONTE: Record<Fonte, string> = {
  1: "Renováveis",
  2: "Bateria",
  3: "EDM (rede)",
};

export const RELE_FONTE: Record<Fonte, string> = {
  1: "K1",
  2: "K2",
  3: "K3",
};

export const SOC_MINIMO = 30;
export const SOC_RETOMA = 45;
export const TIMEOUT_SEM_DADOS_MS = 15_000;
export const JANELA_GRAFICO_MS = 5 * 60_000;
export const MAX_PONTOS = 2000;
export const MAX_REGISTO = 12;
