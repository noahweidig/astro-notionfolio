import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const { site } = parse(readFileSync(new URL('./portfolio.config.yaml', import.meta.url), 'utf8'));

export default defineConfig({
  site: site.url,
  base: site.base ?? '/',
  trailingSlash: 'always',
});
