# CMS Ultra — Root Orchestration Shell

TypeScript single-spa host application that composes the four business microfrontends through SystemJS and an import map.

## Architecture

```text
cms-root-orchestration
  ├── cms-angular-auth     → /auth       (Angular 11)
  ├── cms-react-editorial  → /editorial  (React 17)
  ├── cms-svelte-collab    → /collab     (Svelte 3)
  └── cms-vue-media        → /media      (Vue 2.6)
```

All four MFEs are peers registered by the shell. The shell owns navigation, route gating, the dashboard, the shared design system, the versioned browser contract and single-spa error recovery.

## Local development and build

```bash
npm ci --legacy-peer-deps
npm start
npm run build
```

The development server uses port `9000`. For local composition, point the MFE import-map entries in `public/index.html` to their local development servers.

## Deployment

The root package provides a manual `npm run deploy` script for GitHub Pages after a successful build. The unified deployment is managed from the repository root through `vercel.json` and `node scripts/build-vercel.js`. No GitHub Actions workflow is required or added by this project.

## Module routes

| Route | MFE | Framework |
|---|---|---|
| `/auth` | cms-angular-auth | Angular 11 |
| `/editorial` | cms-react-editorial | React 17 |
| `/collab` | cms-svelte-collab | Svelte 3 |
| `/media` | cms-vue-media | Vue 2.6 |
