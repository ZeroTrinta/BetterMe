export type Refeicao = "cafe_manha" | "almoco" | "pre_treino" | "jantar";

export interface HistoricoAlimentacao {
  cafe_manha: boolean;
  almoco: boolean;
  pre_treino: boolean;
  jantar: boolean;
  /** YYYY-MM-DD */
  data: string;
}

export type TipoTreino = "A" | "B" | "C";

export interface HistoricoTreino {
  data: string;
  tipo_treino: TipoTreino;
  /** ISO timestamp */
  registrado_em?: string;
}

export interface HistoricoCorrida {
  /** auto id */
  id?: string;
  data: string;
  distancia_km: number;
  duracao_min: number;
  /** min/km derivado */
  ritmo_min_km: number;
  notas?: string;
}

export interface CompraMercado {
  data: string;
  mes: string; // YYYY-MM
  valor_pago: number;
  descricao?: string;
}

export const REFEICOES_ORDEM: Refeicao[] = [
  "cafe_manha",
  "almoco",
  "pre_treino",
  "jantar",
];

export const REFEICAO_LABEL: Record<Refeicao, string> = {
  cafe_manha: "Café da Manhã",
  almoco: "Almoço",
  pre_treino: "Pré-Treino",
  jantar: "Jantar",
};

export const TREINO_LABEL: Record<TipoTreino, string> = {
  A: "Empurrar",
  B: "Puxar",
  C: "Pernas & Core",
};
