# Browser persistence contract

CMS Ultra is a client-side demonstration. The browser is the persistence boundary; this is not a substitute for a server-side database or authorization service.

| Key | Owner | Shape |
| --- | --- | --- |
| `cms_session` | Angular Auth / shell | Session with user, issuedAt and expiresAt |
| `cms_users` | Angular Auth | User records without passwords |
| `cms_articles` | React Editorial | Article records with stable IDs and status |
| `cms_collaboration_comments` | Svelte Collaboration | Article-linked comments |
| `cms_collaboration_activity` | Svelte Collaboration | Recent activity records |
| `cms_assets` | Vue Media | Asset metadata; image blobs live in IndexedDB |
| `cms_media_selection` | Vue Media → React Editorial | One-shot selected asset reference |

The platform helper provides guarded reads and writes, validates sessions, and exposes a snapshot of the shared collections. It never replaces a malformed collection with seed content. Existing MFE-specific migration and error messages remain responsible for surfacing invalid records.

The browser `storage` event is used for cross-tab refresh. Same-tab communication uses versioned CustomEvents described in `platform.d.ts`. Storage writes can fail because of browser privacy settings or quota limits; callers must check the boolean result and preserve their in-memory copy.
