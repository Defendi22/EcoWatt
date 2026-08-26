export const tipsByAppliance = {
  ar_condicionado: 'Mantenha o ar-condicionado entre 23°C e 26°C e limpe os filtros mensalmente. Cada grau a mais pode elevar o consumo em até 8%.',
  chuveiro: 'Prefira banhos mais curtos e, no calor, desligue o modo "inverno". O chuveiro é um dos maiores vilões da conta de luz.',
  geladeira: 'Não coloque alimentos quentes na geladeira e verifique se a borracha da porta está vedando bem. Evite abrir sem necessidade.',
  maquina_lavar: 'Acumule roupas para usar a máquina de lavar na capacidade máxima, de preferência no modo frio.',
  ferro: 'Passe roupas de uma vez só, acumulando a quantidade, e aproveite para desligar o ferro alguns minutos antes do fim.',
  microondas: 'Prefira o micro-ondas ao forno elétrico para porções pequenas: ele gasta bem menos energia.',
  tv: 'Diminua o brilho da TV e use o modo econômico. Televisores modernos consomem menos energia.',
  forno_eletrico: 'Evite abrir o forno elétrico durante o preparo: cada abertura perde calor e aumenta o consumo.',
  ventilador: 'Use ventiladores antes de ligar o ar-condicionado: o consumo é bem menor.',
  lampada_led: 'Substitua todas as lâmpadas por LED: consomem até 80% menos e duram muito mais.'
}

export const tipsGeneral = [
  'Desligue aparelhos da tomada quando não estiver usando: o "standby" pode representar até 12% da conta.',
  'Aproveite a luz natural durante o dia e apague as lâmpadas dos ambientes vazios.',
  'Evite usar a máquina de lavar em horário de pico (18h às 21h), quando a tarifa costuma ser mais cara.',
  'Realize manutenção na fiação e instalação elétrica: fios mal dimensionados aumentam as perdas.'
]

export function buildTips (reading) {
  const tips = new Set()
  if (reading && Array.isArray(reading.aparelhos)) {
    for (const item of reading.aparelhos) {
      const tip = tipsByAppliance[item.id]
      if (tip) tips.add(tip)
    }
  }
  const total = [...tips]
  return total.length >= 2 ? total.slice(0, 3) : [...total, ...tipsGeneral].slice(0, 3)
}
