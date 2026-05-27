import {
  HistoricoAlimentacao,
  HistoricoTreino,
  HistoricoCorrida,
  REFEICOES_ORDEM,
} from "@/types";
import { format, subDays, parseISO } from "date-fns";

export interface StreakResult {
  /** Sequência atual contada a partir de hoje (ou ontem se hoje ainda não fechou) */
  atual: number;
  /** Maior sequência já alcançada */
  recorde: number;
  /** Hoje já está válido (todos os requisitos cumpridos) */
  hoje_valido: boolean;
  /** Faltam quantas refeições para fechar hoje */
  refeicoes_faltando: number;
  /** Tem treino/corrida registrado hoje */
  tem_atividade_hoje: boolean;
}

/**
 * Regra estrita: dia é VÁLIDO quando 4/4 refeições marcadas E pelo menos
 * 1 registro de treino OU corrida no mesmo dia.
 */
export function ehDiaValido(
  dieta: HistoricoAlimentacao | undefined,
  treinos: Set<string>,
  corridas: Set<string>,
  dateKey: string
): boolean {
  if (!dieta) return false;
  const refsFechadas = REFEICOES_ORDEM.every((r) => (dieta as any)[r] === true);
  const temAtividade = treinos.has(dateKey) || corridas.has(dateKey);
  return refsFechadas && temAtividade;
}

/**
 * Calcula streak atual + recorde varrendo histórico de trás pra frente.
 * Limite de 365 dias varridos pra evitar consultas infinitas.
 */
export function calcularStreak(
  dietas: HistoricoAlimentacao[],
  treinos: HistoricoTreino[],
  corridas: HistoricoCorrida[],
  todayKey: string
): StreakResult {
  // Index por data pra lookup O(1)
  const dietaMap = new Map(dietas.map((d) => [d.data, d]));
  const treinoSet = new Set(treinos.map((t) => t.data));
  const corridaSet = new Set(corridas.map((c) => c.data));

  // Status de hoje
  const dietaHoje = dietaMap.get(todayKey);
  const refsFeitas = dietaHoje
    ? REFEICOES_ORDEM.filter((r) => (dietaHoje as any)[r]).length
    : 0;
  const refeicoes_faltando = 4 - refsFeitas;
  const tem_atividade_hoje = treinoSet.has(todayKey) || corridaSet.has(todayKey);
  const hoje_valido = ehDiaValido(dietaHoje, treinoSet, corridaSet, todayKey);

  // Streak atual: começa hoje se válido, senão tenta a partir de ontem
  // (assim você não perde a streak só porque ainda é cedo no dia)
  let atual = 0;
  const inicio = hoje_valido ? 0 : 1;
  for (let i = inicio; i < 365; i++) {
    const d = format(subDays(parseISO(todayKey), i), "yyyy-MM-dd");
    if (ehDiaValido(dietaMap.get(d), treinoSet, corridaSet, d)) {
      atual++;
    } else {
      break;
    }
  }

  // Recorde: varre histórico completo procurando o maior run consecutivo.
  // Estratégia: pega todas as datas únicas que têm dieta, ordena, e para cada
  // uma checa se forma sequência com a anterior (dia-1). Se sim, run++; senão run=1.
  const todasDatas = Array.from(
    new Set([
      ...dietas.map((d) => d.data),
      ...treinos.map((t) => t.data),
      ...corridas.map((c) => c.data),
    ])
  ).sort();

  let recorde = atual;
  let run = 0;
  let dataAnterior: Date | null = null;
  for (const data of todasDatas) {
    const valido = ehDiaValido(dietaMap.get(data), treinoSet, corridaSet, data);
    const dataAtual = parseISO(data);
    if (!valido) {
      run = 0;
      dataAnterior = null;
      continue;
    }
    // Verifica se é consecutivo: diff de 1 dia em relação ao anterior
    const consecutivo =
      dataAnterior !== null &&
      Math.round((dataAtual.getTime() - dataAnterior.getTime()) / 86_400_000) === 1;
    run = consecutivo ? run + 1 : 1;
    if (run > recorde) recorde = run;
    dataAnterior = dataAtual;
  }

  return { atual, recorde, hoje_valido, refeicoes_faltando, tem_atividade_hoje };
}
