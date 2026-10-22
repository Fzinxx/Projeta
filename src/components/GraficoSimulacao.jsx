import { lazy, Suspense } from 'react'

const GraficoConteudo = lazy(() => import('./GraficoConteudo.jsx'))

function GraficoSimulacao({ resultados, despesasFixas }) {
  if (!resultados) {
    return null
  }

  return (
    <Suspense
      fallback={
        <section
          aria-labelledby="titulo-grafico"
          aria-busy="true"
        >
          <h2 id="titulo-grafico">Visão mensal do cenário atual</h2>

          <div style={{ minHeight: 320 }} role="status">
            <p>Carregando gráfico…</p>
          </div>
        </section>
      }
    >
      <GraficoConteudo
        resultados={resultados}
        despesasFixas={despesasFixas}
      />
    </Suspense>
  )
}

export default GraficoSimulacao