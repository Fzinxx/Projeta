export function calcularSimulacao({
  precoVenda,
  custoVariavel,
  quantidade,
  despesasFixas,
}) {
  const valores = [
    precoVenda,
    custoVariavel,
    quantidade,
    despesasFixas,
  ];

  if (valores.some((valor) => !Number.isFinite(valor) || valor < 0)) {
    throw new Error("Informe números válidos, maiores ou iguais a zero.");
  }

  if (!Number.isSafeInteger(quantidade)) {
    throw new Error("A quantidade deve ser um número inteiro válido.");
  }

  const precoCentavos = Math.round(precoVenda * 100);
  const custoCentavos = Math.round(custoVariavel * 100);
  const despesasCentavos = Math.round(despesasFixas * 100);

  const faturamentoCentavos = precoCentavos * quantidade;
  const custoTotalCentavos = custoCentavos * quantidade;
  const margemCentavos = precoCentavos - custoCentavos;

  const resultadoCentavos =
    faturamentoCentavos - custoTotalCentavos - despesasCentavos;

  const valoresCalculados = [
    precoCentavos,
    custoCentavos,
    despesasCentavos,
    faturamentoCentavos,
    custoTotalCentavos,
    margemCentavos,
    resultadoCentavos,
  ];

  if (valoresCalculados.some((valor) => !Number.isSafeInteger(valor))) {
    throw new Error("Os valores informados são grandes demais para calcular.");
  }

  let pontoEquilibrio = null;

  if (despesasCentavos === 0) {
    pontoEquilibrio = 0;
  } else if (margemCentavos > 0) {
    pontoEquilibrio = Math.ceil(despesasCentavos / margemCentavos);
  }

  return {
    faturamento: faturamentoCentavos / 100,
    custoVariavelTotal: custoTotalCentavos / 100,
    margemContribuicao: margemCentavos / 100,
    resultadoMensal: resultadoCentavos / 100,
    pontoEquilibrio,
  };
}