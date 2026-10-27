import { useState } from 'react'
import { calcularNegocio } from './utils/calcularNegocio.js'
import { formatarMoeda, formatarNumero } from './utils/formatar.js'
import GraficoSimulacao from './components/GraficoSimulacao.jsx'
import MeusNegocios from './components/MeusNegocios.jsx'
import './App.css'
import './Negocio.css'

const camposProduto = [
  {
    nome: 'precoVenda',
    titulo: 'Preço por unidade (R$)',
    passo: '0.01',
  },
  {
    nome: 'custoVariavel',
    titulo: 'Custo por unidade (R$)',
    passo: '0.01',
  },
  {
    nome: 'quantidade',
    titulo: 'Vendas no mês (unidades)',
    passo: '1',
  },
]

const indicadoresComparacao = [
  { nome: 'faturamento', titulo: 'Faturamento estimado' },
  { nome: 'custoVariavelTotal', titulo: 'Custo variável total' },
  {
    nome: 'margemContribuicaoTotal',
    titulo: 'Contribuição total dos produtos',
  },
  { nome: 'despesasFixas', titulo: 'Despesas fixas' },
  { nome: 'resultadoMensal', titulo: 'Resultado mensal estimado' },
]

function criarExemplo() {
  return {
    nome: 'Minha lanchonete',
    descricao: 'Simulação mensal de lanches e sucos.',
    despesasFixas: '500',
    produtos: [
      {
        id: crypto.randomUUID(),
        nome: 'Lanche',
        precoVenda: '20',
        custoVariavel: '8',
        quantidade: '100',
      },
      {
        id: crypto.randomUUID(),
        nome: 'Suco',
        precoVenda: '6',
        custoVariavel: '2',
        quantidade: '100',
      },
    ],
  }
}

function avaliarNegocio(dados) {
  if (dados.despesasFixas.trim() === '') {
    return {
      resultados: null,
      erro: 'Informe as despesas fixas mensais.',
    }
  }

  const produtoIncompleto = dados.produtos.find((produto) =>
    camposProduto.some(
      ({ nome }) => String(produto[nome]).trim() === '',
    ),
  )

  if (produtoIncompleto) {
    return {
      resultados: null,
      erro: 'Preencha todos os campos numéricos dos produtos.',
    }
  }

  try {
    const resultados = calcularNegocio({
      despesasFixas: Number(dados.despesasFixas),
      produtos: dados.produtos.map((produto) => ({
        ...produto,
        precoVenda: Number(produto.precoVenda),
        custoVariavel: Number(produto.custoVariavel),
        quantidade: Number(produto.quantidade),
      })),
    })

    return { resultados, erro: '' }
  } catch (falha) {
    return { resultados: null, erro: falha.message }
  }
}

export default function SimuladorNegocio() {
  const [dados, setDados] = useState(criarExemplo)
  const [cenarioBase, setCenarioBase] = useState(null)

  const { resultados, erro } = avaliarNegocio(dados)
  const equilibrio = resultados?.pontoEquilibrioFaturamento

  const produtosSemMargem =
    resultados?.produtos.filter(
      (produto) => produto.margemPorUnidade <= 0,
    ) ?? []

  function alterarNegocio(evento) {
    const { name, value } = evento.target

    setDados((anteriores) => ({
      ...anteriores,
      [name]: value,
    }))
  }

  function alterarProduto(id, campo, valor) {
    setDados((anteriores) => ({
      ...anteriores,
      produtos: anteriores.produtos.map((produto) =>
        produto.id === id
          ? { ...produto, [campo]: valor }
          : produto,
      ),
    }))
  }

  function adicionarProduto() {
    const id = crypto.randomUUID()

    setDados((anteriores) => ({
      ...anteriores,
      produtos: [
        ...anteriores.produtos,
        {
          id,
          nome: `Produto ${anteriores.produtos.length + 1}`,
          precoVenda: '0',
          custoVariavel: '0',
          quantidade: '0',
        },
      ],
    }))
  }

  function removerProduto(id) {
    setDados((anteriores) => {
      if (anteriores.produtos.length <= 1) {
        return anteriores
      }

      return {
        ...anteriores,
        produtos: anteriores.produtos.filter(
          (produto) => produto.id !== id,
        ),
      }
    })
  }

  function guardarCenarioBase() {
    if (!resultados) return

    setCenarioBase({
      nome: dados.nome.trim() || 'Negócio sem nome',
      resultados: { ...resultados },
    })
  }

  function abrirNegocio(negocio) {
    setDados(negocio)
    setCenarioBase(null)
  }

  return (
    <main className="simulador negocio">
      <header>
        <h1>Projeta — Simulador de Negócios</h1>
        <p>
          Monte seu negócio, ajuste os produtos e descubra como suas
          decisões afetam o resultado mensal.
        </p>
      </header>

      <MeusNegocios
        dados={dados}
        podeSalvar={Boolean(resultados) && dados.nome.trim() !== ''}
        onAbrir={abrirNegocio}
      />

      <section aria-labelledby="titulo-dados">
        <h2 id="titulo-dados">Seu negócio</h2>

        <div>
          <label htmlFor="nome-negocio">Nome do negócio</label>
          <input
            id="nome-negocio"
            name="nome"
            type="text"
            maxLength={100}
            required
            value={dados.nome}
            onChange={alterarNegocio}
          />
        </div>

        <div>
          <label htmlFor="descricao-negocio">Descrição</label>
          <textarea
            id="descricao-negocio"
            name="descricao"
            maxLength={500}
            rows={3}
            value={dados.descricao}
            onChange={alterarNegocio}
          />
        </div>

        <div>
          <label htmlFor="despesasFixas">
            Despesas fixas mensais (R$)
          </label>
          <input
            id="despesasFixas"
            name="despesasFixas"
            type="number"
            min="0"
            step="0.01"
            required
            value={dados.despesasFixas}
            onChange={alterarNegocio}
            aria-describedby={
              erro
                ? 'ajuda-despesas erro-simulacao'
                : 'ajuda-despesas'
            }
          />
          <p id="ajuda-despesas" className="ajuda-campo">
            Aluguel, internet e outras despesas do negócio. Esse valor
            é descontado uma única vez.
          </p>
        </div>

        <div className="acoes-negocio">
          <button
            type="button"
            onClick={() => setDados(criarExemplo())}
          >
            Restaurar exemplo
          </button>

          <button
            type="button"
            onClick={guardarCenarioBase}
            disabled={!resultados}
          >
            {cenarioBase
              ? 'Substituir cenário base'
              : 'Guardar cenário base'}
          </button>

          {cenarioBase && (
            <button
              type="button"
              onClick={() => setCenarioBase(null)}
            >
              Limpar cenário base
            </button>
          )}
        </div>

        <p>
          O cenário base guarda os resultados para comparação nesta
          página. Restaurar o exemplo altera apenas o cenário atual.
        </p>
      </section>

      <section aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">
          Resumo — {dados.nome.trim() || 'Negócio sem nome'}
        </h2>

        {erro && (
          <p id="erro-simulacao" role="alert">
            {erro}
          </p>
        )}

        {resultados && (
          <>
            <dl>
              <dt>Faturamento estimado</dt>
              <dd>{formatarMoeda(resultados.faturamento)}</dd>

              <dt>Custo variável total</dt>
              <dd>{formatarMoeda(resultados.custoVariavelTotal)}</dd>

              <dt>Contribuição total dos produtos</dt>
              <dd>
                {formatarMoeda(resultados.margemContribuicaoTotal)}
              </dd>

              <dt>Resultado mensal estimado</dt>
              <dd>{formatarMoeda(resultados.resultadoMensal)}</dd>

              <dt>Margem de contribuição sobre o faturamento</dt>
              <dd>
                {resultados.margemPercentual === null
                  ? 'Sem faturamento'
                  : `${formatarNumero(resultados.margemPercentual)}%`}
              </dd>

              <dt>Faturamento de equilíbrio estimado</dt>
              <dd>
                {equilibrio === null
                  ? 'Indisponível neste cenário'
                  : formatarMoeda(equilibrio)}
              </dd>
            </dl>

            <div className="leitura-resultado">
              <h3>O que esse cenário mostra?</h3>

              {resultados.resultadoMensal > 0 && (
                <p>
                  Após os custos informados, o saldo estimado é de{' '}
                  {formatarMoeda(resultados.resultadoMensal)} no mês.
                </p>
              )}

              {resultados.resultadoMensal < 0 && (
                <p>
                  Os custos informados superam o faturamento em{' '}
                  {formatarMoeda(
                    Math.abs(resultados.resultadoMensal),
                  )}{' '}
                  no mês.
                </p>
              )}

              {resultados.resultadoMensal === 0 && (
                <p>
                  O faturamento cobre exatamente os custos informados,
                  sem sobra no mês.
                </p>
              )}

              {equilibrio !== null && equilibrio > 0 && (
                <p>
                  Mantendo os preços, os custos unitários e a proporção
                  de vendas entre os produtos, o faturamento de
                  referência para cobrir as despesas é de{' '}
                  {formatarMoeda(equilibrio)}. É uma estimativa: as
                  quantidades reais precisam ser inteiras.
                </p>
              )}

              {equilibrio === 0 && (
                <p>
                  Sem despesas fixas, zero vendas já resulta em zero.
                  Confira a margem dos produtos para avaliar o efeito
                  das vendas.
                </p>
              )}

              {equilibrio === null && (
                <p>
                  Não foi possível estimar o faturamento de equilíbrio.
                  Com despesas fixas, é necessário ter faturamento e
                  contribuição total positiva para essa estimativa.
                </p>
              )}
            </div>

            {produtosSemMargem.length > 0 && (
              <p>
                Atenção: estes produtos têm margem por unidade zero
                ou negativa:{' '}
                {produtosSemMargem
                  .map((produto) => produto.nome)
                  .join(', ')}
                . Aumentar suas vendas não melhora o resultado com
                os valores atuais.
              </p>
            )}
          </>
        )}

        <p>
          Estimativa mensal baseada somente nos custos informados.
          O resultado não representa lucro líquido contábil.
        </p>
      </section>

      <section
        aria-labelledby="titulo-produtos"
        className="secao-produtos"
      >
        <div className="cabecalho-produtos">
          <div>
            <h2 id="titulo-produtos">Produtos do negócio</h2>
            <p>
              Cadastre o que pretende vender e informe a quantidade
              mensal.
            </p>
          </div>

          <button type="button" onClick={adicionarProduto}>
            + Adicionar produto
          </button>
        </div>

        <div className="lista-produtos">
          {dados.produtos.map((produto, indice) => (
            <fieldset key={produto.id} className="produto">
              <legend>Produto {indice + 1}</legend>

              <div className="campos-produto">
                <div>
                  <label htmlFor={`nome-${produto.id}`}>
                    Nome do produto
                  </label>
                  <input
                    id={`nome-${produto.id}`}
                    type="text"
                    maxLength={100}
                    required
                    value={produto.nome}
                    onChange={(evento) =>
                      alterarProduto(
                        produto.id,
                        'nome',
                        evento.target.value,
                      )
                    }
                    aria-describedby={
                      erro ? 'erro-simulacao' : undefined
                    }
                  />
                </div>

                {camposProduto.map(({ nome, titulo, passo }) => (
                  <div key={nome}>
                    <label htmlFor={`${nome}-${produto.id}`}>
                      {titulo}
                    </label>
                    <input
                      id={`${nome}-${produto.id}`}
                      type="number"
                      min="0"
                      step={passo}
                      required
                      value={produto[nome]}
                      onChange={(evento) =>
                        alterarProduto(
                          produto.id,
                          nome,
                          evento.target.value,
                        )
                      }
                      aria-describedby={
                        erro ? 'erro-simulacao' : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                className="remover-produto"
                type="button"
                onClick={() => removerProduto(produto.id)}
                disabled={dados.produtos.length <= 1}
                aria-label={`Remover ${produto.nome || `produto ${indice + 1}`}`}
              >
                Remover produto
              </button>
            </fieldset>
          ))}
        </div>
      </section>

      <GraficoSimulacao
        resultados={resultados}
        despesasFixas={resultados?.despesasFixas ?? 0}
      />

      {resultados && (
        <section
          aria-labelledby="titulo-contribuicao"
          className="secao-tabela"
        >
          <h2 id="titulo-contribuicao">
            Participação dos produtos
          </h2>

          <table>
            <caption>
              A contribuição é o faturamento do produto menos seus
              custos variáveis. As despesas fixas são descontadas no
              resumo do negócio.
            </caption>

            <thead>
              <tr>
                <th scope="col">Produto</th>
                <th scope="col">Unidades</th>
                <th scope="col">Faturamento</th>
                <th scope="col">Margem por unidade</th>
                <th scope="col">Contribuição total</th>
              </tr>
            </thead>

            <tbody>
              {resultados.produtos.map((produto) => (
                <tr key={produto.id}>
                  <th scope="row">{produto.nome}</th>
                  <td>{formatarNumero(produto.quantidade)}</td>
                  <td>{formatarMoeda(produto.faturamento)}</td>
                  <td>{formatarMoeda(produto.margemPorUnidade)}</td>
                  <td>{formatarMoeda(produto.contribuicaoTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {cenarioBase && (
        <section aria-labelledby="titulo-comparacao">
          <h2 id="titulo-comparacao">Comparação de cenários</h2>

          <table>
            <caption>
              Cenário base: {cenarioBase.nome}. Cenário atual:{' '}
              {dados.nome.trim() || 'Negócio sem nome'}.
            </caption>

            <thead>
              <tr>
                <th scope="col">Indicador</th>
                <th scope="col">Cenário base</th>
                <th scope="col">Cenário atual</th>
                <th scope="col">Diferença</th>
              </tr>
            </thead>

            <tbody>
              {indicadoresComparacao.map(({ nome, titulo }) => (
                <tr key={nome}>
                  <th scope="row">{titulo}</th>
                  <td>
                    {formatarMoeda(cenarioBase.resultados[nome])}
                  </td>
                  <td>
                    {resultados
                      ? formatarMoeda(resultados[nome])
                      : '—'}
                  </td>
                  <td>
                    {resultados
                      ? formatarMoeda(
                          resultados[nome] -
                            cenarioBase.resultados[nome],
                        )
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            A diferença corresponde ao cenário atual menos o cenário
            base. Nos custos, um valor positivo indica aumento de
            despesa. No resultado mensal, indica melhora do saldo.
          </p>
        </section>
      )}
    </main>
  )
}