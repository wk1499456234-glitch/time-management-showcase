# Static release and recovery

This repository publishes only the standalone TimeWeave browser demo. Build `dist/` using the existing lockfile and serve it on the existing GitHub Pages repository subpath. There is no application server, login service or AI API in this edition.

## Release checks

1. Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`.
2. Review changed source and documentation. Run `node scripts/manifest.mjs` to update the public allowlist and hashes, then `npm run check:public`. The generated list is not a substitute for reviewing files.
3. Commit only the reviewed allowlist to the existing `main`. The workflow now runs on pushes to `main`, with manual dispatch retained. It verifies the build and uploads only `dist/`.
4. Check the exact Actions run and deployed JS/CSS names plus HTML release marker `20261119-timeweave-static-v2`. An old page returning HTTP 200 is not release evidence.
5. On the actual HTTPS site, check the four hash routes, history navigation, a fictional timer/Output trial, reload, JSON backup and saved sample week. Browser reads must not contact an API. The built CSP uses `connect-src 'none'`.

## Recovery

The release immediately before this update is `3aba747` on the existing public `main`. Revert the reviewed release with a new commit and let the same workflow deploy it; do not rewrite Git history. Preserve browser trial records and drafts. The storage namespace and JSON format remain unchanged. This operation does not change any separate full-product deployment.

## 保存領域の注意 / 保存域注意

Browser storage belongs to an origin (protocol + host + port), **not to a URL path**. Different sites on the same account's Pages origin can access the same origin storage. This showcase uses its own key to avoid accidental naming collisions, but that is not a security boundary. Use a dedicated origin if isolation from other applications on that origin is required. A change of domain requires users to export from the old address and import at the new address.
