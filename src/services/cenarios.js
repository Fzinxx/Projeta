import { supabase } from '../lib/supabase.js'
import { calcularNegocio } from '../utils/calcularNegocio.js'

export function calcularDadosCenario(dados) {
  if (
    !dados ||
    typeof dados.nome !== 'string' ||
    !dados.nome.trim() ||
    !Array.isArray(dados.produtos) ||
    dados.produtos.length === 0 ||
    String(dados.despesasFixas ?? '').trim() === ''
  ) {
    throw new Error('Os dados deste cenário estão incompletos.')
  }

  const produtos = dados.produtos.map((produto) => {
    const campos = ['precoVenda', 'custoVariavel', 'quantidade']

    if (
      !produto ||
      campos.some(
        (campo) => String(produto[campo] ?? '').trim() === '',
      )
    ) {
      throw new Error('Preencha todos os valores dos produtos.')
    }

    return {
      ...produto,
      precoVenda: Number(produto.precoVenda),
      custoVariavel: Number(produto.custoVariavel),
      quantidade: Number(produto.quantidade),
    }
  })

  return calcularNegocio({
    despesasFixas: Number(dados.despesasFixas),
    produtos,
  })
}

export async function salvarCenario(negocioId, nome, dados) {
  const nomeLimpo = nome.trim()

  if (!nomeLimpo || nomeLimpo.length > 100) {
    throw new Error('Informe um nome de até 100 caracteres.')
  }

  calcularDadosCenario(dados)

  const { data, error } = await supabase
    .from('cenarios')
    .insert({
      negocio_id: negocioId,
      nome: nomeLimpo,
      dados: {
        versao: 1,
        negocio: structuredClone(dados),
      },
    })
    .select('id, nome, dados, criado_em')
    .single()

  if (error) {
    throw new Error(
      'Não foi possível salvar o cenário. Confira sua conexão.',
    )
  }

  return data
}

export async function listarCenarios(negocioId) {
  const { data, error } = await supabase
    .from('cenarios')
    .select('id, nome, dados, criado_em')
    .eq('negocio_id', negocioId)
    .order('criado_em', { ascending: false })

  if (error) {
    throw new Error('Não foi possível carregar os cenários.')
  }

  return data
}