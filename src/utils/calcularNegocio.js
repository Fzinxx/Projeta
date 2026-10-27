import { calcularSimulacao } from './calcularSimulacao.js'

function conferirInteiroSeguro(valor) {
  if (!Number.isSafeInteger(valor)) {
    throw new Error('Os valores informados são grandes demais para calcular.')
  }

  return valor
}

export function calcularNegocio({ produtos, despesasFixas }) {
  if (!Array.isArray(produtos) || produtos.length === 0) {
    throw new Error('Adicione pelo menos um produto.')
  }

  if (!Number.isFinite(despesasFixas) || despesasFixas < 0) {
    throw new Error('Informe despesas fixas válidas, maiores ou iguais a zero.')
  }

  const despesasCentavos = conferirInteiroSeguro(
    Math.round(despesasFixas * 100),
  )

  let faturamentoCentavos = 0
  let custoCentavos = 0
  let quantidadeTotal = 0

  const produtosCalculados = produtos.map((produto, indice) => {
    const nome = produto.nome?.trim()

    if (!nome) {
      throw new Error(`Informe o nome do produto ${indice + 1}.`)
    }

    let resultado

    try {
      resultado = calcularSimulacao({
        precoVenda: produto.precoVenda,
        custoVariavel: produto.custoVariavel,
        quantidade: produto.quantidade,
        despesasFixas: 0,
      })
    } catch (erro) {
      throw new Error(`${nome}: ${erro.message}`)
    }

    const receitaProduto = conferirInteiroSeguro(
      Math.round(resultado.faturamento * 100),
    )

    const custoProduto = conferirInteiroSeguro(
      Math.round(resultado.custoVariavelTotal * 100),
    )

    faturamentoCentavos = conferirInteiroSeguro(
      faturamentoCentavos + receitaProduto,
    )

    custoCentavos = conferirInteiroSeguro(
      custoCentavos + custoProduto,
    )

    quantidadeTotal = conferirInteiroSeguro(
      quantidadeTotal + produto.quantidade,
    )

    return {
      id: produto.id,
      nome,
      quantidade: produto.quantidade,
      faturamento: resultado.faturamento,
      custoVariavelTotal: resultado.custoVariavelTotal,
      margemPorUnidade: resultado.margemContribuicao,
      contribuicaoTotal: conferirInteiroSeguro(
        receitaProduto - custoProduto,
      ) / 100,
    }
  })

  const contribuicaoCentavos = conferirInteiroSeguro(
    faturamentoCentavos - custoCentavos,
  )

  const resultadoCentavos = conferirInteiroSeguro(
    contribuicaoCentavos - despesasCentavos,
  )

  const indiceMargem = faturamentoCentavos > 0
    ? contribuicaoCentavos / faturamentoCentavos
    : null

  let pontoEquilibrioFaturamento = null

  if (despesasCentavos === 0) {
    pontoEquilibrioFaturamento = 0
  } else if (indiceMargem !== null && indiceMargem > 0) {
    const equilibrioCentavos = Math.ceil(despesasCentavos / indiceMargem)

    pontoEquilibrioFaturamento = conferirInteiroSeguro(
      equilibrioCentavos,
    ) / 100
  }

  return {
    produtos: produtosCalculados,
    quantidadeTotal,
    faturamento: faturamentoCentavos / 100,
    custoVariavelTotal: custoCentavos / 100,
    margemContribuicaoTotal: contribuicaoCentavos / 100,
    margemPercentual: indiceMargem === null ? null : indiceMargem * 100,
    despesasFixas: despesasCentavos / 100,
    resultadoMensal: resultadoCentavos / 100,
    pontoEquilibrioFaturamento,
  }
}