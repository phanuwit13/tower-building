# Deploying the city builder to Cloudflare

The game is a static Vite site (`npm run build` writes `dist/`), served by Cloudflare Workers static assets. Configuration lives in `wrangler.jsonc`.

## One-time setup (repository owner)

1. Merge the pull request that adds the game first. The current `main` has no `package.json`, and preview builds need the production Worker to exist. Connect Cloudflare only after the merge.
2. Open the Cloudflare dashboard, go to **Workers & Pages**, then **Create** and **Import a repository**.
3. Select the GitHub repository `phanuwit13/tower-building`.
4. Set the Worker name to **`city-builder`**. It must match `name` in `wrangler.jsonc`, otherwise the build fails with a name-mismatch error.
5. Build command: `npm run build`.
6. Deploy command: `npx wrangler deploy` (the default).
7. Production branch: `main` (the default). Workers Builds (Cloudflare's build system) uses the Wrangler version pinned in `package.json`.
8. Enable builds for non-production branches. Their default deploy command is `npx wrangler preview` (needs Wrangler 4.135.0 or newer), which creates a Preview URL of the form `<preview-name>-city-builder.<subdomain>.workers.dev`. GitHub pull requests get that URL as a comment. The empty `previews` block in `wrangler.jsonc` is what lets these PR preview builds run.
9. Preview URLs are served on workers.dev (or a custom domain), so keep workers.dev enabled.

## Notes

- Preview URLs are public by default. Do not put anything private on a branch you preview.
- If the school network blocks `*.workers.dev`, add a custom domain under the Worker's **Domains & Routes**.
- CI (`.github/workflows/ci.yml`) runs typecheck, tests and build on every pull request and on pushes to `main`. It does not deploy; Cloudflare Workers Builds does.
- Local check without a Cloudflare login: `npm run build && npx wrangler deploy --dry-run`.
