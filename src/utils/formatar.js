const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatoNumero = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

export function formatarMoeda(valor) {
  return formatoMoeda.format(valor)
}

export function formatarNumero(valor) {
  return formatoNumero.format(valor)
}