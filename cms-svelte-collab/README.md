# CMS Ultra — Svelte Collaboration

Svelte 3 + TypeScript microfrontend for article-linked discussions and browser-based CMS activity.

## Capabilities

- Select articles from the shared `cms_articles` collection.
- Create, edit, delete, resolve and reopen article comments.
- Recognize and suggest demo-user mentions.
- Filter the activity feed by article, actor and event type.
- Refresh shared collections from same-tab CMS events and cross-tab storage changes.
- Surface comment/activity persistence errors without pretending a failed write succeeded.

Comments and activity are stored in `cms_collaboration_comments` and `cms_collaboration_activity`. This is a browser-local collaboration demonstration, not server-backed real-time messaging, multi-user presence or synchronized concurrent editing.

## Local development and build

```bash
npm ci --legacy-peer-deps
npm start
npm run build
```

The development server uses port `8083`. The production output is `dist/main.js`, a SystemJS-compatible bundle.
