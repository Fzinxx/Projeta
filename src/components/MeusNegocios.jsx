import { useState } from 'react'
import { listarNegocios, salvarNegocio } from '../services/negocios.js'
import '../MeusNegocios.css'

function criarNegocioVazio() {
  return {
    nome: '',
    descricao: '',
    despesasFixas: '0',
    produtos: [
      {
        id: crypto.randomUUID(),
        nome: 'Produto 1',
        precoVenda: '0',
        custoVariavel: '0',
        quantidade: '0',
      },
    ],
  }
}

export default function MeusNegocios({ dados, podeSalvar, onAbrir }) {
  const [id, setId] = useState(() => crypto.randomUUID())
  const [versaoSalva, setVersaoSalva] = useState(null)
  const [negocios, setNegocios] = useState([])
  const [mostrarLista, setMostrarLista] = useState(false)
  const [operacao, setOperacao] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const ocupado = operacao !== ''
  const versaoAtual = JSON.stringify(dados)
  const temAlteracoes = versaoAtual !== versaoSalva

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
      const lista = await listarNegocios()
      setNegocios(lista)
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

  return (
    <section
      className="meus-negocios"
      aria-labelledby="titulo-meus-negocios"
      aria-busy={ocupado}
    >
      <div className="meus-negocios-cabecalho">
        <div>
          <h2 id="titulo-meus-negocios">Seus negócios</h2>
          <p>
            {versaoSalva === null
              ? 'Este negócio ainda não foi salvo.'
              : temAlteracoes
                ? 'Você tem alterações que ainda não foram salvas.'
                : 'As alterações atuais estão salvas.'}
          </p>
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

          <button type="button" onClick={consultar} disabled={ocupado}>
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

      {aviso && <p role="status">{aviso}</p>}

      {mostrarLista && (
        <div className="meus-negocios-lista">
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}