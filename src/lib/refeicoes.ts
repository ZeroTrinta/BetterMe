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
export interface ItemMercado {
  alimento: string;
  quantidade: string;
  como_comprar: string;
  custo_min: number;
  custo_max: number;
}

/** Lista enxuta — só o essencial do plano. Sem opcionais. */
export const LISTA_MERCADO_SEMANAL: ItemMercado[] = [
  // Proteínas
  { alimento: "Peito de Frango", quantidade: "2 kg cru", como_comprar: "Bandeja congelada", custo_min: 40, custo_max: 55 },
  { alimento: "Ovos", quantidade: "30 unidades", como_comprar: "1 cartela", custo_min: 22, custo_max: 28 },

  // Carbos
  { alimento: "Arroz", quantidade: "500g cru", como_comprar: "Pacote de 1kg dura 2 semanas", custo_min: 4, custo_max: 8 },
  { alimento: "Feijão", quantidade: "400g cru", como_comprar: "Pacote de 1kg dura 3 semanas", custo_min: 5, custo_max: 9 },
  { alimento: "Pão de Forma Integral", quantidade: "1 pacote", como_comprar: "18-20 fatias", custo_min: 8, custo_max: 12 },
  { alimento: "Aveia em Flocos", quantidade: "250g", como_comprar: "1 pote", custo_min: 5, custo_max: 8 },

  // Gorduras boas
  { alimento: "Azeite Extra-Virgem", quantidade: "1 garrafa", como_comprar: "Dura 3-4 semanas", custo_min: 25, custo_max: 35 },
  { alimento: "Pasta de Amendoim", quantidade: "1 pote", como_comprar: "Dura 2-3 semanas", custo_min: 18, custo_max: 25 },

  // Laticínios
  { alimento: "Iogurte Natural", quantidade: "7 potes", como_comprar: "Integral, sem açúcar", custo_min: 18, custo_max: 25 },

  // Frutas e legumes
  { alimento: "Bananas", quantidade: "10-12 un", como_comprar: "1 penca", custo_min: 8, custo_max: 12 },
  { alimento: "Mamão", quantidade: "1 unidade", como_comprar: "Formosa", custo_min: 7, custo_max: 10 },
  { alimento: "Legumes (brócolis, cenoura, abobrinha)", quantidade: "~1 kg", como_comprar: "Feira", custo_min: 10, custo_max: 18 },
];

/** Gasto padrão semanal estimado (usado quando ainda não há dados reais suficientes) */
export const GASTO_PADRAO_SEMANAL = 200;

/* ---------- ESTIMATIVAS FINANCEIRAS ---------- */
/**
 * Calcula gasto semanal estimado de forma adaptativa:
 *   - Com menos de 4 compras registradas: usa GASTO_PADRAO_SEMANAL
 *   - Com 4+ compras: usa a média semanal real do histórico
 *
 * Retorna: { valor, baseadoEm: "padrao" | "historico", amostras }
 */
export function calcularGastoSemanalAdaptativo(
  compras: { valor_pago: number; data: string }[]
): { valor: number; baseadoEm: "padrao" | "historico"; amostras: number } {
  if (compras.length < 4) {
    return {
      valor: GASTO_PADRAO_SEMANAL,
      baseadoEm: "padrao",
      amostras: compras.length,
    };
  }

  // Calcula intervalo total em dias entre primeira e última compra
  const datas = compras.map((c) => new Date(c.data).getTime()).sort();
  const totalGasto = compras.reduce((a, c) => a + c.valor_pago, 0);
  const diasIntervalo = Math.max(
    7,
    Math.ceil((datas[datas.length - 1] - datas[0]) / (1000 * 60 * 60 * 24)) + 1
  );
  const semanas = diasIntervalo / 7;
  const mediaSemanal = totalGasto / semanas;

  return {
    valor: Math.round(mediaSemanal),
    baseadoEm: "historico",
    amostras: compras.length,
  };
}

export const CUSTO_WHEY_MENSAL = { min: 100, max: 130, doses: 33 };
