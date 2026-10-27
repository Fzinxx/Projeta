import test from 'node:test'
import assert from 'node:assert/strict'
import { calcularNegocio } from './calcularNegocio.js'

const produtos = [
  {
    id: 'lanche',
    nome: 'Lanche',
    precoVenda: 20,
    custoVariavel: 8,
    quantidade: 100,
  },
  {
    id: 'suco',
    nome: 'Suco',
    precoVenda: 6,
    custoVariavel: 2,
    quantidade: 100,
  },
]

test('soma os produtos e desconta as despesas fixas uma única vez', () => {
  const resultado = calcularNegocio({ produtos, despesasFixas: 500 })

  assert.equal(resultado.faturamento, 2600)
  assert.equal(resultado.custoVariavelTotal, 1000)
  assert.equal(resultado.margemContribuicaoTotal, 1600)
  assert.equal(resultado.resultadoMensal, 1100)
  assert.equal(resultado.quantidadeTotal, 200)
  assert.equal(resultado.pontoEquilibrioFaturamento, 812.5)
  assert.equal(resultado.produtos[0].contribuicaoTotal, 1200)
  assert.equal(resultado.produtos[1].contribuicaoTotal, 400)
})

test('mantém despesas fixas quando todos os produtos estão sem vendas', () => {
  const resultado = calcularNegocio({
    produtos: produtos.map((produto) => ({ ...produto, quantidade: 0 })),
    despesasFixas: 500,
  })

  assert.equal(resultado.faturamento, 0)
  assert.equal(resultado.resultadoMensal, -500)
  assert.equal(resultado.margemPercentual, null)
  assert.equal(resultado.pontoEquilibrioFaturamento, null)
})

test('não calcula equilíbrio com contribuição negativa e despesas positivas', () => {
  const resultado = calcularNegocio({
    produtos: [{ ...produtos[0], precoVenda: 5 }],
    despesasFixas: 500,
  })

  assert.equal(resultado.resultadoMensal, -800)
  assert.equal(resultado.pontoEquilibrioFaturamento, null)
})

test('sem despesas fixas o faturamento de equilíbrio é zero', () => {
  const resultado = calcularNegocio({ produtos, despesasFixas: 0 })

  assert.equal(resultado.resultadoMensal, 1600)
  assert.equal(resultado.pontoEquilibrioFaturamento, 0)
})

test('rejeita negócio vazio, nomes vazios e dados numéricos inválidos', () => {
  assert.throws(() =>
    calcularNegocio({ produtos: [], despesasFixas: 500 }),
  )

  assert.throws(() =>
    calcularNegocio({
      produtos: [{ ...produtos[0], nome: ' ' }],
      despesasFixas: 500,
    }),
  )

  assert.throws(() =>
    calcularNegocio({
      produtos: [{ ...produtos[0], quantidade: 1.5 }],
      despesasFixas: 500,
    }),
  )

  assert.throws(() =>
    calcularNegocio({ produtos, despesasFixas: -1 }),
  )

  assert.throws(() =>
    calcularNegocio({ produtos, despesasFixas: Infinity }),
  )
})

test('rejeita totais inseguros mesmo quando cada produto é calculável', () => {
  const produtoGrande = {
    nome: 'Produto',
    precoVenda: 50_000_000_000,
    custoVariavel: 0,
    quantidade: 1000,
  }

  assert.throws(() =>
    calcularNegocio({
      produtos: [produtoGrande, produtoGrande],
      despesasFixas: 0,
    }),
  )
})