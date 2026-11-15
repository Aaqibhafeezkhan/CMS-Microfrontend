# CMS Ultra — Angular Auth

Angular 11 microfrontend for the browser-only demo identity and role-management experience.

## Capabilities

- Fake demo sign-in with in-app account shortcuts.
- 30-minute browser-persisted sessions.
- Administrator, Editor and Contributor role assignments.
- Session restore, expiry, logout and cross-tab role/session updates.
- Role permission summary and administrator-only user/role controls.

## Demo limitations

This is not an identity provider. Demo credentials are intentionally fake, passwords are not written to `cms_users`, and all authorization checks run in the browser. Do not use real passwords or real user information.

## Local development and build

```bash
npm ci --legacy-peer-deps
npm start
npm run build
```

The development server uses port `8084`. The production output is `dist/main.js`, a SystemJS-compatible module consumed by the root single-spa shell.
