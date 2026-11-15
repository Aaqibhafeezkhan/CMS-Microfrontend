# CMS Ultra — Vue Media

Vue 2.6 + TypeScript microfrontend for browser-local image asset management.

## Capabilities

- Upload supported images (5 MB maximum per file).
- Grid/list display, filename/alt-text/tag search and sorting.
- Image preview, metadata, alt-text and tag editing.
- Stable asset references and selection handoff to React Editorial.
- Metadata in localStorage (`cms_assets`) and uploaded image Blobs in IndexedDB (`cms-media-library`, object store `assets`).
- Role-aware upload, metadata editing and deletion controls.

Uploaded files are stored only in the current browser profile. They are not publicly hosted or synchronized across devices. Persisted article covers use `media://<assetId>`; temporary object URLs are only used to display previews.

## Local development and build

```bash
npm ci --legacy-peer-deps
npm start
npm run build
```

The development server uses port `8082`. The production output is `dist/main.js`, a SystemJS-compatible bundle.
