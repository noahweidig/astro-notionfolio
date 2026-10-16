# astro-notionfolio

A Notion-inspired portfolio built with Astro. All content lives in one file: [`portfolio.config.yaml`](portfolio.config.yaml).

## Use it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

Edit `portfolio.config.yaml` (name, bio, properties, links, skills, experience, education, projects, writing). Delete any section to hide it. Missing required fields fail the build with a message naming the field.

Set `site.url` and `site.base` before deploying (`base: /repo-name/` for a GitHub Pages project site).

## Config reference

- `site`: title, description, url, base, language, `theme` (light|dark|system), `accent` (blue|red|green|orange|purple|pink|gray), footer
- `profile`: name, icon (emoji), cover (`gradient` list or `image` URL), headline, `properties` table, `about` paragraphs, `callout`
- `nav`: sidebar order (`home`, `projects`, `experience`, `writing`)
- `pages`: per-page icon, title, intro
- `links`, `skills`, `experience`, `education`, `projects`, `writing`: lists, see the sample entries

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on push to `main`. Enable Pages with source "GitHub Actions".

## License

MIT
