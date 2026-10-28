export function criarProdutoVazio() {
  return {
    id: crypto.randomUUID(),
    nome: '',
    precoVenda: '',
    custoVariavel: '',
    quantidade: '',
  }
}

export function criarNegocioVazio() {
  return {
    nome: '',
    descricao: '',
    despesasFixas: '',
    produtos: [criarProdutoVazio()],
  }
}

export function temConteudoNegocio(dados) {
  return (
    dados.nome.trim() !== '' ||
    dados.descricao.trim() !== '' ||
    dados.despesasFixas !== '' ||
    dados.produtos.some((produto) =>
      ['nome', 'precoVenda', 'custoVariavel', 'quantidade'].some(
        (campo) => String(produto[campo]).trim() !== '',
      ),
    )
  )
}

export function normalizarCentavos(digitos) {
  if (!/^\d*$/.test(digitos)) return null
  if (!digitos) return ''

  const limpos = digitos.replace(/^0+(?=\d)/g, '')

  if (limpos.length > 14) return null

  const preenchidos = limpos.padStart(3, '0')

  return `${preenchidos.slice(0, -2)}.${preenchidos.slice(-2)}`
}

export function interpretarColagemMoeda(texto) {
  const limpo = texto
    .trim()
    .replace(/^R\$\s*/, '')
    .replace(/\s/g, '')

  let normalizado

  if (
    /^\d{1,3}(?:\.\d{3})*,\d{1,2}$/.test(limpo) ||
    /^\d+,\d{1,2}$/.test(limpo)
  ) {
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (/^\d+(?:\.\d{1,2})?$/.test(limpo)) {
    normalizado = limpo
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(limpo)) {
    normalizado = limpo.replace(/\./g, '')
  } else {
    return null
  }

  const [inteiros, centavos = ''] = normalizado.split('.')

  return normalizarCentavos(inteiros + centavos.padEnd(2, '0'))
}