"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { avaliarComando, calcularAlarmes, type ResultadoComando } from "./derivados";
import { CENARIO_INICIAL, Simulador, type CenarioSimulacao } from "./simulator";
import {
  MAX_PONTOS,
  MAX_REGISTO,
  TIMEOUT_SEM_DADOS_MS,
  type Balanco,
  type Comando,
  type EstadoEsp,
} from "./types";

export interface ComandoEnviado {
  comando: Comando;
  enviadoEm: number;
  resultado: ResultadoComando;
}

export interface EntradaRegisto {
  ts: number;
  topico: string;
  payload: string;
}

/** Substitui a ligação MQTT/WebSocket por um simulador que publica a cada segundo. */
export function useMonitor() {
  const simulador = useRef<Simulador | null>(null);
  const cenarioRef = useRef<CenarioSimulacao>(CENARIO_INICIAL);

  const [cenario, setCenario] = useState<CenarioSimulacao>(CENARIO_INICIAL);
  const [espOffline, setEspOffline] = useState(false);
  const [wsDesligado, setWsDesligado] = useState(false);
  const [historico, setHistorico] = useState<Balanco[]>([]);
  const [registo, setRegisto] = useState<EntradaRegisto[]>([]);
  const [agora, setAgora] = useState<number | null>(null);
  const [comando, setComando] = useState<ComandoEnviado | null>(null);

  const espOfflineRef = useRef(false);
  const wsDesligadoRef = useRef(false);
  const comandoRef = useRef<ComandoEnviado | null>(null);

  useEffect(() => {
    cenarioRef.current = cenario;
  }, [cenario]);
  useEffect(() => {
    espOfflineRef.current = espOffline;
  }, [espOffline]);
  useEffect(() => {
    wsDesligadoRef.current = wsDesligado;
  }, [wsDesligado]);
  useEffect(() => {
    comandoRef.current = comando;
  }, [comando]);

  useEffect(() => {
    simulador.current = new Simulador();
    const ciclo = () => {
      const t = Date.now();
      setAgora(t);
      // O ESP32 continua a controlar os relés mesmo sem comunicação.
      const msg = simulador.current!.passo(t, cenarioRef.current);
      if (espOfflineRef.current || wsDesligadoRef.current) return;

      setHistorico((h) => [...h, msg].slice(-MAX_PONTOS));
      setRegisto((r) =>
        [{ ts: t, topico: "escn/balanco", payload: JSON.stringify(arredondar(msg)) }, ...r].slice(
          0,
          MAX_REGISTO,
        ),
      );
      const pendente = comandoRef.current;
      if (pendente && pendente.resultado.estado === "pendente") {
        const resultado = avaliarComando(pendente.comando, msg, pendente.enviadoEm);
        if (resultado.estado !== "pendente") setComando({ ...pendente, resultado });
      }
    };
    ciclo();
    const id = setInterval(ciclo, 1000);
    return () => clearInterval(id);
  }, []);

  const ultima = historico.length ? historico[historico.length - 1] : null;

  const esp: EstadoEsp = espOffline
    ? "offline"
    : ultima && agora !== null && agora - ultima.ts > TIMEOUT_SEM_DADOS_MS
      ? "sem-dados"
      : "online";

  const wsLigado = !wsDesligado;

  const alarmes = useMemo(
    () => calcularAlarmes({ ultima, esp, wsLigado }),
    [ultima, esp, wsLigado],
  );

  const enviarComando = useCallback(
    (c: Comando) => {
      if (wsDesligado || espOffline) return false;
      simulador.current?.comando(c);
      setComando({ comando: c, enviadoEm: Date.now(), resultado: { estado: "pendente" } });
      return true;
    },
    [wsDesligado, espOffline],
  );

  const exportarCsv = useCallback(() => {
    if (!historico.length) return;
    const colunas = Object.keys(historico[0]) as (keyof Balanco)[];
    const linhas = historico.map((p) =>
      colunas.map((c) => (c === "ts" ? new Date(p.ts).toISOString() : String(p[c]))).join(";"),
    );
    const blob = new Blob([[colunas.join(";"), ...linhas].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `escn-balanco-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [historico]);

  return {
    ultima,
    historico,
    registo,
    esp,
    wsLigado,
    alarmes,
    comando,
    enviarComando,
    exportarCsv,
    cenario,
    setCenario,
    espOffline,
    setEspOffline,
    wsDesligado,
    setWsDesligado,
  };
}

function arredondar(b: Balanco) {
  return Object.fromEntries(
    Object.entries(b)
      .filter(([k]) => k !== "ts")
      .map(([k, v]) => [k, typeof v === "number" ? Math.round(v * 100) / 100 : v]),
  );
}
