import { Refeicao } from "@/types";

export interface ItemAlimento {
  nome: string;
  quantidade: string;
}

export interface VarianteRefeicao {
  titulo: string;
  itens: ItemAlimento[];
  dica?: string;
}

export interface DetalheRefeicao {
  subtitulo: string;
  proposito: string;
  proteina_g: number;
  carb_g: number;
  kcal: number;
  padrao: VarianteRefeicao;
  whey?: VarianteRefeicao;
}

export const REFEICAO_DETALHES: Record<Refeicao, DetalheRefeicao> = {
  cafe_manha: {
    subtitulo: "Energia & Saciedade",
    proposito: "Combustível inicial com proteína completa.",
    proteina_g: 28,
    carb_g: 45,
    kcal: 460,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Ovos inteiros", quantidade: "3 unidades (mexidos ou cozidos)" },
        { nome: "Pão de Forma Integral", quantidade: "2 fatias (~50g)" },
        { nome: "Fruta (Mamão ou Banana)", quantidade: "100g" },
      ],
      dica: "Pode usar uma colher rasa de café de manteiga ou azeite para grelhar os ovos.",
    },
    whey: {
      titulo: "Alternativa Whey (dias de pressa)",
      itens: [
        { nome: "Whey Protein", quantidade: "1 scoop (~30g) batido com água ou por cima da fruta" },
        { nome: "Pão Integral", quantidade: "2 fatias (com creme de ricota ou pouca manteiga)" },
      ],
      dica: "Mantém os macros sem precisar fritar nada.",
    },
  },
  almoco: {
    subtitulo: "Refeição Obrigatória",
    proposito: "Aporte principal de carboidrato e proteína.",
    proteina_g: 35,
    carb_g: 70,
    kcal: 620,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Arroz", quantidade: "100g (cozido)" },
        { nome: "Feijão", quantidade: "1 concha cheia" },
        { nome: "Frango (ou outra carne magra)", quantidade: "120g" },
        { nome: "Salada e legumes", quantidade: "à vontade" },
      ],
      dica: "Sem opção de whey aqui — almoço estruturado é inegociável no plano.",
    },
  },
  pre_treino: {
    subtitulo: "Praticidade & Performance",
    proposito: "Combustível rápido pré-barra. Carb simples + proteína.",
    proteina_g: 25,
    carb_g: 50,
    kcal: 380,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Iogurte Natural", quantidade: "1 pote (170g a 200g)" },
        { nome: "Aveia em Flocos", quantidade: "2 colheres de sopa (30g)" },
        { nome: "Banana", quantidade: "1 unidade média (~90g)" },
      ],
    },
    whey: {
      titulo: "Shake Pré-Treino",
      itens: [
        { nome: "Whey Protein", quantidade: "1 scoop (~30g)" },
        { nome: "Aveia", quantidade: "2 colheres (30g)" },
        { nome: "Banana", quantidade: "1 unidade" },
        { nome: "Água + gelo", quantidade: "bater no liquidificador" },
      ],
      dica: "Combustível ideal pro treino na praça — leve mas eficiente.",
    },
  },
  jantar: {
    subtitulo: "Recuperação Pós-Treino",
    proposito: "Reposição de glicogênio + síntese proteica.",
    proteina_g: 38,
    carb_g: 50,
    kcal: 540,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Peito de Frango (ou Patinho moído / Tilápia)", quantidade: "150g (peso já cozido)" },
        { nome: "Arroz Branco/Integral (ou Batata Doce/Inglesa)", quantidade: "120g (peso cozido)" },
        { nome: "Legumes (Brócolis, Cenoura, Abobrinha)", quantidade: "à vontade — mín. 80-100g" },
      ],
    },
    whey: {
      titulo: "Omelete Proteico (versão prática)",
      itens: [
        { nome: "Claras de ovo", quantidade: "4 claras" },
        { nome: "Pão integral", quantidade: "2 fatias" },
        { nome: "Legumes refogados", quantidade: "à vontade" },
      ],
      dica: "Quando não der pra fazer arroz/frango, essa é a saída sem sair do plano.",
    },
  },
};

/* ---------- Lista de mercado semanal (para 3 refeições/dia × 7 dias) ---------- */
export interface ItemMercado {
  alimento: string;
  quantidade: string;
  como_comprar: string;
  custo_min: number;
  custo_max: number;
}

export const LISTA_MERCADO_SEMANAL: ItemMercado[] = [
  { alimento: "Ovos", quantidade: "21 unidades", como_comprar: "1 cartela de 20 ou 30 ovos", custo_min: 18, custo_max: 22 },
  { alimento: "Pão de Forma Integral", quantidade: "14 fatias", como_comprar: "1 pacote padrão (18-20 fatias)", custo_min: 7.5, custo_max: 10 },
  { alimento: "Iogurte Natural", quantidade: "7 potes", como_comprar: "7 potinhos OU 2 garrafas de 500g", custo_min: 15, custo_max: 20 },
  { alimento: "Aveia em Flocos", quantidade: "210g", como_comprar: "1 caixinha ou pacote de 200-250g", custo_min: 4.5, custo_max: 6 },
  { alimento: "Bananas", quantidade: "10 a 12 unidades", como_comprar: "1 ou 2 pencas médias", custo_min: 8, custo_max: 11 },
  { alimento: "Mamão (ou outra fruta)", quantidade: "700g", como_comprar: "1 Formosa médio ou 2 Papaias", custo_min: 7, custo_max: 10 },
  { alimento: "Peito de Frango", quantidade: "1,3kg a 1,5kg cru", como_comprar: "1 bandeja de filé ou sassami", custo_min: 26, custo_max: 32 },
  { alimento: "Arroz (jantar)", quantidade: "840g cozido (~300g cru)", como_comprar: "Pegar do que já tem em casa", custo_min: 0, custo_max: 5 },
  { alimento: "Legumes variados", quantidade: "~700g", como_comprar: "Maço de brócolis + 2 cenouras (feira)", custo_min: 8, custo_max: 12 },
];

export const CUSTO_WHEY_MENSAL = { min: 100, max: 110, doses: 33 };
