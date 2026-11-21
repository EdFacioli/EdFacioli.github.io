# Portfólio + Blog

Site pessoal de Edson A Facioli, feito com [Astro](https://astro.build) e publicado no GitHub Pages.

## Estrutura

```
site/
├── src/
│   ├── content/blog/       # posts em Markdown
│   ├── content.config.ts   # schema da coleção do blog
│   ├── layouts/            # layout base (header, nav, footer)
│   ├── lib/                # helpers de data, leitura e URLs
│   ├── pages/
│   │   ├── index.astro     # portfólio
│   │   ├── blog/           # listagem e páginas dos posts
│   │   └── 404.astro
│   └── styles/global.css
├── public/                 # arquivos estáticos (favicon, CNAME…)
└── astro.config.mjs
```

## Desenvolvimento

Requisito: Node.js 22.12 ou superior.

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # gera site/dist
npm run preview  # serve o build localmente
```

## Escrever um post

Crie um arquivo `.md` em `site/src/content/blog/`. O nome do arquivo vira a URL
(ex.: `meu-post.md` → `/blog/meu-post/`).

```md
---
title: "Título do post"
description: "Resumo curto usado na listagem e no SEO."
pubDate: 2026-11-18
tags: ["Deploy", "Kubernetes"]
draft: false
---

Conteúdo em Markdown.
```

O campo `draft: true` esconde o post da listagem e do build.

## Como publicar

1. Envie as alterações para a branch `main`.
2. O workflow `.github/workflows/deploy.yml` instala as dependências, roda o
   build do Astro e publica `site/dist` no GitHub Pages.
3. Em Settings → Pages, mantenha Source como **GitHub Actions**.

O `base_path` do GitHub Pages é repassado ao build em `BASE_PATH`, então o site
funciona tanto na raiz (`usuario.github.io`) quanto em uma subpasta
(`/nome-do-repositorio`).

Para domínio próprio, adicione um arquivo `site/public/CNAME` com o domínio e
configure o DNS. O deploy passa a usar a raiz como base.
