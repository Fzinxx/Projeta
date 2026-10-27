import test from 'node:test'
import assert from 'node:assert/strict'
import { calcularSimulacao } from './calcularSimulacao.js'

const exemplo = {
  precoVenda: 20,
  custoVariavel: 8,
  quantidade: 100,
  despesasFixas: 500,
}

test('calcula o cenário de exemplo com resultado positivo', () => {
  assert.deepEqual(calcularSimulacao(exemplo), {
    faturamento: 2000,
    custoVariavelTotal: 800,
    margemContribuicao: 12,
    resultadoMensal: 700,
    pontoEquilibrio: 42,
  })
})

test('calcula valores monetários com duas casas decimais', () => {
  const resultado = calcularSimulacao({
    ...exemplo,
    precoVenda: 19.9,
    custoVariavel: 8.35,
  })

  assert.deepEqual(resultado, {
    faturamento: 1990,
    custoVariavelTotal: 835,
    margemContribuicao: 11.55,
    resultadoMensal: 655,
    pontoEquilibrio: 44,
  })
})

test('não encontra ponto de equilíbrio com margem zero e despesas fixas', () => {
  const resultado = calcularSimulacao({
    ...exemplo,
    precoVenda: 8,
  })

  assert.equal(resultado.margemContribuicao, 0)
  assert.equal(resultado.resultadoMensal, -500)
  assert.equal(resultado.pontoEquilibrio, null)
})

test('calcula prejuízo com margem negativa', () => {
  const resultado = calcularSimulacao({
    ...exemplo,
    precoVenda: 6,
  })

  assert.equal(resultado.margemContribuicao, -2)
  assert.equal(resultado.resultadoMensal, -700)
  assert.equal(resultado.pontoEquilibrio, null)
})

test('mantém as despesas fixas quando não há vendas', () => {
  const resultado = calcularSimulacao({
    ...exemplo,
    quantidade: 0,
  })

  assert.equal(resultado.faturamento, 0)
  assert.equal(resultado.custoVariavelTotal, 0)
  assert.equal(resultado.resultadoMensal, -500)
  assert.equal(resultado.pontoEquilibrio, 42)
})

test('aceita todos os valores iguais a zero', () => {
  assert.deepEqual(
    calcularSimulacao({
      precoVenda: 0,
      custoVariavel: 0,
      quantidade: 0,
      despesasFixas: 0,
    }),
    {
      faturamento: 0,
      custoVariavelTotal: 0,
      margemContribuicao: 0,
      resultadoMensal: 0,
      pontoEquilibrio: 0,
    },
  )
})

test('o ponto de equilíbrio cobre as despesas na primeira quantidade inteira possível', () => {
  const { pontoEquilibrio } = calcularSimulacao(exemplo)

  const antes = calcularSimulacao({
    ...exemplo,
    quantidade: pontoEquilibrio - 1,
  })

  const noPonto = calcularSimulacao({
    ...exemplo,
    quantidade: pontoEquilibrio,
  })

  assert.ok(antes.resultadoMensal < 0)
  assert.ok(noPonto.resultadoMensal >= 0)
})

test('rejeita valores negativos, não numéricos e não finitos em cada campo', () => {
  const invalidos = [-1, NaN, Infinity, -Infinity, '20', '', null, undefined]

  for (const campo of Object.keys(exemplo)) {
    for (const valor of invalidos) {
      assert.throws(
        () => calcularSimulacao({ ...exemplo, [campo]: valor }),
        Error,
        `Deveria rejeitar ${campo} com valor ${String(valor)}`,
      )
    }
  }
})

test('rejeita quantidade fracionada ou acima do limite seguro', () => {
  for (const quantidade of [1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => calcularSimulacao({ ...exemplo, quantidade }),
      Error,
    )
  }
})

test('rejeita cálculos que ultrapassam o limite seguro em centavos', () => {
  assert.throws(
    () =>
      calcularSimulacao({
        ...exemplo,
        precoVenda: Number.MAX_SAFE_INTEGER,
      }),
    Error,
  )

  assert.throws(
    () =>
      calcularSimulacao({
        ...exemplo,
        quantidade: Number.MAX_SAFE_INTEGER,
      }),
    Error,
  )
})