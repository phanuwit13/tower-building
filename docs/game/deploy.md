# Deploying the city builder to Cloudflare

The game is a static Vite site (`npm run build` writes `dist/`), served by Cloudflare Workers static assets. Configuration lives in `wrangler.jsonc`.

## One-time setup (repository owner)

1. Open the Cloudflare dashboard, go to **Workers & Pages**, then **Create** and **Import a repository**.
2. Select the GitHub repository `phanuwit13/tower-building`.
3. Set the Worker name to **`city-builder`**. It must match `name` in `wrangler.jsonc`, otherwise the build fails with "The name in your Wrangler configuration file ... must match the name of your Worker".
4. Build command: `npm run build`.
5. Deploy command: `npx wrangler deploy` (the default).
6. Production branch: `main` (the default). Builds uses the Wrangler version pinned in `package.json`.
7. Enable builds for non-production branches. Their default deploy command is `npx wrangler preview` (needs Wrangler 4.135.0 or newer), which creates a Preview URL of the form `<preview-name>-city-builder.<subdomain>.workers.dev`. GitHub pull requests get that URL as a comment.
8. Keep **workers.dev** enabled for the Worker. A Preview URL needs a preview host (workers.dev Preview URLs and/or a custom domain).

## Notes

- Preview URLs are public by default. Do not put anything private on a branch you preview.
- If the school network blocks `*.workers.dev`, add a custom domain under the Worker's **Domains & Routes**.
- CI (`.github/workflows/ci.yml`) runs typecheck, tests and build on every pull request and on pushes to `main`. It does not deploy; Cloudflare Workers Builds does.
- Local check without a Cloudflare login: `npm run build && npx wrangler deploy --dry-run`.
