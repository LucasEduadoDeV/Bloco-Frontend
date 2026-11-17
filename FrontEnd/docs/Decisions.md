# Decisões de produto

Este documento registra decisões de produto e experiência do BLOCO, incluindo o contexto que levou a cada escolha e seus impactos. Use o modelo ao final para adicionar novas decisões; mantenha propostas em avaliação separadas das decisões aprovadas.

## Decisões aprovadas

### DEC-001 — Adotar o dashboard “Treino, semana e equilíbrio”

- **Data:** 2026-11-15
- **Decisão:** Usar a direção visual “04 — Treino, semana e equilíbrio” como base do dashboard.
- **Contexto:** As primeiras alternativas foram exploradas no Doop e esta foi a opção escolhida para evoluir.
- **Impactos:** O dashboard combina a semana atual com referências de alimentação e hidratação. Deve mostrar somente dados disponíveis no perfil/API; não inventar registros de refeições ou treinos.

### DEC-002 — Personalizar a saudação com o primeiro nome

- **Data:** 2026-11-15
- **Decisão:** Exibir apenas o primeiro nome do usuário na saudação, com capitalização adequada, e remover o botão “Voltar ao topo”.
- **Contexto:** A saudação completa ocupava espaço sem acrescentar valor à visão do dashboard.
- **Impactos:** O dashboard apresenta uma saudação mais curta e direta.

### DEC-003 — Convidar quem ainda não tem TMB configurada a completar o perfil

- **Data:** 2026-11-15
- **Decisão:** Quando `basalMetabolicRateKcal` retornado por `GET /api/v1/me` for `0`, convidar a pessoa a informar dados para configurar o perfil.
- **Contexto:** O valor zero indica que a configuração do TMB ainda não foi feita.
- **Impactos:** O convite permite continuar depois. Após salvar o perfil, os dados completos evitam reabrir o convite caso a TMB ainda seja retornada como zero.

### DEC-004 — Usar o modal “Convite direto” para a configuração do TMB

- **Data:** 2026-11-15
- **Decisão:** Usar o Modal TMB 01 como ponto de partida e solicitar gênero, idade, altura, peso e nível de atividade.
- **Contexto:** O usuário escolheu a alternativa de convite direto e pediu para não oferecer “Prefiro não informar”.
- **Impactos:** O fluxo oferece as ações “Agora não” e “Continuar”. A idade apoia o cálculo do TMB. O formulário integra com `PUT /api/v1/me/profile`.

### DEC-005 — Oferecer unidades métricas e imperiais

- **Data:** 2026-11-15
- **Decisão:** Permitir altura em centímetros ou pés/polegadas e peso em quilogramas ou libras.
- **Contexto:** A solicitação por métricas adicionais foi esclarecida como suporte a unidades alternativas.
- **Impactos:** Centímetros e quilogramas aparecem como padrão; pés/polegadas e libras ficam disponíveis como alternativas.

### DEC-006 — Abrir uma tela separada para escolher o nível de atividade

- **Data:** 2026-11-15
- **Decisão:** O campo de nível de atividade usa uma seta para a direita e abre uma nova tela de seleção.
- **Contexto:** A escolha deve acontecer em uma etapa própria, em vez de um menu suspenso no modal.
- **Impactos:** A tela inclui opções de atividade e ações para voltar ou confirmar. A quantidade e as definições finais dos níveis ainda precisam ser aprovadas.

## Proposta em avaliação

### PROPOSTA-001 — Cinco níveis de atividade

- **Status:** Valores definidos pelo contrato atual do backend; descrições continuam como orientação de interface
- **Proposta:** Sedentário, levemente ativo, moderadamente ativo, muito ativo e extremamente ativo.
- **Códigos:** `1` sedentário, `2` levemente ativo, `3` moderadamente ativo, `4` muito ativo, `5` extremamente ativo.

### DEC-007 — Distinguir gasto energético estimado de consumo calórico

- **Data:** 2026-11-16
- **Decisão:** Exibir `estimatedDailyEnergyExpenditureKcal` como estimativa de gasto energético diário para manutenção, separada do consumo calórico registrado em `dailyCalorieConsumptionKcal`.
- **Contexto:** O gasto estimado deriva da TMB e do fator de atividade; não representa uma meta de ingestão.
- **Impactos:** O dashboard mostra o gasto estimado em destaque, a TMB como referência complementar e o consumo registrado do dia em um indicador separado.

## Modelo para novas decisões

### DEC-XXX — Título curto da decisão

- **Data:** AAAA-MM-DD
- **Decisão:** O que foi escolhido?
- **Contexto:** Qual necessidade ou alternativas motivaram a escolha?
- **Impactos:** O que muda no produto, na experiência ou na implementação?
