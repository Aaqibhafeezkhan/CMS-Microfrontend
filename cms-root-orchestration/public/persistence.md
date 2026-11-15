# Browser persistence contract

CMS Ultra is a client-side demonstration. Browser storage is the persistence boundary; this is not a substitute for a server-side database or authorization service.

| Key | Owner | Shape |
| --- | --- | --- |
| `cms_session` | Angular Auth / shell | Demo session with nested user, issuedAt and expiresAt |
| `cms_users` | Angular Auth | Demo user profiles and role assignments; no stored passwords |
| `cms_articles` | React Editorial | Article records, lifecycle state and revisions |
| `cms_collaboration_comments` | Svelte Collaboration | Article-linked comments |
| `cms_collaboration_activity` | Svelte Collaboration | Recent activity entries |
| `cms_assets` | Vue Media | Asset metadata and stable media references |
| `cms_media_selection` | Vue Media → React Editorial | One-shot selected asset reference |
| `cms_platform_schema` | Root platform | Browser contract version metadata |
| `cms_sidebar_collapsed` | Root shell | UI preference |

Uploaded image Blobs are stored in IndexedDB database `cms-media-library`, object store `assets`, keyed by stable asset ID. Article records keep `media://<assetId>` references. Object URLs are temporary previews and must not be persisted.

The root platform helper exposes allowlisted reads/writes, session validation and a versioned CustomEvent contract. Current MFEs also use focused local storage wrappers so they can preserve local component state when writes fail. Callers must check write results before updating visible success state or publishing success events.

Same-tab changes are coordinated with browser CustomEvents. Cross-tab changes use the browser `storage` event. Storage events do not fire in the tab that performed the write. Data remains in the current browser profile; clearing site data removes the demo workspace.
