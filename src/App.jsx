import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Autenticacao from './components/Autenticacao.jsx'
import SimuladorNegocio from './SimuladorNegocio.jsx'
import './Autenticacao.css'

export default function App() {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    let ativo = true
    let recebeuEvento = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, novaSessao) => {
        if (!ativo) return

        recebeuEvento = true
        setSessao(novaSessao)
        setErro('')
        setCarregando(false)
      },
    )

    async function recuperarSessao() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!ativo || recebeuEvento) return
        if (error) throw error

        setSessao(data.session)
        setCarregando(false)
      } catch {
        if (!ativo || recebeuEvento) return

        setErro('Não foi possível verificar seu acesso. Tente novamente.')
        setCarregando(false)
      }
    }

    recuperarSessao()

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  async function sair() {
    if (saindo) return

    setSaindo(true)
    setErro('')

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) throw error

      setSessao(null)
    } catch {
      setErro('Não foi possível sair. Confira sua conexão e tente novamente.')
    } finally {
      setSaindo(false)
    }
  }

  if (carregando) {
    return (
      <main className="estado-acesso" role="status">
        <p>Verificando seu acesso…</p>
      </main>
    )
  }

  if (erro && !sessao) {
    return (
      <main className="estado-acesso">
        <p role="alert">{erro}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </main>
    )
  }

  if (!sessao) {
    return <Autenticacao />
  }

  return (
    <>
      <header className="barra-conta">
        <span>
          Conectado como <strong>{sessao.user.email}</strong>
        </span>
        <button type="button" onClick={sair} disabled={saindo}>
          {saindo ? 'Saindo…' : 'Sair'}
        </button>
        {erro && <p className="erro-acesso" role="alert">{erro}</p>}
      </header>

      <SimuladorNegocio key={sessao.user.id} />
    </>
  )
}