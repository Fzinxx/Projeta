const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const indicadores = [
  { chave: 'faturamento', titulo: 'Faturamento estimado' },
  { chave: 'custoVariavelTotal', titulo: 'Custo variável total' },
  { chave: 'margemContribuicao', titulo: 'Margem por unidade' },
  { chave: 'resultadoMensal', titulo: 'Resultado mensal estimado' },
  { chave: 'pontoEquilibrio', titulo: 'Ponto de equilíbrio' },
]

function formatarIndicador(chave, valor) {
  if (chave === 'pontoEquilibrio') {
    return valor === null ? 'Indisponível' : `${valor} unidades`
  }

  return moeda.format(valor)
}

function ComparacaoCenarios({ cenarioBase, resultadosAtuais }) {
  if (!cenarioBase) {
    return null
  }

  return (
    <section aria-labelledby="titulo-comparacao">
      <h2 id="titulo-comparacao">Comparação de cenários</h2>

      <p>
        Cenário base guardado para: {cenarioBase.dados.nomeProduto.trim()
          || 'Produto sem nome'}.
      </p>

      {!resultadosAtuais && (
        <p>
          Preencha os campos com valores válidos para comparar.
          O cenário base continua guardado.
        </p>
      )}

      <table>
        <caption>Resultados mensais considerando os custos informados</caption>
        <thead>
          <tr>
            <th scope="col">Indicador</th>
            <th scope="col">Cenário base</th>
            <th scope="col">Cenário atual</th>
          </tr>
        </thead>

        <tbody>
          {indicadores.map(({ chave, titulo }) => (
            <tr key={chave}>
              <th scope="row">{titulo}</th>
              <td>
                {formatarIndicador(chave, cenarioBase.resultados[chave])}
              </td>
              <td>
                {resultadosAtuais
                  ? formatarIndicador(chave, resultadosAtuais[chave])
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>O cenário base será perdido ao recarregar a página.</p>
    </section>
  )
}

export default ComparacaoCenarios