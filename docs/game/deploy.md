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
- Pages lowercases the branch name, turns every non-alphanumeric character into `-` and may truncate long names, so the alias you work out by hand can be wrong. The link the Cloudflare Pages GitHub app comments on the pull request is the authoritative one.
- Preview links are public. Do not put anything private on a branch you preview.

## Checking speed on a school device

Add these to a preview or production link. They are deliberate tools, also in production, so teachers can test school devices. They run in memory only, never touch the saved city, and make no network requests:

- `?fps=1` shows a small box in the bottom left: frames per second, the quality tier (สวย or ลื่น), the draw calls of the last frame, and how long the last change to the placed items took to rebuild (`city … ms`: the whole city when the page opens, one map chunk after each placement).
- `?demo=full&fps=1` starts on a full map of the School theme (about 145 items, every item type), with the last item still to place. Add `&theme=amusement`, `&theme=zoo`, `&theme=beach`, `&theme=market` or `&theme=cafe` (or any theme id) for that theme's city (สวนสนุก about 137 items, สวนสัตว์ about 142, ชายหาดทะเล about 141, ย่านการค้า about 145, ร้านคาเฟ่ about 139 inside its walls, each on its own default ground); a missing or unknown id gives School. The whole map is also floored: 4 × 3 plazas dealt from a shuffle of all 34 floor tiles (every tile appears at least once), crossed by two one-cell paths, so the floor layer is at full load too (floors included, the full demo draws in about 15 calls by day and 17 by night on ลื่น, and about 48 and 50 on สวย). This is the heaviest case: check that ลื่น stays at 30 fps or more while you orbit the camera, then place the last item with วาง and watch `city … ms`. Add `&seed=2` (any whole number) for a different city. The demo plays in memory only: the player's saved city is not touched, and reloading starts the demo again.

Targets: at least 30 fps on ลื่น on a 4 GB Chromebook, about 60 fps on สวย on a normal laptop. A full map draws in about 11 calls on ลื่น and about 40 on สวย (a few more on the frame after a change, when the shadows are redrawn).

## Production

- Merging to `main` deploys production at **https://tower-building.pages.dev**.

## Local check of the production build (with headers)

```bash
npm run build && npx wrangler pages dev dist
```

This runs a local server only. It does not need a Cloudflare login. Open the URL it prints and check the response headers with `curl -sI`. A `compatibility_date` warning from `wrangler pages dev` is harmless.

## Blocked domains

If the school network blocks `*.pages.dev`, add a custom domain under the Pages project's **Custom domains**. No code change is needed.

## Troubleshooting

- **The site shows only the title, or the browser loads `/src/main.ts`:** the build command or the output directory is missing in the Pages settings. Set the build command to `npm run build` and the output directory to `dist`, then retry the deployment.

## CI

`.github/workflows/ci.yml` runs typecheck, tests, build and the Playwright e2e tests on every pull request and on pushes to `main`. CI does not deploy. Cloudflare Pages builds and deploys.
