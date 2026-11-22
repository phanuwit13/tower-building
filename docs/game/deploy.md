# Deploying the city builder to Cloudflare Pages

The game is a static Vite site. `npm run build` writes `dist/`, and Cloudflare Pages serves that folder. The Pages project is connected to the GitHub repository, so the owner's dashboard settings drive every build. The repository has no Pages config file.

## What is deployed

- The Vite build in `dist/`.
- `public/_headers` is copied into `dist/`. Pages applies it to every response. It sets the Content-Security-Policy, `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`.
- `public/favicon.svg` and `public/boot-check.js` are copied into `dist/` as well.

## Current Pages settings (owner's dashboard)

- Project: **`tower-building`**
- Production branch: **`main`**
- Build command: **`npm run build`**
- Build output directory: **`dist`**
- Node version: **22**, read from `.node-version`. If a build ever uses the wrong Node version, add the environment variable `NODE_VERSION=22` in the Pages project settings.

## Previews

- Every pushed branch gets a preview deployment at `https://<branch-with-slashes-as-dashes>.tower-building.pages.dev`. For example, `feat/stage1c-style-lock` is served at `https://feat-stage1c-style-lock.tower-building.pages.dev`.
- The Cloudflare Pages GitHub app comments the preview link on the pull request.
- Preview links are public. Do not put anything private on a branch you preview.

## Production

- Merging to `main` deploys production at **https://tower-building.pages.dev**.

## Local check of the production build (with headers)

```bash
npm run build && npx wrangler pages dev dist
```

This runs a local server only. It does not need a Cloudflare login. Open the URL it prints and check the response headers with `curl -sI`.

## Blocked domains

If the school network blocks `*.pages.dev`, add a custom domain under the Pages project's **Custom domains**. No code change is needed.

## Troubleshooting

- **The site shows only the title, or the browser loads `/src/main.ts`:** the build command or the output directory is missing in the Pages settings. Set the build command to `npm run build` and the output directory to `dist`, then retry the deployment.

## CI

`.github/workflows/ci.yml` runs typecheck, tests, build and the Playwright e2e tests on every pull request and on pushes to `main`. CI does not deploy. Cloudflare Pages builds and deploys.
