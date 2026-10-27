# Projeta — Simulador de Negócios

Simulador interativo para explorar como preço, custos e quantidade vendida afetam o resultado mensal de um produto.

Projeto pessoal desenvolvido por Fernando Cardoso dos Santos para praticar React, JavaScript, cálculos verificáveis e construção de interfaces responsivas.

## Como funciona

A pessoa informa:

- Nome do produto.
- Preço de venda por unidade.
- Custo variável por unidade.
- Quantidade estimada de unidades vendidas no mês.
- Despesas fixas mensais.

Os resultados são atualizados imediatamente, acompanhados de um gráfico de barras.

Também é possível guardar um cenário base, alterar os valores e comparar os resultados em uma tabela.

## Funcionalidades implementadas

- Cálculo de faturamento e custo variável total.
- Margem de contribuição por unidade.
- Resultado mensal estimado.
- Ponto de equilíbrio em unidades, quando possível.
- Gráfico com suporte a resultados negativos.
- Comparação temporária de cenários.
- Substituição e limpeza do cenário base.
- Restauração dos valores de exemplo.
- Tratamento de campos numéricos vazios e entradas inválidas.
- Interface adaptada para computador e celular.
- Tema claro ou escuro conforme a preferência do sistema.
- Carregamento separado do código do gráfico.

## Fórmulas

| Indicador | Cálculo |
| --- | --- |
| Faturamento | Preço de venda × quantidade |
| Custo variável total | Custo variável por unidade × quantidade |
| Margem por unidade | Preço de venda − custo variável por unidade |
| Resultado mensal | Faturamento − custo variável total − despesas fixas |
| Ponto de equilíbrio | Despesas fixas ÷ margem por unidade, arredondando para cima |

Com despesas fixas positivas e margem menor ou igual a zero, o ponto de equilíbrio é apresentado como indisponível.

Sem despesas fixas, zero vendas já resulta em zero. Se a margem for negativa, realizar vendas piora o resultado.

Os valores monetários são arredondados para centavos antes dos cálculos. A quantidade precisa ser um número inteiro não negativo. Valores fora do limite seguro de cálculo são rejeitados.

## Exemplo

Para um produto com:

- Preço de venda: R$ 20,00.
- Custo variável por unidade: R$ 8,00.
- Quantidade mensal: 100 unidades.
- Despesas fixas: R$ 500,00.

O simulador apresenta:

| Indicador | Resultado |
| --- | --- |
| Faturamento | R$ 2.000,00 |
| Custo variável total | R$ 800,00 |
| Margem por unidade | R$ 12,00 |
| Resultado mensal estimado | R$ 700,00 |
| Ponto de equilíbrio | 42 unidades |

## Limites da primeira versão

- Uma simulação considera um produto e um período mensal.
- Preço e custo por unidade permanecem constantes na simulação.
- São considerados somente os custos informados.
- O resultado não representa lucro líquido contábil.
- Não há login, backend, banco de dados ou integrações externas.
- Os campos e o cenário base ficam apenas na memória da página.
- Recarregar ou fechar a página apaga as alterações e o cenário guardado.

## Tecnologias

- React com JavaScript.
- Vite.
- CSS.
- Recharts.
- Oxlint.
- Testes nativos do Node.js com `node:test` e `node:assert/strict`.
- Git e GitHub.

## Executar localmente

É necessário ter Git, Node.js e npm instalados.

O requisito de Node.js registrado para o Vite é:
`^20.19.0 || >=22.12.0`.

### Obter a versão atual de desenvolvimento

Enquanto as alterações não forem integradas à main, utilize a branch
`feature/grafico-simulacao`:

```bash
git clone --branch feature/grafico-simulacao https://github.com/Fzinxx/Projeta.git
cd Projeta
npm ci
npm run dev
```

Abra no navegador o endereço Local informado pelo terminal.

### Executar os testes automatizados

```bash
npm test
```

Os testes verificam a função de cálculo e suas validações numéricas. Não é necessário instalar uma biblioteca adicional de testes.

### Verificar o código

```bash
npm run lint
```

### Gerar a versão de produção

```bash
npm run build
```

### Visualizar a versão gerada

Depois do build:

```bash
npm run preview
```

O preview é local e não publica a aplicação na internet.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.jsx` | Campos, estado da simulação e conexão entre os componentes |
| `src/utils/calcularSimulacao.js` | Validação numérica e cálculos |
| `src/utils/calcularSimulacao.test.js` | Testes automatizados dos cálculos e das validações |
| `src/components/ComparacaoCenarios.jsx` | Tabela de comparação |
| `src/components/GraficoSimulacao.jsx` | Carregamento do gráfico com lazy e Suspense |
| `src/components/GraficoConteudo.jsx` | Construção do gráfico com Recharts |
| `src/App.css` | Layout e estilos dos componentes |
| `src/index.css` | Estilos globais e variáveis de tema |

## Verificações realizadas

### Testes automatizados

A suíte contém 10 testes:

- Cenário de exemplo com resultado positivo.
- Valores monetários com duas casas decimais.
- Margem zero com despesas fixas positivas.
- Prejuízo com margem negativa.
- Despesas fixas mantidas quando não há vendas.
- Todos os valores iguais a zero.
- Ponto de equilíbrio na primeira quantidade inteira que cobre as despesas.
- Rejeição de valores negativos, não numéricos e não finitos em cada campo.
- Rejeição de quantidade fracionada ou acima do limite seguro.
- Rejeição de cálculos que ultrapassam o limite seguro em centavos.

Na última execução, os 10 testes passaram.

### Verificações manuais da interface

Foram conferidos os seguintes comportamentos:

- Atualização dos resultados ao alterar os campos.
- Ocultação dos resultados e do gráfico com campo numérico vazio.
- Restauração do exemplo.
- Armazenamento, substituição e limpeza do cenário base.
- Preservação do cenário base ao alterar os campos atuais.
- Gráfico com resultados positivos e negativos.
- Exibição do gráfico após o carregamento separado.
- Layout em computador e simulação de celular com largura de 390 px.

As verificações da interface permanecem manuais. Os testes automatizados atuais cobrem a função de cálculo.

Os comandos de testes, lint e build foram executados com sucesso.

## Próximos passos

- Definir a paleta e o ícone próprios do Projeta.
- Revisar a apresentação final e a documentação.
- Integrar a versão validada à main.
- Publicar e conferir a aplicação no endereço público.

## Autor

Fernando Cardoso dos Santos

GitHub: https://github.com/Fzinxx