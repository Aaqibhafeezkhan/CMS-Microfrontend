# CMS Ultra — React Editorial

React 17 + TypeScript microfrontend responsible for article authoring and the editorial lifecycle.

## Capabilities

- Article creation, editing, preview, search, filtering and sorting.
- Draft, Review, Published and Archived states with validated transitions.
- Unique slug validation, excerpts, tags, categories and cover-media references.
- Revision metadata, duplication, archive/restore and confirmed deletion.
- Role-aware operations and persistence-before-event behavior.
- Cross-tab article-list refresh and media selection handoff from Vue Media.

Articles are stored in browser localStorage under `cms_articles`. Cover images use stable `media://<assetId>` references for uploaded local assets; external image URLs remain supported for existing/demo content.

## Local development and build

```bash
npm ci --legacy-peer-deps
npm start
npm run build
```

The development server uses port `8081`. The production output is `dist/main.js`, a SystemJS-compatible module exposing the single-spa lifecycle exports.
