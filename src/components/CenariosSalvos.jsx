import { useState } from 'react'
import {
  calcularDadosCenario,
  listarCenarios,
  salvarCenario,
} from '../services/cenarios.js'
import { formatarMoeda } from '../utils/formatar.js'
import '../CenariosSalvos.css'

const indicadores = [
  { campo: 'faturamento', titulo: 'Faturamento' },
  { campo: 'custoVariavelTotal', titulo: 'Custos variáveis' },
  { campo: 'despesasFixas', titulo: 'Despesas fixas' },
  { campo: 'resultadoMensal', titulo: 'Resultado mensal' },
]

function avaliar(dados) {
  try {
    return calcularDadosCenario(dados)
  } catch {
    return null
  }
}

function recuperarDados(cenario) {
  if (cenario.dados?.versao !== 1) {
    throw new Error('O formato deste cenário não é compatível.')
  }

  const origem = cenario.dados.negocio

  calcularDadosCenario(origem)

  return {
    nome: origem.nome,
    descricao:
      typeof origem.descricao === 'string' ? origem.descricao : '',
    despesasFixas: String(origem.despesasFixas),
    produtos: origem.produtos.map((produto) => ({
      id: crypto.randomUUID(),
      nome: produto.nome,
      precoVenda: String(produto.precoVenda),
      custoVariavel: String(produto.custoVariavel),
      quantidade: String(produto.quantidade),
    })),
  }
}

export default function CenariosSalvos({
  negocioId,
  dados,
  podeSalvar,
  onCarregar,
}) {
  const [nome, setNome] = useState('')
  const [cenarios, setCenarios] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [operacao, setOperacao] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const ocupado = operacao !== ''
  const atuais = avaliar(dados)

  const base =
    selecionado?.dados?.versao === 1
      ? avaliar(selecionado.dados.negocio)
      : null

  async function salvar(evento) {
    evento.preventDefault()

    if (ocupado || !podeSalvar || !nome.trim()) return

    setOperacao('salvar')
    setErro('')
    setAviso('')

    try {
      const cenario = await salvarCenario(negocioId, nome, dados)

      setCenarios((anteriores) => [
        cenario,
        ...anteriores.filter((item) => item.id !== cenario.id),
      ])
      setSelecionado(cenario)
      setNome('')
      setAviso(`Cenário "${cenario.nome}" salvo.`)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOperacao('')
    }
  }

  async function consultar() {
    if (ocupado) return

    if (mostrarLista) {
      setMostrarLista(false)
      return
    }

    setOperacao('listar')
    setErro('')
    setAviso('')

    try {
      setCenarios(await listarCenarios(negocioId))
      setMostrarLista(true)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOperacao('')
    }
  }

  function carregar(cenario) {
    if (ocupado) return

    setErro('')
    setAviso('')

    try {
      const dadosRecuperados = recuperarDados(cenario)
      const carregou = onCarregar(dadosRecuperados, cenario.nome)

      if (carregou) {
        setSelecionado(cenario)
        setAviso(
          `Cenário "${cenario.nome}" carregado nos campos. ` +
          'Clique em Salvar negócio se quiser guardar essas alterações.',
        )
      }
    } catch (falha) {
      setErro(falha.message)
    }
  }

  return (
    <div className="cenarios-salvos" aria-busy={ocupado}>
      <h3>Cenários salvos</h3>

      <p>
        Guarde os valores atuais com um nome para comparar depois.
        Carregar um cenário recupera seus dados nos campos.
        As alterações só vão para o negócio salvo ao clicar em
        Salvar negócio.
      </p>

      <form onSubmit={salvar} className="cenario-formulario">
        <div>
          <label htmlFor="nome-cenario">Nome do cenário</label>
          <input
            id="nome-cenario"
            type="text"
            maxLength={100}
            required
            placeholder="Ex.: Aumento de preço"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            disabled={ocupado}
          />
        </div>

        <button
          type="submit"
          disabled={ocupado || !podeSalvar || !nome.trim()}
        >
          {operacao === 'salvar' ? 'Salvando…' : 'Salvar cenário'}
        </button>

        <button
          type="button"
          onClick={consultar}
          disabled={ocupado}
        >
          {operacao === 'listar'
            ? 'Carregando…'
            : mostrarLista
              ? 'Fechar cenários'
              : 'Ver cenários'}
        </button>
      </form>

      {erro && (
        <p className="meus-negocios-erro" role="alert">
          {erro}
        </p>
      )}

      {aviso && <p role="status">{aviso}</p>}

      {mostrarLista && (
        <div className="meus-negocios-lista">
          {cenarios.length === 0 ? (
            <p>Nenhum cenário salvo para este negócio.</p>
          ) : (
            <ul>
              {cenarios.map((cenario) => (
                <li key={cenario.id}>
                  <div>
                    <strong>{cenario.nome}</strong>
                    <p>
                      {new Date(cenario.criado_em).toLocaleString(
                        'pt-BR',
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => setSelecionado(cenario)}
                    aria-label={`Comparar com ${cenario.nome}`}
                  >
                    Comparar
                  </button>

                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => carregar(cenario)}
                    aria-label={`Carregar cenário ${cenario.nome} nos campos`}
                  >
                    Carregar nos campos
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selecionado && (
        <div className="cenario-comparacao">
          <h3>Comparação com “{selecionado.nome}”</h3>

          {!base && (
            <p role="alert">
              Não foi possível interpretar os dados desse cenário.
            </p>
          )}

          {base && (
            <>
              <div className="cenario-tabela">
                <table>
                  <caption>
                    A coluna atual acompanha as alterações da tela.
                    O cenário salvo mantém os valores originais.
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Indicador</th>
                      <th scope="col">Salvo</th>
                      <th scope="col">Atual</th>
                      <th scope="col">Diferença</th>
                    </tr>
                  </thead>

                  <tbody>
                    {indicadores.map(({ campo, titulo }) => (
                      <tr key={campo}>
                        <th scope="row">{titulo}</th>
                        <td>{formatarMoeda(base[campo])}</td>
                        <td>
                          {atuais
                            ? formatarMoeda(atuais[campo])
                            : '—'}
                        </td>
                        <td>
                          {atuais
                            ? formatarMoeda(
                                atuais[campo] - base[campo],
                              )
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                Diferença = atual menos salvo. Nos custos, um valor
                positivo indica aumento de despesa. No resultado,
                indica melhora do saldo.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={() => setSelecionado(null)}
          >
            Fechar comparação
          </button>
        </div>
      )}
    </div>
  )
}