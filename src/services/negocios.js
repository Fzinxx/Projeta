import { supabase } from '../lib/supabase.js'
import { calcularNegocio } from '../utils/calcularNegocio.js'

export async function salvarNegocio(id, dados) {
  if (!dados.nome.trim()) {
    throw new Error('Informe o nome do negócio.')
  }

  if (dados.despesasFixas.trim() === '') {
    throw new Error('Informe as despesas fixas.')
  }

  const produtos = dados.produtos.map((produto) => {
    const campos = ['precoVenda', 'custoVariavel', 'quantidade']

    if (campos.some((campo) => String(produto[campo]).trim() === '')) {
      throw new Error('Preencha todos os valores dos produtos.')
    }

    return {
      nome: produto.nome.trim(),
      precoVenda: Number(produto.precoVenda),
      custoVariavel: Number(produto.custoVariavel),
      quantidade: Number(produto.quantidade),
    }
  })

  const despesasFixas = Number(dados.despesasFixas)

  calcularNegocio({ produtos, despesasFixas })

  const { data, error } = await supabase.rpc('salvar_negocio', {
    p_id: id,
    p_nome: dados.nome.trim(),
    p_descricao: dados.descricao,
    p_despesas_fixas: despesasFixas,
    p_produtos: produtos,
  })

  if (error) {
    throw new Error(
      'Não foi possível salvar. Confira sua conexão e tente novamente.',
    )
  }

  return data
}

export async function listarNegocios() {
  const { data, error } = await supabase
    .from('negocios')
    .select(`
      id,
      nome,
      descricao,
      despesas_fixas,
      criado_em,
      produtos (
        id,
        nome,
        preco_venda,
        custo_variavel,
        quantidade,
        ordem
      )
    `)
    .order('criado_em', { ascending: false })

  if (error) {
    throw new Error(
      'Não foi possível carregar seus negócios. Tente novamente.',
    )
  }

  return data.map((negocio) => ({
    id: negocio.id,
    dados: {
      nome: negocio.nome,
      descricao: negocio.descricao,
      despesasFixas: String(negocio.despesas_fixas),
      produtos: [...negocio.produtos]
        .sort((a, b) => a.ordem - b.ordem)
        .map((produto) => ({
          id: produto.id,
          nome: produto.nome,
          precoVenda: String(produto.preco_venda),
          custoVariavel: String(produto.custo_variavel),
          quantidade: String(produto.quantidade),
        })),
    },
  }))
}

export async function excluirNegocio(id) {
  if (!id) {
    throw new Error('Selecione um negócio válido para excluir.')
  }

  const { data, error } = await supabase
    .from('negocios')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(
      'Não foi possível excluir o negócio. Confira sua conexão.',
    )
  }

  if (!data) {
    throw new Error(
      'O negócio não foi encontrado ou você não tem acesso. ' +
      'Feche e abra a lista para atualizar.',
    )
  }

  return data.id
}