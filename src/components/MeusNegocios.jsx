import { useState } from 'react'
import {
  excluirNegocio,
  listarNegocios,
  salvarNegocio,
} from '../services/negocios.js'
import {
  criarNegocioVazio,
  temConteudoNegocio,
} from '../utils/camposNegocio.js'
import CenariosSalvos from './CenariosSalvos.jsx'
import '../MeusNegocios.css'

export default function MeusNegocios({ dados, podeSalvar, onAbrir }) {
  const [id, setId] = useState(() => crypto.randomUUID())
  const [versaoSalva, setVersaoSalva] = useState(null)
  const [negocios, setNegocios] = useState([])
  const [mostrarLista, setMostrarLista] = useState(false)
  const [operacao, setOperacao] = useState('')
  const [idExcluindo, setIdExcluindo] = useState(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const ocupado = operacao !== ''

  const temAlteracoes =
    versaoSalva === null
      ? temConteudoNegocio(dados)
      : JSON.stringify(dados) !== versaoSalva

  const situacao =
    versaoSalva === null
      ? 'Ainda não salvo'
      : temAlteracoes
        ? 'Alterações pendentes'
        : 'Salvo na sua conta'

  function podeTrocarNegocio() {
    if (!temAlteracoes) return true

    return window.confirm(
      'As alterações atuais ainda não foram salvas. Deseja trocar de negócio?',
    )
  }

  async function salvar() {
    if (ocupado || !podeSalvar) return

    setOperacao('salvar')
    setErro('')
    setAviso('')

    const versaoEnviada = JSON.stringify(dados)

    try {
      await salvarNegocio(id, dados)
      setVersaoSalva(versaoEnviada)
      setMostrarLista(false)
      setNegocios([])
      setAviso('Negócio salvo na sua conta.')
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
      setNegocios(await listarNegocios())
      setMostrarLista(true)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOperacao('')
    }
  }

  function abrir(negocio) {
    if (ocupado || !podeTrocarNegocio()) return

    setId(negocio.id)
    setVersaoSalva(JSON.stringify(negocio.dados))
    onAbrir(negocio.dados)
    setMostrarLista(false)
    setErro('')
    setAviso('Negócio aberto. Você pode editar e salvar novamente.')
  }

  function novo() {
    if (ocupado || !podeTrocarNegocio()) return

    setId(crypto.randomUUID())
    setVersaoSalva(null)
    onAbrir(criarNegocioVazio())
    setMostrarLista(false)
    setErro('')
    setAviso('Preencha os dados do novo negócio.')
  }

  function carregarCenario(novosDados, nomeCenario) {
    if (ocupado) return false

    if (
      temAlteracoes &&
      !window.confirm(
        'Existem alterações não salvas. Carregar este cenário ' +
        'substituirá os campos atuais. Deseja continuar?',
      )
    ) {
      return false
    }

    onAbrir(novosDados)
    setMostrarLista(false)
    setErro('')
    setAviso(
      `Cenário "${nomeCenario}" carregado. ` +
      'As alterações ainda não foram salvas no negócio.',
    )

    return true
  }

  async function remover(negocio) {
    if (ocupado) return

    const negocioAberto = negocio.id === id

    const avisoCampos = negocioAberto
      ? ' O negócio está aberto na tela. Os campos serão limpos' +
        ' e eventuais alterações não salvas serão descartadas.'
      : ''

    const confirmou = window.confirm(
      `Excluir o negócio "${negocio.dados.nome}"? ` +
      'Todos os produtos e cenários vinculados também serão excluídos. ' +
      'Essa ação não pode ser desfeita.' +
      avisoCampos,
    )

    if (!confirmou) return

    setOperacao('excluir')
    setIdExcluindo(negocio.id)
    setErro('')
    setAviso('')

    try {
      await excluirNegocio(negocio.id)

      setNegocios((anteriores) =>
        anteriores.filter((item) => item.id !== negocio.id),
      )

      if (negocioAberto) {
        setId(crypto.randomUUID())
        setVersaoSalva(null)
        onAbrir(criarNegocioVazio())
      }

      setAviso(`Negócio "${negocio.dados.nome}" excluído.`)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOperacao('')
      setIdExcluindo(null)
    }
  }

  return (
    <section
      className="meus-negocios"
      aria-labelledby="titulo-meus-negocios"
      aria-busy={ocupado}
    >
      <div className="meus-negocios-cabecalho">
        <div className="negocio-identificacao">
          <p className="negocio-etiqueta">Área de trabalho</p>

          <h2 id="titulo-meus-negocios">
            {dados.nome.trim() || 'Novo negócio'}
          </h2>

          <span
            className="negocio-situacao"
            data-salvo={versaoSalva !== null && !temAlteracoes}
          >
            {situacao}
          </span>
        </div>

        <div className="meus-negocios-acoes">
          <button
            className="botao-salvar-negocio"
            type="button"
            onClick={salvar}
            disabled={ocupado || !podeSalvar || !temAlteracoes}
          >
            {operacao === 'salvar' ? 'Salvando…' : 'Salvar negócio'}
          </button>

          <button
            type="button"
            onClick={consultar}
            disabled={ocupado}
            aria-expanded={mostrarLista}
            aria-controls="lista-meus-negocios"
          >
            {operacao === 'listar'
              ? 'Carregando…'
              : mostrarLista
                ? 'Fechar lista'
                : 'Meus negócios'}
          </button>

          <button type="button" onClick={novo} disabled={ocupado}>
            Novo negócio
          </button>
        </div>
      </div>

      {erro && (
        <p className="meus-negocios-erro" role="alert">
          {erro}
        </p>
      )}

      {aviso && (
        <p className="negocio-aviso" role="status">
          {aviso}
        </p>
      )}

      <div id="lista-meus-negocios" hidden={!mostrarLista}>
        {mostrarLista && (
          <div className="meus-negocios-lista">
            <h3>Escolha um negócio</h3>

            {negocios.length === 0 ? (
              <p>Você ainda não tem negócios salvos.</p>
            ) : (
              <ul>
                {negocios.map((negocio) => (
                  <li key={negocio.id}>
                    <div>
                      <strong>{negocio.dados.nome}</strong>
                      <p>
                        {negocio.dados.produtos.length}{' '}
                        {negocio.dados.produtos.length === 1
                          ? 'produto cadastrado'
                          : 'produtos cadastrados'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrir(negocio)}
                      disabled={ocupado}
                      aria-label={`Abrir ${negocio.dados.nome}`}
                    >
                      Abrir
                    </button>

                    <button
                      className="remover-produto"
                      type="button"
                      onClick={() => remover(negocio)}
                      disabled={ocupado}
                      aria-label={`Excluir negócio ${negocio.dados.nome}`}
                    >
                      {idExcluindo === negocio.id
                        ? 'Excluindo…'
                        : 'Excluir'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {versaoSalva !== null ? (
        <div inert={ocupado}>
          <details key={id} className="painel-cenarios">
            <summary>
              <span>Cenários e comparações</span>
              <span className="painel-cenarios-descricao">
                Salvar simulações e comparar resultados
              </span>
            </summary>

            <CenariosSalvos
              key={id}
              negocioId={id}
              dados={dados}
              podeSalvar={podeSalvar}
              onCarregar={carregarCenario}
            />
          </details>
        </div>
      ) : (
        <p className="negocio-orientacao">
          Preencha um novo negócio ou abra um que você já salvou.
        </p>
      )}
    </section>
  )
}