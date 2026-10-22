import { useState } from 'react'
import { calcularSimulacao } from './utils/calcularSimulacao.js'
import ComparacaoCenarios from './components/ComparacaoCenarios.jsx'
import './App.css'

const exemplo = {
  nomeProduto: 'Lanche',
  precoVenda: '20',
  custoVariavel: '8',
  quantidade: '100',
  despesasFixas: '500',
}

const camposNumericos = [
  { nome: 'precoVenda', titulo: 'Preço de venda por unidade (R$)', passo: '0.01' },
  { nome: 'custoVariavel', titulo: 'Custo variável por unidade (R$)', passo: '0.01' },
  { nome: 'quantidade', titulo: 'Unidades vendidas no mês', passo: '1' },
  { nome: 'despesasFixas', titulo: 'Despesas fixas mensais (R$)', passo: '0.01' },
]

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function avaliarSimulacao(dados) {
  const temCampoVazio = camposNumericos.some(
    ({ nome }) => dados[nome].trim() === '',
  )

  if (temCampoVazio) {
    return {
      resultados: null,
      erro: 'Preencha todos os campos numéricos para calcular.',
    }
  }

  try {
    const resultados = calcularSimulacao({
      precoVenda: Number(dados.precoVenda),
      custoVariavel: Number(dados.custoVariavel),
      quantidade: Number(dados.quantidade),
      despesasFixas: Number(dados.despesasFixas),
    })

    return { resultados, erro: '' }
  } catch (erro) {
    return { resultados: null, erro: erro.message }
  }
}

function App() {
  const [dados, setDados] = useState({ ...exemplo })
  const [cenarioBase, setCenarioBase] = useState(null)
  const { resultados, erro } = avaliarSimulacao(dados)

  function alterarCampo(evento) {
    const { name, value } = evento.target

    setDados((anteriores) => ({
      ...anteriores,
      [name]: value,
    }))
  }

  function guardarCenarioBase() {
    if (!resultados) {
      return
    }

    setCenarioBase({
      dados: { ...dados },
      resultados: { ...resultados },
    })
  }

  return (
    <main className="simulador">
      <header>
        <h1>Projeta — Simulador de Negócios</h1>
        <p>
          Simule como preço, custos e quantidade vendida afetam
          o resultado mensal de um produto.
        </p>
      </header>

      <section aria-labelledby="titulo-dados">
        <h2 id="titulo-dados">Dados da simulação</h2>

        <div>
          <label htmlFor="nomeProduto">Nome do produto</label>
          <input
            id="nomeProduto"
            name="nomeProduto"
            type="text"
            maxLength={100}
            value={dados.nomeProduto}
            onChange={alterarCampo}
          />
        </div>

        {camposNumericos.map(({ nome, titulo, passo }) => (
          <div key={nome}>
            <label htmlFor={nome}>{titulo}</label>
            <input
              id={nome}
              name={nome}
              type="number"
              min="0"
              step={passo}
              required
              value={dados[nome]}
              onChange={alterarCampo}
              aria-describedby={erro ? 'erro-simulacao' : undefined}
            />
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={() => setDados({ ...exemplo })}
          >
            Restaurar exemplo
          </button>

          <button
            type="button"
            onClick={guardarCenarioBase}
            disabled={!resultados}
          >
            {cenarioBase ? 'Substituir cenário base' : 'Guardar cenário base'}
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
          Guardar o cenário base permite compará-lo com novas alterações.
          Restaurar o exemplo altera apenas os campos atuais.
        </p>
      </section>

      <section aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">
          Resultados — {dados.nomeProduto.trim() || 'Produto sem nome'}
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
              <dd>{moeda.format(resultados.faturamento)}</dd>

              <dt>Custo variável total</dt>
              <dd>{moeda.format(resultados.custoVariavelTotal)}</dd>

              <dt>Margem de contribuição por unidade</dt>
              <dd>{moeda.format(resultados.margemContribuicao)}</dd>

              <dt>Resultado mensal estimado</dt>
              <dd>{moeda.format(resultados.resultadoMensal)}</dd>

              <dt>Ponto de equilíbrio em unidades</dt>
              <dd>
                {resultados.pontoEquilibrio === null
                  ? 'Indisponível: a margem não cobre as despesas fixas.'
                  : `${resultados.pontoEquilibrio} unidades`}
              </dd>
            </dl>

            {resultados.margemContribuicao <= 0 && (
              <p>
                A margem por unidade é zero ou negativa. Aumentar as
                vendas não melhora o resultado com esses valores.
              </p>
            )}

            {resultados.pontoEquilibrio === 0 && (
              <p>
                Sem despesas fixas, zero vendas já resulta em zero.
                Confira a margem por unidade para avaliar o efeito das vendas.
              </p>
            )}
          </>
        )}

        <p>
          As estimativas consideram somente os custos informados.
          O resultado mensal não representa lucro líquido contábil.
        </p>
      </section>

      <ComparacaoCenarios
        cenarioBase={cenarioBase}
        resultadosAtuais={resultados}
      />
    </main>
  )
}

export default App