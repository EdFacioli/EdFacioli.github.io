---
title: "Observabilidade sem ruído: alertas que o time escuta"
description: "Como trocar dezenas de alertas de CPU por SLOs, burn rate e runbooks que apontam para um problema real e acionável."
pubDate: 2026-10-14
tags: ["Observabilidade", "SRE", "Prometheus"]
---

Time que recebe alerta demais aprende a ignorar alerta. O sintoma é conhecido: canal de incidentes cheio, ninguém sabe qual é urgente e, quando um problema real acontece, a resposta demora mais do que deveria.

O oposto também é ruim: monitorar tudo e alertar sobre nada. Observabilidade sem ação é dashboard bonito.

## Alerta de sintoma, não de causa

CPU em 85% pode ser normal para uma aplicação que processa fila. Taxa de erro acima do aceitável nunca é normal do ponto de vista do usuário.

A regra prática: alerte sobre o que o usuário sente. Latência, erros e indisponibilidade primeiro. CPU, memória e disco entram como contexto para investigação, não como página no celular de alguém às três da manhã.

## SLO como contrato

Um SLO transforma "está rápido?" em uma pergunta objetiva. Exemplo: 99,9% das requisições em 30 dias devem responder em menos de 300 ms.

A partir dele, o alerta deixa de ser um limiar arbitrário e passa a medir consumo do orçamento de erro. Se o serviço já gastou 80% do orçamento no primeiro terço do mês, o time precisa agir antes do estouro.

## Burn rate na prática

Burn rate compara a taxa atual de erros com a taxa que esgotaria o SLO no período. Um burn rate de 14,4 em uma janela de uma hora indica que o orçamento mensal acabaria em cerca de dois dias.

```text
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

Alertas úteis combinam janelas curtas e longas: uma para detectar incidentes agudos, outra para capturar degradação lenta. Assim você evita tanto o alerta que dispara por um pico isolado quanto o problema que só aparece no fim do mês.

## Todo alerta precisa de um runbook

Se o alerta chega e a primeira pergunta é "o que eu faço agora?", o alerta está incompleto. O runbook não precisa ser longo: três ou quatro passos com o painel, o comando de verificação e o critério para escalar já resolvem a maior parte.

Um bom runbook responde:

- o que esse alerta significa para o usuário;
- como confirmar que é um problema real;
- quais ações são seguras;
- quando escalar e para quem.

## Dashboards com hierarquia

Um dashboard por serviço, com quatro blocos, cobre o essencial: tráfego, erros, latência e saturação. Detalhes ficam em painéis secundários, acessíveis quando necessário.

O erro comum é começar pela ferramenta. Prometheus, Grafana e Loki são meios; o desenho do que precisa ser observado vem antes.

## Checklist

- Alertas ligados a sintomas percebidos pelo usuário.
- SLOs definidos por serviço e revisados com o time.
- Burn rate com janelas curtas e longas.
- Runbook curto para cada alerta que página alguém.
- Dashboards com hierarquia clara, do panorama ao detalhe.

Menos alertas, mais sinal. O objetivo não é ver tudo: é saber, rápido, quando algo importa.
