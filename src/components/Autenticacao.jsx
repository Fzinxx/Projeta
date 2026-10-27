import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

function mensagemErro(erro) {
  switch (erro.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos.'
    case 'email_not_confirmed':
      return 'Confirme seu e-mail antes de entrar.'
    case 'user_already_exists':
      return 'Já existe uma conta com esse e-mail. Tente entrar.'
    case 'weak_password':
      return 'Escolha uma senha mais forte.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    case 'signup_disabled':
      return 'O cadastro de novas contas está desativado.'
    default:
      return 'Não foi possível concluir. Confira sua conexão e tente novamente.'
  }
}

export default function Autenticacao() {
  const [cadastro, setCadastro] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  function trocarModo() {
    setCadastro((anterior) => !anterior)
    setSenha('')
    setConfirmacao('')
    setErro('')
    setAviso('')
  }

  async function enviar(evento) {
    evento.preventDefault()

    if (enviando) return

    setErro('')
    setAviso('')

    if (cadastro && senha !== confirmacao) {
      setErro('As senhas precisam ser iguais.')
      return
    }

    setEnviando(true)

    try {
      if (cadastro) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) throw error

        if (!data.session) {
          setAviso(
            'Confira sua caixa de entrada e o spam. Se o cadastro puder ser concluído, você receberá um link para confirmar o e-mail.',
          )
          setSenha('')
          setConfirmacao('')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        })

        if (error) throw error
      }
    } catch (falha) {
      setErro(mensagemErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="pagina-acesso">
      <header>
        <img src="/favicon.svg" width="56" height="56" alt="" />
        <h1>Projeta</h1>
        <p>Transforme ideias em cenários para o seu negócio.</p>
      </header>

      <section className="cartao-acesso" aria-labelledby="titulo-acesso">
        <h2 id="titulo-acesso">
          {cadastro ? 'Crie sua conta' : 'Entre na sua conta'}
        </h2>

        <p>
          {cadastro
            ? 'Cadastre seu e-mail e escolha uma senha.'
            : 'Acesse o simulador e planeje seus próximos passos.'}
        </p>

        <form onSubmit={enviar}>
          <fieldset disabled={enviando}>
            <div>
              <label htmlFor="email-acesso">E-mail</label>
              <input
                id="email-acesso"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>

            <div>
              <label htmlFor="senha-acesso">Senha</label>
              <input
                id="senha-acesso"
                type="password"
                autoComplete={cadastro ? 'new-password' : 'current-password'}
                minLength={cadastro ? 8 : undefined}
                required
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
              />
              {cadastro && (
                <p className="ajuda-acesso">Use pelo menos 8 caracteres.</p>
              )}
            </div>

            {cadastro && (
              <div>
                <label htmlFor="confirmacao-acesso">Confirme a senha</label>
                <input
                  id="confirmacao-acesso"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmacao}
                  onChange={(evento) => setConfirmacao(evento.target.value)}
                />
              </div>
            )}

            {erro && <p className="erro-acesso" role="alert">{erro}</p>}
            {aviso && <p className="aviso-acesso" role="status">{aviso}</p>}

            <button className="botao-entrar" type="submit">
              {enviando ? 'Aguarde…' : cadastro ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              className="botao-alternar"
              type="button"
              onClick={trocarModo}
            >
              {cadastro
                ? 'Já tenho conta'
                : 'Ainda não tenho conta'}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  )
}