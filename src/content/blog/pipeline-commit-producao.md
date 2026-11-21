---
title: "Do commit à produção em 6 minutos: anatomia de um pipeline enxuto"
description: "O que precisa acontecer entre o git push e o deploy para o processo ser rápido, repetível e seguro — sem transformar o pipeline em um labirinto."
pubDate: 2026-11-10
tags: ["CI/CD", "GitHub Actions", "Docker"]
---

Pipeline rápido não é pipeline curto. É pipeline que faz só o necessário, na ordem certa e em paralelo quando possível. A diferença entre seis minutos e quarenta quase nunca está na máquina de CI: está no desenho do fluxo.

## O relógio começa no push

Antes de otimizar qualquer etapa, vale medir onde o tempo é gasto. Na maioria dos projetos que revisei, três coisas dominavam o tempo total:

- instalação de dependências sem cache;
- testes que rodam em série mesmo sendo independentes;
- imagem Docker construída do zero a cada commit.

Um pipeline saudável tem etapas pequenas e observáveis. Se você não sabe quanto tempo cada uma leva, o primeiro passo é instrumentar: nome claro, duração visível e log curto o suficiente para ser lido.

## Paralelize o que é independente

Lint, testes unitários e build da imagem não precisam esperar um pelo outro. Separe o que valida o código do que empacota o artefato:

```yaml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test

  image:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .
```

O `needs` só deve existir quando há dependência real. Build de imagem depois do lint é uma escolha razoável; build depois de cada arquivo de teste não é.

## Cache com critério

Cache mal configurado é pior que cache nenhum: ele esconde dependências e quebra em silêncio. Use a chave baseada no arquivo de lock e nunca compartilhe cache entre versões incompatíveis de runtime.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: package-lock.json
```

O ganho maior vem de cache de camadas Docker. Se o `COPY package*.json` vier antes do `COPY . .`, a camada de dependências é reaproveitada mesmo quando só o código mudou.

## Testes em camadas

Não coloque tudo no mesmo balde. Testes unitários são rápidos e devem bloquear o merge. Testes de integração precisam de banco e sobem em paralelo. Testes end-to-end são caros e podem rodar em um job separado, depois do deploy em preview.

A regra que costumo usar: se um teste leva mais de dois minutos, ele provavelmente não é unitário. Mova para a camada certa em vez de aumentar o timeout.

## Deploy não é linha de chegada

O pipeline termina quando a produção está saudável, não quando o `kubectl apply` retorna. Inclua verificação de saúde, smoke test e um caminho de rollback pronto. Um deploy que "passou" e deixou o serviço em erro consome muito mais tempo do que qualquer cache.

Vale também separar build de deploy. O mesmo artefato gerado no commit deve ser promovido entre ambientes — rebuildar em produção é uma fonte clássica de divergência.

## Checklist

- Cada etapa tem nome, duração visível e log objetivo.
- Dependências e camadas Docker usam cache com chave correta.
- Jobs independentes rodam em paralelo.
- Testes estão na camada adequada ao custo.
- Deploy verifica saúde e tem rollback documentado.
- O mesmo artefato é promovido entre ambientes.

Seis minutos é consequência disso, não a meta em si. O objetivo é ter confiança para publicar várias vezes ao dia sem cerimônia.
