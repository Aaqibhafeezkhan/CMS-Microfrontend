# CMS Microfrontend Platform

A portfolio-grade content management platform built as a **multi-framework microfrontend architecture**. The application demonstrates how Angular, React, Svelte, and Vue applications can coexist as independently developed modules while being composed into a single CMS experience through **single-spa, SystemJS, and import maps**.

The repository is intentionally structured as a small microfrontend ecosystem rather than a conventional monolithic frontend. Each business capability lives in its own application, has its own dependency graph and build process, and can also be developed and deployed independently.

## What this project demonstrates

- Microfrontend architecture with **single-spa**
- Runtime composition with **SystemJS import maps**
- Multiple frontend frameworks in one product
- Independent builds and deployments for each microfrontend
- Shell-level routing and application lifecycle management
- Shared authentication state across independently mounted applications
- Client-side session validation and protected routes
- Role-based authorization contracts
- Responsive CMS-style user interfaces
- Vercel deployment composition that bundles the independently built MFEs

## Architecture

The root shell composes four peer business microfrontends. It owns routing, navigation, the shared design system, session-aware route gating, and runtime recovery; it does not own the business logic of the four modules.

```text
                           CMS Ultra
                    Root orchestration shell
                    single-spa · SystemJS
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    Angular Auth        React Editorial    Svelte Collaboration
      Angular 11          React 17              Svelte 3
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                         Vue Media
                          Vue 2.6

All four business microfrontends are peers mounted by the root shell.
```

### Microfrontend responsibilities

| Application | Framework | Responsibility | Route |
|---|---|---|---|
| `cms-root-orchestration` | TypeScript + single-spa | Shell, dashboard, routes, contracts and lifecycle recovery | `/` |
| `cms-angular-auth` | Angular 11 | Demo sign-in, session state, users and role management | `/auth` |
| `cms-react-editorial` | React 17 + TypeScript | Article authoring, lifecycle, preview and revisions | `/editorial` |
| `cms-svelte-collab` | Svelte 3 + TypeScript | Article discussions, comments, mentions and activity | `/collab` |
| `cms-vue-media` | Vue 2.6 + TypeScript | Image upload, local asset metadata, previews and selection | `/media` |

## Repository structure

```text
CMS-Microfrontend/
├── cms-root-orchestration/
│   ├── public/
│   │   ├── index.html
│   │   └── design-system.css
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── webpack.config.js
│   └── vercel.json
│
├── cms-angular-auth/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── app.component.html
│   │       ├── app.component.ts
│   │       ├── app.module.ts
│   │       └── auth-contract.ts
│   ├── package.json
│   └── webpack.config.js
│
├── cms-react-editorial/
│   ├── src/
│   │   ├── EditorialApp.tsx
│   │   ├── PageEditor.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── webpack.config.js
│
├── cms-svelte-collab/
│   ├── src/
│   │   ├── CollabApp.svelte
│   │   └── main.ts
│   ├── package.json
│   └── webpack.config.js
│
├── cms-vue-media/
│   ├── src/
│   │   ├── MediaApp.vue
│   │   └── main.ts
│   ├── package.json
│   └── vue.config.js
│
├── scripts/
│   ├── build-vercel.js
│   └── prepare-vercel-deployment.js
│
└── vercel.json
```

## Microfrontend details

### 1. Root orchestration shell

`cms-root-orchestration` is the host application. It registers the four business microfrontends with single-spa, defines their routes, resolves their SystemJS import-map entries, renders the dashboard and shared navigation, and surfaces recoverable module failures.

The shell validates the browser-persisted session before allowing access to protected modules. This route gate is a demo convenience, not a security boundary; each MFE also checks permissions before performing its own local operations.

The landing route reads article, collaboration, activity, media and session data from the shared browser contracts. The shell remains framework-neutral and does not import another MFE's component implementation.

### 2. Authentication & authorization

`cms-angular-auth` provides deliberately fake demo sign-in and role management. The three roles are:

- **Administrator** — all demo permissions, including user and role management.
- **Editor** — content review/publishing, media management and collaboration moderation.
- **Contributor** — article creation/editing and collaboration participation.

The session is stored in `cms_session` with a nested user record, issue time and expiry time. Demo sessions expire after 30 minutes. The `cms_users` collection stores user profile/role records without passwords. Select one of the in-app demo account shortcuts to populate the fake credentials.

This is client-side demonstration authentication. It is not an identity provider and does not protect real data.

### 3. Editorial suite

`cms-react-editorial` owns the article model and its lifecycle:

- Draft, Review, Published and Archived states with guarded transitions.
- Title, unique slug, excerpt, body, cover reference, author, timestamps, tags, categories and revision history.
- Create, edit, search, filter, sort, preview, duplicate, archive/restore and delete workflows.
- Role checks at operation boundaries and persistence-before-success event publication.
- Stable `media://<assetId>` cover references resolved from the shared media IndexedDB store.

Article records are persisted in `cms_articles` in the current browser.

### 4. Collaboration

`cms-svelte-collab` associates discussions with actual article IDs. It supports article selection, comments, editing/deletion by permitted actors, mention recognition, resolving/reopening discussion threads, and a filterable activity stream.

Comments and activity are browser-persisted in `cms_collaboration_comments` and `cms_collaboration_activity`. Same-tab events update the mounted workspace; browser storage events refresh other tabs. This is not server-backed real-time collaboration or shared multi-user presence.

### 5. Media library

`cms-vue-media` manages image assets in the browser. It supports image upload (5 MB per-file limit), grid/list views, search, sorting, previews, alt text and tags, asset selection and deletion.

Asset metadata is stored in `cms_assets`; uploaded binary Blobs are stored in IndexedDB database `cms-media-library`, object store `assets`. Editorial records keep stable `media://<assetId>` references. Object URLs are temporary preview handles only and are not persisted. These assets are local to the browser profile and are not publicly hosted or synchronized to other devices.

## Runtime composition

The platform uses an import map in the root shell to resolve shared libraries and remote microfrontends at runtime.

Conceptually:

```text
Browser
  │
  ├── SystemJS
  │     │
  │     ├── single-spa
  │     ├── single-spa-layout
  │     ├── React / ReactDOM
  │     ├── Vue
  │     └── Microfrontend bundles
  │
  └── single-spa
        │
        ├── /auth      → cms-angular-auth
        ├── /editorial → cms-react-editorial
        ├── /collab    → cms-svelte-collab
        └── /media     → cms-vue-media
```

This means the shell does not need to bundle every application into one frontend artifact. Microfrontends can be resolved and loaded independently.

## Local development

Each microfrontend is an independent Node.js project. Install dependencies separately inside each application.

### Root shell

```bash
cd cms-root-orchestration
npm install
npm start
```

The root development server runs on port `9000`.

### Angular authentication

```bash
cd cms-angular-auth
npm install
npm start
```

The Angular microfrontend runs on port `8084`.

### React editorial

```bash
cd cms-react-editorial
npm install
npm start
```

The React microfrontend runs on port `8081`.

### Vue media

```bash
cd cms-vue-media
npm install
npm start
```

The Vue microfrontend runs on port `8082`.

### Svelte collaboration

```bash
cd cms-svelte-collab
npm install
npm start
```

The Svelte microfrontend runs on port `8083`.

### Running the complete platform locally

Start the four microfrontends first, then start the root orchestration shell.

For local composition, update the import map in `cms-root-orchestration/public/index.html` so the MFE entries point at their local development servers instead of the deployed bundles.

The important idea is that the shell remains the composition layer while each MFE owns its own development server and build pipeline.

## Production builds

Each application has its own production build.

```bash
cd cms-angular-auth
npm run build

cd ../cms-react-editorial
npm run build

cd ../cms-svelte-collab
npm run build

cd ../cms-vue-media
npm run build

cd ../cms-root-orchestration
npm run build
```

The microfrontend builds produce their SystemJS-compatible production bundles, while the root shell produces the host application.

## Deployment

The repository supports two deployment patterns.

### Independent microfrontend deployment

Each application has its own `gh-pages` deployment script and homepage configuration. This supports publishing each microfrontend independently and allows the root shell's import map to consume its remote bundle.

The deployed module URLs follow this pattern:

```text
https://AaqibhafeezKhan.github.io/cms-angular-auth
https://AaqibhafeezKhan.github.io/cms-react-editorial
https://AaqibhafeezKhan.github.io/cms-svelte-collab
https://AaqibhafeezKhan.github.io/cms-vue-media
https://AaqibhafeezKhan.github.io/cms-root-orchestration
```

### Unified Vercel deployment

The repository also contains a root-level `vercel.json` and build scripts that compose the independently built microfrontends into the root shell's `dist` directory.

The Vercel build process:

1. Installs dependencies for every microfrontend.
2. Builds Angular, React, Svelte, Vue and the root shell.
3. Copies each MFE's production `main.js` into `cms-root-orchestration/dist/mfes/`.
4. Rewrites the generated shell configuration to use local `/mfes/...` bundle paths.
5. Inlines the shell design-system CSS for the combined deployment.
6. Serves the resulting root shell as the Vercel output.

The Vercel configuration also rewrites module routes such as `/auth`, `/editorial`, `/collab`, and `/media` back to the shell entry point so client-side routing can resolve correctly.

## Technology stack

| Area | Technology |
|---|---|
| Architecture | Microfrontends |
| Orchestration | single-spa 5.x |
| Runtime module loading | SystemJS |
| Routing/layout | single-spa-layout |
| Authentication MFE | Angular 11 |
| Editorial MFE | React 17 + TypeScript |
| Collaboration MFE | Svelte 3 + TypeScript |
| Media MFE | Vue 2.6 + TypeScript |
| Bundling | Webpack 5 |
| Transpilation | Babel / TypeScript loaders |
| Styling | CSS + shared design system |
| Client-side persistence | Browser `localStorage` |
| Deployment | GitHub Pages / Vercel |

## Why multiple frameworks?

Using four frontend frameworks in a single product is deliberate. It demonstrates one of the core motivations for microfrontends: **teams can evolve different parts of a large application independently while a host application provides a unified user experience**.

In a conventional monolith, introducing a second framework would usually increase coupling and bundle complexity. Here, the frameworks are isolated behind microfrontend boundaries and exposed through a common application lifecycle.

The project therefore serves as a practical demonstration of:

- Framework independence
- Team autonomy
- Independent deployment boundaries
- Runtime composition
- Incremental modernization
- Legacy/new framework coexistence
- Shared platform concerns without forcing a single implementation technology

## Data and persistence model

CMS Ultra is a browser-persisted demonstration with no application database or server API. Its principal localStorage keys are:

- `cms_session` — current demo session.
- `cms_users` — demo user profiles and role assignments.
- `cms_articles` — editorial records and revision metadata.
- `cms_collaboration_comments` — article-linked comments.
- `cms_collaboration_activity` — collaboration activity feed.
- `cms_assets` — media metadata.
- `cms_media_selection` — one-shot media handoff to Editorial.
- `cms_platform_schema` — shared browser-contract version metadata.
- `cms_sidebar_collapsed` — shell UI preference.

Uploaded media Blobs are stored separately in IndexedDB (`cms-media-library` / `assets`). Cross-tab changes use the browser `storage` event; same-tab coordination uses CustomEvents. This data does not automatically travel across devices or browser profiles, and clearing site data removes the demo workspace.

## Authentication flow

The Angular module validates the in-app fake account, writes a 30-minute `cms_session`, and dispatches the legacy `cms:auth:*` event. The root platform helper bridges those events to canonical `auth:login` / `auth:logout` events. The shell and mounted business modules refresh their session-derived UI and permissions from those events and cross-tab storage changes.

The shell redirects protected routes to `/auth` when the session is absent, expired or invalid. The browser-side checks are for demonstration workflow only and can be bypassed by a user who controls the browser.

## Security considerations

This project intentionally demonstrates **frontend authentication and authorization patterns**, not a complete security boundary.

For production use, the architecture should be extended with:

- Server-side authentication
- Secure token/session handling
- HttpOnly and Secure cookies where appropriate
- Backend authorization checks
- CSRF protection where applicable
- Input validation and sanitization
- Content security policy
- Dependency and supply-chain controls
- Centralized audit logging
- Real persistence and API boundaries
- Stronger cross-MFE contract versioning

A role check in a browser must never be considered sufficient authorization for a privileged backend operation.

## Microfrontend communication

Business modules communicate through browser-level events and documented storage references rather than importing one another's framework internals. The root loads `cms-root-orchestration/public/platform.js` before single-spa starts. It exposes `window.CMSPlatform` for versioned event publication/subscription, event validation, allowlisted storage access and session validation.

The contract covers authentication, article lifecycle, comments and media events. Article, comment and media payloads require stable `articleId`, `commentId` or `assetId` identifiers. The shell also observes the legacy native CustomEvents emitted by the current MFE bundles, annotates them with the contract version and validation status, and bridges legacy `cms:auth:*` names. A `contractValid: false` payload is a contract violation that should be fixed at its producer; the compatibility observer does not make invalid business data safe.

See [`platform.d.ts`](cms-root-orchestration/public/platform.d.ts), [`platform.js`](cms-root-orchestration/public/platform.js), and [the browser persistence contract](cms-root-orchestration/public/persistence.md).

## Design principles

### Independent ownership

Each business capability is isolated into its own application and dependency tree.

### Explicit contracts

Cross-application behavior should be exposed through stable events and interfaces rather than framework-specific internals.

### Runtime composition

The shell discovers and loads microfrontends through SystemJS rather than compiling the complete platform into one framework-specific application.

### Progressive evolution

The architecture allows individual modules to be replaced or upgraded independently. For example, an Angular module can eventually be replaced without requiring the editorial React application to be rewritten.

### Thin orchestration layer

The root shell coordinates navigation, lifecycle and platform-level concerns while business functionality remains inside the individual MFEs.

## Project status

This repository is a **working portfolio/reference implementation** of a multi-framework CMS microfrontend architecture.

It focuses on architectural demonstration and frontend composition rather than providing a production-ready headless CMS backend.

## Useful URLs

### Root shell

- [CMS Root Orchestration](https://AaqibhafeezKhan.github.io/cms-root-orchestration)

### Standalone microfrontends

- [Angular Auth](https://AaqibhafeezKhan.github.io/cms-angular-auth)
- [React Editorial](https://AaqibhafeezKhan.github.io/cms-react-editorial)
- [Svelte Collaboration](https://AaqibhafeezKhan.github.io/cms-svelte-collab)
- [Vue Media](https://AaqibhafeezKhan.github.io/cms-vue-media)

## Learning objectives

This project is particularly useful for studying:

1. Microfrontend architecture
2. single-spa application lifecycles
3. SystemJS and import maps
4. Runtime module federation concepts
5. Multi-framework frontend platforms
6. Independent build and deployment pipelines
7. Shell-level routing and authentication
8. Cross-application browser contracts
9. Frontend authorization models
10. Migration and modernization strategies for large web applications

## License

No explicit open-source license is currently defined for this repository. Unless a license is added, standard copyright restrictions apply to the repository contents.


## Media library integration contract

Vue Media and React Editorial share image binaries through same-origin IndexedDB database `cms-media-library`, object store `assets`, keyed by asset ID. Metadata remains in `cms_assets`; uploaded binaries are stored as Blobs and articles persist stable `media://<assetId>` references, never data URLs or temporary object URLs. Object URLs are created only for previews and revoked when no longer needed.

Selecting **Use asset** writes the selection to `cms_media_selection` and dispatches `media:selected`. Its detail is `{ assetId, name, reference, type, size, width, height, altText, source }`; `reference` is the stable media reference. Editorial listens for same-window and cross-tab selection changes, applies the reference to the cover field, and resolves `media://` references from IndexedDB. External image URLs remain supported for manually entered or migrated references.

The media module emits `media:uploaded`, `media:updated`, and `media:deleted` with stable `assetId` and `reference`. Upload success is emitted only after both binary and metadata persistence succeed.


## Shared platform contracts

The root shell loads `cms-root-orchestration/public/platform.js` before starting single-spa. It exposes `window.CMSPlatform`, a small framework-neutral browser API for publishing and subscribing to versioned events, reading/writing registered storage keys, and validating the active session. TypeScript consumers can reference `platform.d.ts`.

The event contract includes authentication, article lifecycle, comments, and media events. Payloads use stable identifiers such as `articleId`, `commentId`, and `assetId`; producers should include the actor/source and avoid sharing framework-specific objects. The helper bridges the existing `cms:auth:*` authentication event names to the canonical `auth:*` names while older MFE bundles are migrated.

## Persistence and data integrity

CMS Ultra currently persists its demo workspace in browser storage. The main keys are `cms_session`, `cms_users`, `cms_articles`, `cms_collaboration_comments`, `cms_collaboration_activity`, and `cms_assets`. Media binary content is stored in IndexedDB; the local-storage media records contain metadata and references. See [the persistence contract](cms-root-orchestration/public/persistence.md) for ownership and expected shapes.

The platform helper guards JSON parsing and storage writes and exposes a snapshot for the dashboard. It does not silently seed over an existing malformed collection. Browser storage can be unavailable or exceed quota, and clearing site data removes the local demo workspace. This is not backend persistence.

## Dashboard, accessibility, and recovery

The root landing route renders a workspace dashboard using current article, comment, activity, media, and session data. It refreshes when relevant CMS events or cross-tab storage changes occur. Quick links open the editorial, collaboration, and media modules.

The shell includes keyboard-visible focus, responsive dashboard layouts, and reduced-motion support. single-spa load/mount failures are surfaced through a recoverable shell message, while storage failures and rejected storage operations receive an actionable explanation. Each MFE remains responsible for accessible labels, field-level validation, and destructive-action confirmation within its own workflows.

## Testing and build

The repository-level Node.js tests use the built-in test runner (Node 22):

```bash
npm test
```

The suite covers the shared event/storage/session contract and the framework-independent editorial lifecycle/role policy. These tests do not replace full component, multi-tab browser, accessibility or end-to-end integration tests.

Build an individual MFE from its directory with its locked dependencies installed:

```bash
npm ci --legacy-peer-deps
npm run build
```

The root shell also builds with `npm run build`. The complete unified Vercel preparation is:

```bash
node scripts/build-vercel.js
```

That script performs clean installs for all four MFEs and the shell, builds each application, then prepares the shared output under `cms-root-orchestration/dist`. The root package documents Node.js `22.x`. It is a manual build/deployment workflow; this repository does not require GitHub Actions.

## Demo security limitations

Authentication and role checks run in the browser and are intended for portfolio evaluation only. Users can inspect or modify local storage, so client-side checks do not protect production data. A production deployment must move identity, session issuance, authorization, and sensitive data access behind a trusted server/API. Never enter real passwords, personal data, or confidential content into the demo.
