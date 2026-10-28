import {
  interpretarColagemMoeda,
  normalizarCentavos,
} from '../utils/camposNegocio.js'

const formato = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function CampoMoeda({
  value,
  onValueChange,
  ...propriedades
}) {
  const exibicao =
    value === '' ? '' : formato.format(Number(value))

  function alterar(evento) {
    const texto = evento.target.value

    if (/[-−]/.test(texto)) return

    const digitos = texto.replace(/\D/g, '')
    const valor = normalizarCentavos(digitos)

    if (valor !== null) {
      onValueChange(valor)
    }
  }

  function colar(evento) {
    evento.preventDefault()

    const valor = interpretarColagemMoeda(
      evento.clipboardData.getData('text'),
    )

    if (valor !== null) {
      onValueChange(valor)
    }
  }

  return (
    <input
      {...propriedades}
      type="text"
      inputMode="numeric"
      placeholder="0,00"
      autoComplete="off"
      spellCheck={false}
      value={exibicao}
      onChange={alterar}
      onPaste={colar}
      onFocus={(evento) => evento.target.select()}
    />
  )
}