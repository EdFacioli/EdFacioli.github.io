import { defineConfig } from 'astro/config';

// Em GitHub Pages de projeto, o site fica em /<nome-do-repositorio>/.
// O workflow define BASE_PATH automaticamente; localmente o padrão é "/".
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://edfacioli.github.io',
});
