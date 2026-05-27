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
  gordura_g: number;
  kcal: number;
  padrao: VarianteRefeicao;
  whey?: VarianteRefeicao;
}

/**
 * Plano recalibrado pra perfil 93kg / 1,79m / 26 anos / masc
 * Treina calistenia (ABC) + corrida diária — atividade intensa (1,725×)
 * Objetivo: RECOMP (perder gordura + ganhar massa magra)
 *
 * Alvos diários:
 *   ~3.100 kcal · 205g proteína · 85g gordura · 310g carbo
 *
 * Distribuição: 5 refeições/dia (adicionado lanche pós-jantar leve)
 */
export const REFEICAO_DETALHES: Record<Refeicao, DetalheRefeicao> = {
  cafe_manha: {
    subtitulo: "Energia & Saciedade",
    proposito: "Combustível inicial com proteína completa e gordura boa.",
    proteina_g: 38,
    carb_g: 65,
    gordura_g: 22,
    kcal: 610,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Ovos inteiros", quantidade: "4 unidades (mexidos ou cozidos)" },
        { nome: "Pão de Forma Integral", quantidade: "2 fatias (~50g)" },
        { nome: "Pasta de Amendoim Integral", quantidade: "1 colher de sopa (~15g)" },
        { nome: "Fruta (Mamão ou Banana)", quantidade: "120g" },
      ],
      dica: "Pasta de amendoim integral (sem açúcar) entrega gordura boa + saciedade. Pode usar azeite ou manteiga p/ grelhar os ovos sem culpa.",
    },
    whey: {
      titulo: "Alternativa Whey (dias de pressa)",
      itens: [
        { nome: "Whey Protein", quantidade: "1,5 scoop (~45g) batido com leite ou água" },
        { nome: "Pão Integral", quantidade: "2 fatias com creme de ricota" },
        { nome: "Pasta de Amendoim", quantidade: "1 colher (no pão)" },
        { nome: "Banana", quantidade: "1 unidade média" },
      ],
      dica: "Whey + leite entrega 40g de proteína fácil. Sem fritar nada.",
    },
  },
  almoco: {
    subtitulo: "Refeição Principal",
    proposito: "Aporte máximo de proteína animal + carbo complexo.",
    proteina_g: 55,
    carb_g: 95,
    gordura_g: 18,
    kcal: 780,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Arroz Integral (ou branco)", quantidade: "150g cozido (~6 colheres)" },
        { nome: "Feijão", quantidade: "1 concha cheia" },
        { nome: "Frango grelhado (ou patinho moído / tilápia)", quantidade: "180g" },
        { nome: "Salada verde + legumes", quantidade: "à vontade (mín 100g)" },
        { nome: "Azeite extra-virgem na salada", quantidade: "1 colher de sopa" },
      ],
      dica: "Almoço é inegociável — base do dia. Azeite na salada aumenta absorção de vitaminas lipossolúveis.",
    },
  },
  pre_treino: {
    subtitulo: "Performance & Energia",
    proposito: "Combustível rápido pré-treino + síntese proteica.",
    proteina_g: 45,
    carb_g: 70,
    gordura_g: 10,
    kcal: 540,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Iogurte Natural (integral, sem açúcar)", quantidade: "1 pote (170-200g)" },
        { nome: "Whey Protein", quantidade: "1 scoop (~30g) misturado no iogurte" },
        { nome: "Aveia em Flocos", quantidade: "3 colheres de sopa (45g)" },
        { nome: "Banana", quantidade: "1 unidade média" },
      ],
      dica: "Combinação clássica pré-barra: carbo de absorção média + proteína completa. Tome 60-90 min antes do treino.",
    },
    whey: {
      titulo: "Shake Pré-Treino (versão líquida)",
      itens: [
        { nome: "Whey Protein", quantidade: "1,5 scoop (~45g)" },
        { nome: "Aveia", quantidade: "3 colheres (45g)" },
        { nome: "Banana", quantidade: "1 unidade" },
        { nome: "Leite desnatado ou água + gelo", quantidade: "300ml" },
      ],
      dica: "Mais fácil de digerir antes do treino pesado. Bate tudo no liquidificador.",
    },
  },
  jantar: {
    subtitulo: "Recuperação Pós-Treino",
    proposito: "Reposição de glicogênio + síntese proteica noturna.",
    proteina_g: 55,
    carb_g: 70,
    gordura_g: 22,
    kcal: 740,
    padrao: {
      titulo: "Padrão",
      itens: [
        { nome: "Peito de Frango (ou Patinho moído / Tilápia / Salmão)", quantidade: "200g (peso cozido)" },
        { nome: "Arroz ou Batata Doce/Inglesa", quantidade: "150g cozido" },
        { nome: "Legumes (Brócolis, Cenoura, Abobrinha)", quantidade: "à vontade — mín 100g" },
        { nome: "Azeite extra-virgem", quantidade: "1 colher de sopa" },
        { nome: "Castanhas (opcional)", quantidade: "1 punhado (~20g)" },
      ],
      dica: "Salmão 2x/semana traz ômega-3 — anti-inflamatório que ajuda recuperação. Castanhas são opcionais se quiser fechar a gordura do dia.",
    },
    whey: {
      titulo: "Omelete Reforçado (versão prática)",
      itens: [
        { nome: "Ovos inteiros + claras", quantidade: "3 inteiros + 4 claras" },
        { nome: "Queijo cottage ou ricota", quantidade: "3 colheres de sopa" },
        { nome: "Pão integral", quantidade: "2 fatias" },
        { nome: "Legumes refogados", quantidade: "à vontade" },
      ],
      dica: "Quando não tiver frango pronto. Ovos + cottage = ~50g de proteína fácil.",
    },
  },
};

/* ---------- TOTAIS DIÁRIOS (calculados) ---------- */
export const TOTAIS_DIARIOS = {
  proteina_g: 193,   // 38 + 55 + 45 + 55 = 193g (~2,08 g/kg pra 93kg)
  carb_g: 300,        // 65 + 95 + 70 + 70 = 300g
  gordura_g: 72,      // 22 + 18 + 10 + 22 = 72g
  kcal: 2670,         // 610 + 780 + 540 + 740 = 2670 kcal
};

/**
 * Nota: o total chega a ~2.670 kcal com as 4 refeições.
 * Pra fechar os 3.100 kcal do alvo recomp, adicione:
 *   - Lanche extra entre refeições: castanhas + iogurte (~250 kcal)
 *   - OU bata o jantar c/ massa proteica + mais carbo
 *   - OU em dias de corrida longa, adicione mais 1 banana + whey pós-corrida
 */

/* ---------- SUPLEMENTAÇÃO ---------- */
export interface Suplemento {
  nome: string;
  dose: string;
  horario: string;
  custo_mensal_min: number;
  custo_mensal_max: number;
  nota?: string;
}

export const SUPLEMENTOS: Suplemento[] = [
  {
    nome: "Whey Protein (Concentrado 100%)",
    dose: "1-2 scoops/dia (~30-60g)",
    horario: "Pré-treino e/ou café da manhã",
    custo_mensal_min: 100,
    custo_mensal_max: 130,
    nota: "Pacote de 900g-1kg rende ~30-33 doses. Marcas direto de fábrica saem mais barato.",
  },
  {
    nome: "Creatina Monohidratada",
    dose: "5g/dia",
    horario: "Qualquer horário (consistência > timing)",
    custo_mensal_min: 25,
    custo_mensal_max: 45,
    nota: "Pote de 300g dura ~2 meses. Creapure é o padrão-ouro, mas creatina nacional certificada também funciona.",
  },
];

/* ---------- LISTA DE MERCADO SEMANAL ---------- */
/** Preços médios em Campinas SP — referência Pague Menos / Tenda / feira (Q1 2026) */
export interface ItemMercado {
  alimento: string;
  quantidade: string;
  como_comprar: string;
  custo_min: number;
  custo_max: number;
}

export const LISTA_MERCADO_SEMANAL: ItemMercado[] = [
  // Proteínas
  { alimento: "Peito de Frango", quantidade: "2,5 a 2,8 kg cru/semana", como_comprar: "Bandejas de filé ou sassami — bom comprar congelado de 1kg", custo_min: 55, custo_max: 70 },
  { alimento: "Ovos", quantidade: "30 unidades", como_comprar: "1 cartela de 30 (caipira ou branco)", custo_min: 22, custo_max: 28 },
  { alimento: "Patinho moído (opcional)", quantidade: "500g", como_comprar: "Variar com frango 2-3x/semana", custo_min: 25, custo_max: 35 },
  { alimento: "Tilápia ou Salmão", quantidade: "400-500g", como_comprar: "1-2x/semana — filé congelado é mais barato", custo_min: 20, custo_max: 60 },

  // Carbos
  { alimento: "Arroz Integral (ou branco)", quantidade: "500g cru", como_comprar: "Pacote de 1kg dura 2 semanas", custo_min: 4, custo_max: 8 },
  { alimento: "Feijão Carioca", quantidade: "400g cru", como_comprar: "Pacote de 1kg dura 3 semanas", custo_min: 5, custo_max: 9 },
  { alimento: "Batata Doce (ou Inglesa)", quantidade: "1,5 kg", como_comprar: "Feira sai bem mais barato", custo_min: 7, custo_max: 12 },
  { alimento: "Pão de Forma Integral", quantidade: "1 pacote (18-20 fatias)", como_comprar: "Pacote padrão de supermercado", custo_min: 8, custo_max: 12 },
  { alimento: "Aveia em Flocos", quantidade: "250g", como_comprar: "Pote ou caixa de 200-250g", custo_min: 5, custo_max: 8 },

  // Gorduras boas
  { alimento: "Pasta de Amendoim Integral", quantidade: "1 pote (500g)", como_comprar: "Dura 2-3 semanas. Marcas sem açúcar/sal", custo_min: 18, custo_max: 28 },
  { alimento: "Azeite Extra-Virgem", quantidade: "1 garrafa (500ml)", como_comprar: "Dura 3-4 semanas. Acidez máx 0,5%", custo_min: 25, custo_max: 45 },
  { alimento: "Castanhas mistas", quantidade: "200g", como_comprar: "Granel em mercado é mais barato que pacotinho", custo_min: 15, custo_max: 25 },

  // Laticínios
  { alimento: "Iogurte Natural Integral", quantidade: "7 potes (170-200g)", como_comprar: "Pacote de 4 + 3 unitários, ou 2 baldes de 500g", custo_min: 18, custo_max: 28 },
  { alimento: "Queijo Cottage ou Ricota", quantidade: "200g", como_comprar: "1 pote", custo_min: 10, custo_max: 18 },

  // Frutas e legumes
  { alimento: "Bananas", quantidade: "10-12 unidades", como_comprar: "Penca média na feira", custo_min: 8, custo_max: 12 },
  { alimento: "Mamão Formosa", quantidade: "1 unidade", como_comprar: "Dura a semana se guardado certo", custo_min: 7, custo_max: 12 },
  { alimento: "Brócolis", quantidade: "1 maço", como_comprar: "Feira ou hortifruti", custo_min: 5, custo_max: 9 },
  { alimento: "Cenoura + Abobrinha", quantidade: "~1 kg total", como_comprar: "Feira é imbatível", custo_min: 5, custo_max: 10 },
  { alimento: "Folhas (alface, rúcula, espinafre)", quantidade: "2 maços", como_comprar: "Feira", custo_min: 6, custo_max: 10 },
];

/* ---------- ESTIMATIVAS FINANCEIRAS ---------- */
export function calcularGastoEstimadoSemanal() {
  const min = LISTA_MERCADO_SEMANAL.reduce((acc, item) => acc + item.custo_min, 0);
  const max = LISTA_MERCADO_SEMANAL.reduce((acc, item) => acc + item.custo_max, 0);
  return { min, max, medio: Math.round((min + max) / 2) };
}

export function calcularGastoEstimadoMensal() {
  const semanal = calcularGastoEstimadoSemanal();
  const supl_min = SUPLEMENTOS.reduce((acc, s) => acc + s.custo_mensal_min, 0);
  const supl_max = SUPLEMENTOS.reduce((acc, s) => acc + s.custo_mensal_max, 0);
  return {
    alimentos_min: semanal.min * 4.33, // ~4,33 semanas/mês
    alimentos_max: semanal.max * 4.33,
    alimentos_medio: semanal.medio * 4.33,
    suplementos_min: supl_min,
    suplementos_max: supl_max,
    total_min: Math.round(semanal.min * 4.33 + supl_min),
    total_max: Math.round(semanal.max * 4.33 + supl_max),
    total_medio: Math.round(semanal.medio * 4.33 + (supl_min + supl_max) / 2),
  };
}

export const CUSTO_WHEY_MENSAL = { min: 100, max: 130, doses: 33 };
