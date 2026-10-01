# 公開手順 / 发布步骤

**公開済み・已发布（2026-10-01）。** [Demo](https://wk1499456234-glitch.github.io/time-management-showcase/) · [Repository](https://github.com/wk1499456234-glitch/time-management-showcase) · [Successful deployment](https://github.com/wk1499456234-glitch/time-management-showcase/actions/runs/36858077377). Deployed application commit: `8a1746c`; later documentation-only updates do not change static assets.

## 推奨案 / 建议方案

A new public GitHub repository containing only `PUBLIC-FILES.txt`, hosted using GitHub Pages. Visitors receive static `dist/` assets over HTTPS. `vite.config.ts` uses relative asset URLs so a repository subpath works without an owner name hardcoded in the build. There is no server API and no cloud record store.

The prepared `.github/workflows/pages.yml` has **manual dispatch only**. Merely pushing source does not trigger a deployment. The workflow checks types, regression tests and public artifacts before uploading **only `dist/`**. It has no custom secret or API key requirement.

Official instructions checked during preparation: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Public repositories are eligible for Pages on GitHub Free; account policy and permissions must still be verified.

## 公開前に所有者が確認すること / 先确认

1. Confirm the GitHub account/organization, proposed repository name, public visibility, README descriptions and candidate file list. Decide whether to add a license; none is granted by this preparation.
2. Review the checkpoint manifest and screenshots. The screenshot records are synthetic test inputs. No personal activity records are bundled.
3. Sign in using the intended GitHub account. Do not put credentials in source or chat.

## 確認後の操作 / 确认后的操作

1. Create an empty public repository under the approved owner. Use this directory's independent local Git history; do not copy the original repository's `.git`.
2. Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check:public`. Review `git status` and the exact staged diff. Stage only the reviewed public manifest, commit, then push to the approved remote. The reviewed local history has been pushed. Reuse the existing repository for subsequent releases; do not recreate it.
3. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**. Protect the `github-pages` environment if required by the owner.
4. In **Actions**, select **Deploy time management showcase**, choose the reviewed branch/commit, and manually run the workflow. Its deployed URL is the authoritative URL; add it to both READMEs only after success.
5. Use a fresh browser profile to verify first visit, start/pause/resume/stop, Output, reload, JSON export/import and mobile layout on the actual HTTPS address. Confirm network requests remain on the public site and data from two browsers is separate.

## 他の静的ホスト / 其他静态托管

Any approved HTTPS static host can serve the output of `npm run build` with publish directory `dist`. No rewrite service or serverless function is needed because navigation is in-page state. Upload only `dist`, never the full working directory. Local preview is not evidence that a public deployment has succeeded.

## 保存領域の注意 / 保存域注意

Browser storage belongs to an origin (protocol + host + port), **not to a URL path**. Different sites on the same account's Pages origin can access the same origin storage. This showcase uses its own key to avoid accidental naming collisions, but that is not a security boundary. Use a dedicated origin if isolation from other applications on that origin is required. A change of domain requires users to export from the old address and import at the new address.
