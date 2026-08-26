export const states = [
  { uf: 'AC', nome: 'Acre', mediaKwh: 145 },
  { uf: 'AL', nome: 'Alagoas', mediaKwh: 118 },
  { uf: 'AP', nome: 'Amapá', mediaKwh: 165 },
  { uf: 'AM', nome: 'Amazonas', mediaKwh: 160 },
  { uf: 'BA', nome: 'Bahia', mediaKwh: 120 },
  { uf: 'CE', nome: 'Ceará', mediaKwh: 110 },
  { uf: 'DF', nome: 'Distrito Federal', mediaKwh: 175 },
  { uf: 'ES', nome: 'Espírito Santo', mediaKwh: 160 },
  { uf: 'GO', nome: 'Goiás', mediaKwh: 168 },
  { uf: 'MA', nome: 'Maranhão', mediaKwh: 100 },
  { uf: 'MT', nome: 'Mato Grosso', mediaKwh: 165 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', mediaKwh: 168 },
  { uf: 'MG', nome: 'Minas Gerais', mediaKwh: 158 },
  { uf: 'PA', nome: 'Pará', mediaKwh: 145 },
  { uf: 'PB', nome: 'Paraíba', mediaKwh: 112 },
  { uf: 'PR', nome: 'Paraná', mediaKwh: 165 },
  { uf: 'PE', nome: 'Pernambuco', mediaKwh: 120 },
  { uf: 'PI', nome: 'Piauí', mediaKwh: 100 },
  { uf: 'RJ', nome: 'Rio de Janeiro', mediaKwh: 185 },
  { uf: 'RN', nome: 'Rio Grande do Norte', mediaKwh: 115 },
  { uf: 'RS', nome: 'Rio Grande do Sul', mediaKwh: 175 },
  { uf: 'RO', nome: 'Rondônia', mediaKwh: 150 },
  { uf: 'RR', nome: 'Roraima', mediaKwh: 158 },
  { uf: 'SC', nome: 'Santa Catarina', mediaKwh: 170 },
  { uf: 'SP', nome: 'São Paulo', mediaKwh: 185 },
  { uf: 'SE', nome: 'Sergipe', mediaKwh: 115 },
  { uf: 'TO', nome: 'Tocantins', mediaKwh: 140 }
]

export const MEDIA_NACIONAL_KWH = 152

export function getStateAverage (uf) {
  const s = states.find((x) => x.uf === uf)
  return s ? s.mediaKwh : MEDIA_NACIONAL_KWH
}
