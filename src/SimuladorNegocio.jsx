import { useState } from 'react'
import { calcularNegocio } from './utils/calcularNegocio.js'
import { formatarMoeda, formatarNumero } from './utils/formatar.js'
import {
  criarNegocioVazio,
  criarProdutoVazio,
  temConteudoNegocio,
} from './utils/camposNegocio.js'
import CampoMoeda from './components/CampoMoeda.jsx'
import GraficoSimulacao from './components/GraficoSimulacao.jsx'
import MeusNegocios from './components/MeusNegocios.jsx'
import './App.css'
import './Negocio.css'

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

function avaliarNegocio(dados) {
  const incompleto =
    dados.despesasFixas.trim() === '' ||
    dados.produtos.length === 0 ||
    dados.produtos.some(
      (produto) =>
        !produto.nome.trim() ||
        ['precoVenda', 'custoVariavel', 'quantidade'].some(
          (campo) => String(produto[campo]).trim() === '',
        ),
    )

  if (incompleto) {
    return { resultados: null, erro: '' }
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
  const [dados, setDados] = useState(criarNegocioVazio)
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
    const produto = criarProdutoVazio()

    setDados((anteriores) => ({
      ...anteriores,
      produtos: [...anteriores.produtos, produto],
    }))
  }

  function removerProduto(id) {
    setDados((anteriores) => {
      if (anteriores.produtos.length <= 1) return anteriores

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

  function limparCampos() {
    if (
      temConteudoNegocio(dados) &&
      !window.confirm(
        'Limpar os campos atuais? Para recuperar alterações depois, ' +
        'salve o negócio ou um cenário antes de continuar.',
      )
    ) {
      return
    }

    setDados(criarNegocioVazio())
    setCenarioBase(null)
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
            placeholder="Digite o nome do seu negócio"
            value={dados.nome}
            onChange={alterarNegocio}
          />
        </div>

        <div>
          <label htmlFor="descricao-negocio">
            Descrição (opcional)
          </label>
          <textarea
            id="descricao-negocio"
            name="descricao"
            maxLength={500}
            rows={3}
            placeholder="Descreva seu negócio"
            value={dados.descricao}
            onChange={alterarNegocio}
          />
        </div>

        <div>
          <label htmlFor="despesasFixas">
            Despesas fixas mensais (R$)
          </label>

          <CampoMoeda
            id="despesasFixas"
            name="despesasFixas"
            required
            value={dados.despesasFixas}
            onValueChange={(valor) =>
              setDados((anteriores) => ({
                ...anteriores,
                despesasFixas: valor,
              }))
            }
            aria-describedby="ajuda-despesas ajuda-moeda"
          />

          <p id="ajuda-despesas" className="ajuda-campo">
            Aluguel, internet e outras despesas mensais.
            Digite 0 se não houver despesas fixas.
          </p>

          <p id="ajuda-moeda" className="ajuda-campo">
            Nos valores em reais, a vírgula é automática.
            Para R$ 20,00, digite 2000.
          </p>
        </div>

        <div className="acoes-negocio">
          <button
            type="button"
            onClick={limparCampos}
            disabled={!temConteudoNegocio(dados)}
          >
            Limpar campos
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
          Guardar o cenário base permite comparar os resultados
          durante esta sessão. Para acessar depois, use os cenários
          salvos na sua conta.
        </p>
      </section>

      <section aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">
          {dados.nome.trim()
            ? `Resumo — ${dados.nome.trim()}`
            : 'Resumo do negócio'}
        </h2>

        {!resultados && !erro && (
          <div className="leitura-resultado">
            <h3>Preencha os dados para começar</h3>
            <p>
              Informe as despesas fixas e, em cada produto, o nome,
              o preço, o custo e a quantidade mensal.
              Os resultados aparecerão automaticamente.
            </p>
          </div>
        )}

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
                  {formatarMoeda(equilibrio)}. É uma estimativa:
                  as quantidades reais precisam ser inteiras.
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
                  Com despesas fixas, é necessário ter faturamento
                  e contribuição total positiva para estimar
                  o faturamento de equilíbrio.
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

            <p>
              Estimativa mensal baseada somente nos custos informados.
              O resultado não representa lucro líquido contábil.
            </p>
          </>
        )}
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
                    placeholder="Digite o nome do produto"
                    value={produto.nome}
                    onChange={(evento) =>
                      alterarProduto(
                        produto.id,
                        'nome',
                        evento.target.value,
                      )
                    }
                  />
                </div>

                <div>
                  <label htmlFor={`precoVenda-${produto.id}`}>
                    Preço por unidade (R$)
                  </label>
                  <CampoMoeda
                    id={`precoVenda-${produto.id}`}
                    required
                    value={produto.precoVenda}
                    onValueChange={(valor) =>
                      alterarProduto(produto.id, 'precoVenda', valor)
                    }
                    aria-describedby="ajuda-moeda"
                  />
                </div>

                <div>
                  <label htmlFor={`custoVariavel-${produto.id}`}>
                    Custo por unidade (R$)
                  </label>
                  <CampoMoeda
                    id={`custoVariavel-${produto.id}`}
                    required
                    value={produto.custoVariavel}
                    onValueChange={(valor) =>
                      alterarProduto(
                        produto.id,
                        'custoVariavel',
                        valor,
                      )
                    }
                    aria-describedby="ajuda-moeda"
                  />
                </div>

                <div>
                  <label htmlFor={`quantidade-${produto.id}`}>
                    Vendas no mês (unidades)
                  </label>
                  <input
                    id={`quantidade-${produto.id}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    required
                    placeholder="Quantidade"
                    value={produto.quantidade}
                    onChange={(evento) =>
                      alterarProduto(
                        produto.id,
                        'quantidade',
                        evento.target.value,
                      )
                    }
                    aria-describedby={
                      erro ? 'erro-simulacao' : undefined
                    }
                  />
                </div>
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
          <h2 id="titulo-contribuicao">Participação dos produtos</h2>

          <table>
            <caption>
              A contribuição é o faturamento do produto menos seus
              custos variáveis. As despesas fixas são descontadas
              no resumo do negócio.
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