export const appliances = [
  { id: 'geladeira', nome: 'Geladeira', potenciaW: 150 },
  { id: 'freezer', nome: 'Freezer', potenciaW: 300 },
  { id: 'ar_condicionado', nome: 'Ar-condicionado', potenciaW: 1200 },
  { id: 'chuveiro', nome: 'Chuveiro elétrico', potenciaW: 5500 },
  { id: 'maquina_lavar', nome: 'Máquina de lavar', potenciaW: 500 },
  { id: 'microondas', nome: 'Micro-ondas', potenciaW: 1200 },
  { id: 'ferro', nome: 'Ferro de passar', potenciaW: 1000 },
  { id: 'tv', nome: 'Televisão', potenciaW: 120 },
  { id: 'notebook', nome: 'Notebook', potenciaW: 65 },
  { id: 'desktop', nome: 'Computador de mesa', potenciaW: 250 },
  { id: 'ventilador', nome: 'Ventilador', potenciaW: 80 },
  { id: 'aspirador', nome: 'Aspirador de pó', potenciaW: 1000 },
  { id: 'forno_eletrico', nome: 'Forno elétrico', potenciaW: 1500 },
  { id: 'lampada_led', nome: 'Lâmpada LED', potenciaW: 10 },
  { id: 'torradeira', nome: 'Torradeira', potenciaW: 800 },
  { id: 'lavadora_loucas', nome: 'Lava-louças', potenciaW: 1200 }
]

export function estimateFromAppliances (items) {
  if (!Array.isArray(items) || items.length === 0) return 0
  const kWh = items.reduce((sum, item) => {
    const a = appliances.find((x) => x.id === item.id)
    if (!a || !item.qtd || item.horasDia <= 0) return sum
    return sum + (a.potenciaW * item.qtd * item.horasDia * 30) / 1000
  }, 0)
  return Math.round(kWh * 100) / 100
}
