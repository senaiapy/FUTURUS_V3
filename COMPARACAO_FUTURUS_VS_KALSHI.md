# Futurus vs Kalshi: Comparativo de Mercados de Previsao

## 1. Visao Geral

| Aspecto | Futurus | Kalshi |
|---------|---------|--------|
| **Tipo** | Mercado de previsao baseado em pool | Bolsa de opcoes binarias (livro de ordens) |
| **Modelo** | Parimutuel (baseado em pool) | Leilao Duplo Continuo (livro de ordens) |
| **Regulamentacao** | Nao especificada | Regulado pela CFTC (legal nos EUA) |
| **Contraparte** | Todos os participantes compartilham um pool | Peer-to-peer (trader vs trader) |

---

## 2. Mecanica do Mercado

### Futurus - Modelo Parimutuel (Pool)
- Os usuarios compram participacao no **Pool Sim** ou **Pool Nao**.
- Os precos (probabilidades) sao determinados pela proporcao de dinheiro em cada pool.
- Todas as apostas sao agregadas; nao ha correspondencia individual de contraparte.
- O mercado e resolvido ao final, e o **pool perdedor inteiro** e redistribuido aos vencedores (menos a comissao).

### Kalshi - Modelo de Bolsa com Livro de Ordens
- Os usuarios compram **contratos de eventos** com preco entre $0,01 e $0,99.
- Os precos sao definidos por oferta e demanda em um **livro de ordens limitadas** (como uma bolsa de valores).
- Cada negociacao tem uma contraparte especifica (maker/taker).
- Os contratos liquidam a **$1,00** (evento acontece) ou **$0,00** (evento nao acontece).

---

## 3. Precificacao e Probabilidade

| Aspecto | Futurus | Kalshi |
|---------|---------|--------|
| **Descoberta de Preco** | Proporcao do pool: `Sim% = PoolSim / PoolTotal` | Livro de ordens orientado pelo mercado |
| **Sinal de Probabilidade** | Percentual do pool em cada lado | Preco do contrato (ex: $0,65 = 65%) |
| **Dinamica de Preco** | Muda a cada nova aposta adicionada ao pool | Muda a cada negociacao no livro de ordens |
| **Granularidade** | Continua (qualquer valor em dolares) | Discreta (incrementos de $0,01) |

---

## 4. Estrutura de Pagamento

### Futurus
```
Pagamento = (PoolTotal - Comissao) x (ApostaUsuario / PoolVencedor)
```
- **Retorno variavel**: Depende do tamanho dos pools no fechamento.
- **Exemplo**: Aposta de $100 no pool Sim ($1.000 total), Pool Nao = $2.000, comissao de 5%.
  - Pool liquido = $2.850. Pagamento = $2.850 x (100/1.000) = **$285** (retorno de 2,85x).
- Os vencedores dividem o pool inteiro proporcionalmente.
- Os perdedores perdem toda a aposta.

### Kalshi
```
Lucro Maximo  = ($1,00 - Preco de Compra) x Numero de Contratos
Perda Maxima  = Preco de Compra x Numero de Contratos
```
- **Retorno fixo**: Cada contrato paga exatamente $1,00 se correto, $0,00 se errado.
- **Exemplo**: Compra de 100 contratos "Sim" a $0,40. Se correto: lucro = ($1,00 - $0,40) x 100 = **$60**. Se errado: perda = $0,40 x 100 = **$40**.
- O retorno e conhecido no momento da compra.

---

## 5. Estrutura de Taxas

| Aspecto | Futurus | Kalshi |
|---------|---------|--------|
| **Modelo de Taxa** | Comissao sobre o pool total (ex: 5%) | Taxa por contrato baseada no preco |
| **Formula da Taxa** | `Comissao = PoolTotal x Taxa` | `Taxa = ceil(0,07 x Contratos x Preco x (1-Preco))` |
| **Impacto da Taxa** | Deduzida dos ganhos na resolucao | Paga no momento da negociacao |
| **Comportamento da Taxa** | Percentual fixo | Maior em incerteza 50/50, menor nos extremos |

---

## 6. Flexibilidade de Negociacao

| Recurso | Futurus | Kalshi |
|---------|---------|--------|
| **Saida Antecipada** | Nao descrita (provavelmente ate a resolucao) | Sim - venda de contratos a qualquer momento no mercado secundario |
| **Tipos de Ordem** | Tipo unico (aposta no pool) | Ordens a mercado e ordens limitadas |
| **Saida Parcial** | Nao descrita | Sim - venda de qualquer quantidade de contratos |
| **Negociacao Pre-Resolucao** | Apostas alteram as probabilidades do pool dinamicamente | Negociacao completa no mercado secundario |

---

## 7. Perfil de Risco

| Aspecto | Futurus | Kalshi |
|---------|---------|--------|
| **Perda Maxima** | Valor total da aposta | Preco total de compra |
| **Ganho Maximo** | Participacao proporcional do pool inteiro (pode ser muito alto) | $1,00 por contrato menos preco de compra |
| **Incerteza do Retorno** | Alta - pagamento depende do estado final do pool | Baixa - pagamento conhecido na compra |
| **Risco de Liquidez** | Nenhum (o pool sempre paga) | Possivel (pode nao encontrar comprador/vendedor) |

---

## 8. Pontos Fortes e Fracos

### Futurus
| Pontos Fortes | Pontos Fracos |
|---------------|---------------|
| Simples de entender (aposte Sim ou Nao) | Pagamento incerto ate o fechamento do mercado |
| Nao necessita correspondencia de contraparte | Nenhum mecanismo de saida antecipada descrito |
| Liquidez garantida (baseado em pool) | Apostadores tardios podem diluir retornos dos primeiros |
| Retornos potencialmente maiores (pool perdedor inteiro redistribuido) | Nenhum marco regulatorio mencionado |

### Kalshi
| Pontos Fortes | Pontos Fracos |
|---------------|---------------|
| Regulado pela CFTC, legal nos EUA | Mais complexo (livro de ordens, ordens limitadas) |
| Pagamento conhecido no momento da compra | Liquidez dependente da atividade do mercado |
| Possibilidade de sair de posicoes antecipadamente | Estrutura de taxas penaliza mercados incertos |
| Integracoes com corretoras (Robinhood) | Limitado a $1,00 por contrato |
| Estrutura de incentivo maker/taker | Requer maior conhecimento financeiro |

---

## 9. Publico-Alvo

| Aspecto | Futurus | Kalshi |
|---------|---------|--------|
| **Usuario Ideal** | Apostadores casuais, UX mais simples | Traders sofisticados, usuarios orientados a financas |
| **Complexidade** | Baixa barreira de entrada | Media-alta (familiaridade com livro de ordens necessaria) |
| **Foco de Mercado** | Eventos gerais | Politica, financas, esportes, entretenimento |
| **Geografia** | Nao especificada | Focado nos EUA (regulado pela CFTC) |

---

## 10. Resumo dos Principais Diferenciais

**Futurus** funciona como um **bolao** - todos colocam dinheiro, e os vencedores dividem o pote. Este modelo e mais simples, garante liquidez e pode oferecer retornos extraordinarios quando um lado do pool e muito maior que o outro.

**Kalshi** funciona como uma **bolsa de valores** - voce compra e vende contratos a precos definidos pelo mercado com pagamentos conhecidos. Este modelo oferece mais flexibilidade de negociacao, protecao regulatoria e transparencia, mas exige mais sofisticacao dos usuarios.

### Analogia
- **Futurus** = Corrida de cavalos (parimutuel) - aposte em um pool, vencedores dividem proporcionalmente.
- **Kalshi** = Bolsa de valores (exchange) - compre/venda contratos com valores de liquidacao fixos.
