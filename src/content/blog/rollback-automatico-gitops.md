---
title: "Rollback automático sem drama: GitOps com ArgoCD"
description: "Como usar o estado desejado no Git, health checks e análise de rollout para voltar atrás automaticamente quando um deploy dá errado."
pubDate: 2026-10-28
tags: ["GitOps", "Kubernetes", "ArgoCD"]
---

Rollback automático só funciona quando o deploy é descartável. Se voltar atrás exige rodar um script manual, alterar banco ou lembrar o comando exato, o processo vai falhar justamente no momento de pressão.

Com GitOps, a pergunta muda de "como desfaço o deploy?" para "qual era o estado anterior no Git?". Essa é a base de um rollback previsível.

## O Git é a fonte da verdade

No ArgoCD, o cluster deve refletir o que está no repositório. Nada de `kubectl edit` em produção: qualquer ajuste emergencial precisa voltar como commit, mesmo que depois seja refinado.

Isso traz duas garantias:

- o histórico de mudanças é auditável;
- o rollback é um `git revert`, não um procedimento artesanal.

## Health check não é o mesmo que pod pronto

Um pod em `Running` não significa aplicação saudável. Configure probes de leitura e escrita e use o health check do ArgoCD para olhar o recurso como um todo, não só o container.

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  periodSeconds: 5
  failureThreshold: 3

livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

Probe de readiness deve responder rápido e checar dependências essenciais. Se ela consulta um serviço externo instável, o cluster inteiro reinicia em cascata.

## Rollout gradual com análise

Para serviços críticos, vale combinar ArgoCD com Argo Rollouts e uma análise automática:

```yaml
strategy:
  canary:
    steps:
      - setWeight: 10
      - pause: { duration: 2m }
      - setWeight: 50
      - pause: { duration: 5m }
    analysis:
      templates:
        - templateName: success-rate
      startingStep: 1
```

A análise consulta métricas reais — taxa de erro, latência, saturação — e aborta o rollout se o resultado piorar. O Argo volta para a versão anterior sem intervenção humana.

## O rollback é um commit

Quando a análise falha, o estado desejado continua sendo o que está no Git. Existem dois caminhos:

1. O pipeline reverte o commit automaticamente e o ArgoCD sincroniza.
2. O rollout é abortado no cluster e o Git é corrigido em seguida.

O primeiro é mais consistente. O segundo é mais rápido, mas exige disciplina para não deixar cluster e repositório divergentes.

## Cuidado com migrações de banco

Rollback de aplicação não desfaz migração. Por isso, migrações precisam ser compatíveis com as duas versões durante a janela de transição:

- adicione colunas antes de usá-las;
- não remova colunas no mesmo deploy que deixa de usá-las;
- separe mudanças de schema de mudanças de código.

Se o rollback da aplicação depende de reverter dados, você não tem rollback: tem restauração de backup.

## Checklist

- Nenhuma alteração manual no cluster sem commit correspondente.
- Probes refletem a saúde real do serviço.
- Rollout gradual com análise de métricas para serviços críticos.
- Rollback automatizado e testado em ambiente de staging.
- Migrações compatíveis com a versão anterior durante o deploy.

Rollback automático não é sobre falhar menos. É sobre falhar por menos tempo.
