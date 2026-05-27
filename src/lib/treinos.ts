import { TipoTreino } from "@/types";

export interface Exercicio {
  nome: string;
  series: string;
  foco?: string;
}

export const TREINOS: Record<TipoTreino, { titulo: string; descricao: string; exercicios: Exercicio[] }> = {
  A: {
    titulo: "Empurrar",
    descricao: "Cadeia anterior · Peitoral, Deltoides e Tríceps",
    exercicios: [
      { nome: "Flexão Padrão", series: "4 × Falha" },
      { nome: "Pike Push-up", series: "3 × 10", foco: "Ombros" },
      { nome: "Mergulho no Banco", series: "3 × 12", foco: "Tríceps" },
      { nome: "Flexão Diamante", series: "3 × 8", foco: "Peito Interno" },
    ],
  },
  B: {
    titulo: "Puxar",
    descricao: "Cadeia posterior · Dorsais e Bíceps",
    exercicios: [
      { nome: "Pull-up (Pronada)", series: "3 séries" },
      { nome: "Chin-up (Supinada)", series: "3 séries", foco: "Bíceps" },
      { nome: "Remada Australiana", series: "4 × 12" },
      { nome: "Dead Hang", series: "3 × 45s", foco: "Pegada" },
    ],
  },
  C: {
    titulo: "Pernas & Core",
    descricao: "Motor calórico · Membros inferiores e estabilidade",
    exercicios: [
      { nome: "Agachamento Livre", series: "4 × 20" },
      { nome: "Passada (Afundo)", series: "3 × 12 cada perna" },
      { nome: "Panturrilha Unilateral", series: "3 × 15" },
      { nome: "Elevação Pernas Barra", series: "3 × 10" },
      { nome: "Prancha Abdominal", series: "3 × 60s" },
      { nome: "Canivete (Crunch)", series: "3 × 15" },
    ],
  },
};
