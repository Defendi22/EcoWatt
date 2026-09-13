// Dados baseados no Anuário Estatístico de Energia Elétrica 2024 (EPE - ano base 2023)
// Consumo médio mensal residencial por região em kWh

export const REGIONAL_AVERAGES: Record<string, number> = {
  Norte: 204.5,
  Nordeste: 131.1,
  Sudeste: 174.7,
  Sul: 198.9,
  "Centro-Oeste": 203.1,
};

// Média nacional residencial (2023)
export const NATIONAL_AVERAGE_KWH = 166.5;

// Tarifa média nacional (R$/kWh) - referência ANEEL 2024
export const NATIONAL_AVERAGE_TARIFF = 0.75;

export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const REGIONS = ["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"];

export type ComparisonResult = {
  currentKwh: number;
  previousKwh: number | null;
  nationalAvgKwh: number;
  regionalAvgKwh: number;
  region: string;
  diffFromPrevious: number | null;
  diffFromNational: number;
  diffFromRegional: number;
  isBetterThanPrevious: boolean | null;
  isBetterThanNational: boolean;
  isBetterThanRegional: boolean;
  savingsVsPrevious: number | null;
  savingsVsNational: number;
  savingsVsRegional: number;
  celebrationLevel: 0 | 1 | 2 | 3; // 0=none, 1=small, 2=medium, 3=amazing
  celebrationMessages: string[];
};

export function compareEnergy(
  currentKwh: number,
  previousKwh: number | null,
  region: string,
  valueReais: number
): ComparisonResult {
  const nationalAvgKwh = NATIONAL_AVERAGE_KWH;
  const regionalAvgKwh = REGIONAL_AVERAGES[region] ?? NATIONAL_AVERAGE_KWH;

  const diffFromPrevious = previousKwh !== null ? currentKwh - previousKwh : null;
  const diffFromNational = currentKwh - nationalAvgKwh;
  const diffFromRegional = currentKwh - regionalAvgKwh;

  const isBetterThanPrevious = previousKwh !== null ? currentKwh < previousKwh : null;
  const isBetterThanNational = currentKwh < nationalAvgKwh;
  const isBetterThanRegional = currentKwh < regionalAvgKwh;

  const tariff = valueReais / currentKwh;
  const savingsVsPrevious = previousKwh !== null ? (previousKwh - currentKwh) * tariff : null;
  const savingsVsNational = (nationalAvgKwh - currentKwh) * tariff;
  const savingsVsRegional = (regionalAvgKwh - currentKwh) * tariff;

  const messages: string[] = [];
  let level: 0 | 1 | 2 | 3 = 0;

  const goods: string[] = [];

  if (isBetterThanPrevious === true) {
    const pct = Math.abs((diffFromPrevious! / previousKwh!) * 100).toFixed(1);
    goods.push("mes_anterior");
    messages.push(`⚡ Você consumiu ${pct}% menos que no mês anterior! Incrível evolução!`);
  }

  if (isBetterThanNational) {
    const pct = Math.abs((diffFromNational / nationalAvgKwh) * 100).toFixed(1);
    goods.push("nacional");
    messages.push(`🌎 Seu consumo está ${pct}% abaixo da média nacional brasileira!`);
  }

  if (isBetterThanRegional) {
    const pct = Math.abs((diffFromRegional / regionalAvgKwh) * 100).toFixed(1);
    goods.push("regional");
    messages.push(`📍 Você está ${pct}% abaixo da média da região ${region}!`);
  }

  if (goods.length === 3) {
    level = 3;
    messages.unshift("🏆 TRIPLO CAMPEÃO! Você superou TODAS as comparações!");
  } else if (goods.length === 2) {
    level = 2;
    messages.unshift("🥇 Duplo destaque! Você superou duas referências de consumo!");
  } else if (goods.length === 1) {
    level = 1;
    messages.unshift("🌱 Parabéns! Você está contribuindo para a economia de energia!");
  }

  if (level === 0 && messages.length === 0) {
    if (isBetterThanPrevious === false) {
      messages.push("📈 Seu consumo aumentou em relação ao mês anterior. Tente reduzir!");
    }
    if (!isBetterThanNational) {
      messages.push(`📊 Sua média nacional é ${Math.abs(diffFromNational).toFixed(1)} kWh a mais que a média brasileira.`);
    }
    if (!isBetterThanRegional) {
      messages.push(`📍 Você está ${Math.abs(diffFromRegional).toFixed(1)} kWh acima da média da sua região.`);
    }
  }

  return {
    currentKwh,
    previousKwh,
    nationalAvgKwh,
    regionalAvgKwh,
    region,
    diffFromPrevious,
    diffFromNational,
    diffFromRegional,
    isBetterThanPrevious,
    isBetterThanNational,
    isBetterThanRegional,
    savingsVsPrevious,
    savingsVsNational,
    savingsVsRegional,
    celebrationLevel: level,
    celebrationMessages: messages,
  };
}
