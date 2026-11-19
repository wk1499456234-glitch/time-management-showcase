# Static release and recovery

This repository builds the independent TimeWeave browser demo for its existing GitHub Pages subpath. Only `dist/` is deployed. There is no server, login or AI API in this edition.

## Release identity

- This revision's HTML marker: `20261119-public-reliability-v1`.
- Previous accepted public commit: `df86243777b2694388b440baf7bee54e036f5f00`, marker `20261119-copy-polish-v1`, [successful workflow 44520541381](https://github.com/wk1499456234-glitch/time-management-showcase/actions/runs/44520541381).
- The release commit is the `head_sha` of the successful **Deploy time management showcase** run for this marker. Match that SHA to the checkout and its `index.html`; do not substitute a documentation-only commit or an old HTTP 200 response. The workflow summary records SHA and marker together.

## Publish and verify

1. Review source and documentation, including removals. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, `npm audit` and `npm audit --omit=dev`.
2. Refresh `PUBLIC-FILES.txt` and `CHECKPOINT.sha256` using `node scripts/manifest.mjs`. Review the generated list before staging. Stage only reviewed files, then run `npm run check:public`: it requires exact equality with tracked and non-ignored candidate files, scans all text and verifies hashes.
3. Use the authenticated account's verified GitHub noreply email in this repository only. Commit and normally push `main`; never force push. A push triggers `.github/workflows/pages.yml`.
4. Verify that exact run succeeds, then compare the official HTML release marker and downloaded JS/CSS bytes to the accepted `dist/`. Confirm the four hash routes, old `#backup` and nested `#/settings/backup`, history navigation and refresh on the Pages subpath.
5. Use disposable fictional browser records to check save, edit, retry and JSON restore. Read the fixed example week separately. Public runtime CSP uses `connect-src 'none'`; no API requests should occur.

## Recovery and local records

Before changing domain or clearing site data, export JSON from Settings. Keep the original file. Import previews record counts and merges identical records once; conflicting IDs are rejected. A failed write is not a successful restore: retain the page and retry or export the in-memory branch. Browser keys and JSON schema are unchanged by this release.

To revert this release, make a new revert commit and deploy it through the same workflow, using the previous accepted commit above as the reference. Preserve visitor storage and drafts; do not reset the remote or overwrite user data. The preceding version has the known save-failure reporting issue, so prefer a forward repair if that path is needed.

Browser storage belongs to an origin, not a URL path. A storage namespace prevents accidental key collisions but does not isolate applications sharing that origin. Moving origins requires export from the old origin and import at the new one.
