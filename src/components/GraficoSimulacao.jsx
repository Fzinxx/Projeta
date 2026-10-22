import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numeroCompacto = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function GraficoSimulacao({ resultados, despesasFixas }) {
  if (!resultados) {
    return null
  }

  const dadosGrafico = [
    {
      nome: 'Faturamento',
      valor: resultados.faturamento,
    },
    {
      nome: 'Custo variável',
      valor: resultados.custoVariavelTotal,
    },
    {
      nome: 'Despesas fixas',
      valor: Math.round(despesasFixas * 100) / 100,
    },
    {
      nome: 'Resultado',
      valor: resultados.resultadoMensal,
    },
  ]

  return (
    <section aria-labelledby="titulo-grafico">
      <h2 id="titulo-grafico">Visão mensal do cenário atual</h2>

      <p>
        Valores em reais. Toque nas barras ou passe o mouse sobre
        elas para consultar os valores completos.
      </p>

      <div style={{ width: '100%', minWidth: 0, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosGrafico}
            layout="vertical"
            margin={{ top: 16, right: 24, bottom: 16, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />

            <XAxis
              type="number"
              tickCount={3}
              minTickGap={24}
              tick={{ fontSize: 12 }}
              tickFormatter={(valor) => numeroCompacto.format(valor)}
            />

            <YAxis
              type="category"
              dataKey="nome"
              width={110}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(valor) => [
                moeda.format(Number(valor)),
                'Valor',
              ]}
            />

            <ReferenceLine x={0} stroke="#475569" />

            <Bar
              dataKey="valor"
              fill="#2563eb"
              maxBarSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p>
        O resultado corresponde ao faturamento menos o custo variável
        total e as despesas fixas. Valores negativos aparecem à
        esquerda do zero.
      </p>
    </section>
  )
}

export default GraficoSimulacao