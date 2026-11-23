import { memoryStore } from '../app/browserStore';
import { demoFullGame } from '../game/demo';
import { loadQuality, saveGame, saveQuality, type KeyValueStore } from '../game/save';
import type { Catalog, GroundId, QualityTier } from '../game/types';
import { T } from '../ui/strings';
import type { Stage } from './stage';

const UPDATE_MS = 500;
const DEFAULT_DEMO_SEED = 1;

const DEFAULT_DEMO_THEME = 'school';

/**
 * `?demo=full[&seed=<uint>][&theme=<id>]`: start on a full map (see demoFullGame); null when not
 * asked for. The theme is returned as given: the caller falls back to School when it is unknown.
 */
export function parseDemoParam(search: string): { seed: number; theme: string } | null {
  const params = new URLSearchParams(search);
  if (params.get('demo') !== 'full') return null;
  const raw = params.get('seed');
  const seed = raw !== null && /^\d+$/.test(raw) ? Number(raw) >>> 0 : DEFAULT_DEMO_SEED;
  const theme = params.get('theme');
  return { seed, theme: theme && theme.length > 0 ? theme : DEFAULT_DEMO_THEME };
}

/**
 * The store a demo round plays in: memory only, holding the demo city (sunny day on grass) and a
 * copy of the player's quality preference. `ground` is the theme's own ground (School: grass). The player's own save and preference are never touched.
 */
export function demoStore(real: KeyValueStore, catalog: Catalog, seed: number, ground: GroundId = 'grass'): KeyValueStore {
  const store = memoryStore({});
  saveGame(store, demoFullGame(catalog, { weather: 'sunny', time: 'day', ground }, seed));
  const quality = loadQuality(real);
  if (quality) saveQuality(store, quality);
  return store;
}

export interface OverlayStats { fps: number; tier: QualityTier; calls: number; cityMs?: number }

/** One line: fps, tier, draw calls of the last frame, and the last city rebuild time when known. */
export function overlayText(s: OverlayStats): string {
  const city = s.cityMs === undefined ? '' : ` · city ${s.cityMs.toFixed(1)} ms`;
  return `${s.fps} fps · ${T.quality[s.tier]} · ${s.calls} calls${city}`;
}

/**
 * `?fps=1` overlay for testing a real device: average fps, tier and draw calls (every pass of the
 * last frame, `renderer.info.render.calls`), refreshed about twice a second. `getCityMs` adds how
 * long the last change to the placed items took to rebuild.
 */
export function attachFpsOverlay(stage: Stage, getTier: () => QualityTier, getCityMs?: () => number | undefined): void {
  if (new URLSearchParams(location.search).get('fps') !== '1') return;
  const box = document.createElement('div');
  box.className = 'fps-overlay';
  Object.assign(box.style, {
    // bottom left: clear of the item cards, the top buttons and the rotate / place buttons
    position: 'fixed', bottom: '8px', left: '8px', zIndex: '1000', pointerEvents: 'none',
    padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff',
    font: '12px/1.3 monospace',
  });
  document.body.appendChild(box);

  let frames = 0;
  let elapsed = 0;
  stage.onFrame((dtMs) => {
    frames++;
    elapsed += dtMs;
    if (elapsed < UPDATE_MS) return;
    box.textContent = overlayText({
      fps: Math.round((frames * 1000) / elapsed), tier: getTier(), calls: stage.frameStats().calls, cityMs: getCityMs?.(),
    });
    frames = 0;
    elapsed = 0;
  });
}
