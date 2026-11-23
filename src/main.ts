import '@fontsource/mitr/400.css';
import '@fontsource/mitr/600.css';
import './styles.css';
import type { QualityTier, SceneSettings } from './game/types';
import { loadQuality } from './game/save';
import { getStyleKit } from './models/kit';
import { createController, type AppState } from './app/controller';
import { detectTier, FpsMonitor } from './app/quality';
import { randomSeed } from './game/rng';
import { fillStats } from './game/grid';
import { browserStore } from './app/browserStore';
import { getCatalog, getTheme, THEMES } from './themes/registry';
import type { ThemeDef } from './themes/types';
import { createCityView } from './render/city';
import { attachInput } from './render/input';
import { placementAtTile } from './app/hover';
import { createEnvironment } from './render/environment';
import { createGround } from './render/ground';
import { attachFpsOverlay, demoStore, parseDemoParam } from './render/debug';
import { attachGallery } from './render/gallery';
import { loadBatch, parseBatchParam } from './render/batchGallery';
import { school } from './themes/school';
import { createStage } from './render/stage';
import { createThumbnailer } from './render/thumbnails';
import { captureCanvas, createBrowserShareEnv, deliverImage, screenshotFilename } from './render/screenshot';
import { createThemeSelect } from './ui/themeSelect';
import { createHud, type ItemCard } from './ui/hud';
import { createSettingsPanel } from './ui/settings';
import { button, el } from './ui/dom';
import { confirmDialog } from './ui/dialogs';
import { createEndScreen } from './ui/endScreen';
import { showNotice } from './ui/notices';
import { sizeLabel, T } from './ui/strings';

const BACKDROP: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };

function hasWebGL2(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // release the probe: contexts are limited
    return true;
  } catch {
    return false;
  }
}

function showFatal(app: HTMLElement): void {
  const p = document.createElement('p');
  p.className = 'no-webgl';
  p.setAttribute('role', 'alert');
  p.textContent = T.noWebGL;
  app.replaceChildren(p);
}

function detectQuality(): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return detectTier({
    userAgent: nav.userAgent,
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: nav.maxTouchPoints,
  });
}

function boot(app: HTMLElement): void {
  const realStore = browserStore(() => window.localStorage);
  // `?demo=full`: a full School map for measuring, played in memory; the player's save is left alone.
  const demo = parseDemoParam(location.search);
  const schoolCatalog = getCatalog(school.id);
  const store = demo && schoolCatalog ? demoStore(realStore, schoolCatalog, demo.seed) : realStore;
  const controller = createController({ store, getTheme, getCatalog, seed: randomSeed, detectQuality, isFloorTile: () => false });
  let tier = controller.getState().quality;
  let appliedKey = '';

  const kit = getStyleKit();
  const stage = createStage(app, tier);
  const ground = createGround(stage);
  const environment = createEnvironment(stage, kit);
  const cityView = createCityView(stage, kit, getTheme);
  let dialogOpen = false;
  // Mouse hover preview: the faint item under the cursor (never changes controller state).
  let hoverTile: { tx: number; tz: number } | null = null;
  const blocked = (): boolean => dialogOpen || settings.isOpen() || endScreen.isVisible();
  const refreshHover = (): void => {
    const s = controller.getState();
    const catalog = s.game ? getCatalog(s.game.themeId) : undefined;
    if (!hoverTile || !s.game || !catalog || s.screen !== 'playing' || blocked()) { cityView.setHover(null); return; }
    const p = placementAtTile(s.game, catalog, s.ghost?.rotation ?? s.rotation, hoverTile.tx, hoverTile.tz);
    const g = s.ghost;
    if (g && g.x === p.x && g.z === p.z && g.rotation === p.rotation) { cityView.setHover(null); return; }
    cityView.setHover({ themeId: s.game.themeId, itemId: s.game.current, p });
  };
  attachInput(stage, controller, {
    onHover: (tile) => { hoverTile = tile; refreshHover(); },
    ghostBox: () => cityView.ghostBox(),
    // settings, a confirm dialog or the end screen own the keyboard: nothing reaches the game behind them
    isBlocked: blocked,
  });
  const thumbnailer = createThumbnailer(kit);
  const fpsMonitor = new FpsMonitor();
  attachFpsOverlay(stage, () => tier, () => cityView.lastBuildMs());

  // Scene: re-applied when settings or tier change (rain counts are per tier).
  const applyScene = (s: AppState): void => {
    const settings = s.game?.settings ?? BACKDROP;
    if (s.quality !== tier) {
      tier = s.quality;
      stage.setQuality(tier);
      fpsMonitor.reset();
      appliedKey = ''; // force environment.apply below
    }
    const key = `${tier}|${settings.weather}|${settings.time}|${settings.ground}`;
    if (key === appliedKey) return;
    appliedKey = key;
    environment.apply(settings, tier);
    ground.setGround(settings.ground, settings.weather === 'rain');
  };

  // Screens
  const themeSelect = createThemeSelect(app, THEMES, (id) => {
    fpsMonitor.reset();
    controller.chooseTheme(id);
  });

  const askAndRun = async (message: string, confirmLabel: string, action: () => void): Promise<void> => {
    settings.close(); // both listen for Escape on document: never stack them
    dialogOpen = true;
    refreshHover();
    let ok = false;
    try {
      ok = await confirmDialog(app, { message, confirmLabel });
    } finally {
      dialogOpen = false;
      refreshHover();
    }
    if (ok) action();
  };
  const restart = () => askAndRun(T.confirmRestart, T.confirmRestartOk, () => {
    fpsMonitor.reset();
    controller.restart();
  });
  const clear = () => askAndRun(T.confirmClear, T.confirmClearOk, () => controller.clearAll());

  const shareEnv = createBrowserShareEnv();
  const screenshot = async (): Promise<void> => {
    const themeId = controller.getState().game?.themeId;
    if (!themeId) return;
    try {
      // The ghost and its ✓/✗ marker are an aid, not part of the city: leave them out of the picture.
      cityView.setGhostVisible(false);
      let blob: Blob;
      try {
        blob = await captureCanvas(stage);
      } finally {
        cityView.setGhostVisible(true);
      }
      const result = await deliverImage(blob, screenshotFilename(themeId, new Date()), shareEnv);
      if (result === 'downloaded') showNotice(app, T.noticeShotSaved);
    } catch {
      // the screenshot is a nicety: never break the game over it
    }
  };

  const openSettings = () => {
    const s = controller.getState();
    settings.open({ settings: s.game?.settings ?? BACKDROP, quality: s.quality });
    refreshHover();
  };
  const settings = createSettingsPanel(app, {
    onWeather: (weather) => { controller.setSettings({ weather }); openSettings(); },
    onTime: (time) => { controller.setSettings({ time }); openSettings(); },
    onGround: (ground) => { controller.setSettings({ ground }); openSettings(); },
    onQuality: (q) => { controller.setQuality(q, 'user'); openSettings(); },
    onRestart: () => void restart(),
    onClear: () => void clear(),
  });

  let viewing = false; // player chose "ดูเมือง": keep the end dialog hidden until the next round
  const endScreen = createEndScreen(app, {
    onScreenshot: () => void screenshot(),
    onRestart: () => void restart(),
    onView: () => { viewing = true; endScreen.hide(); },
  });

  const hud = createHud(app, {
    onRotate: () => controller.rotateGhost(),
    onPlace: () => { controller.place(); },
    onSettings: openSettings,
    onScreenshot: () => void screenshot(),
    onRestart: () => void restart(),
  });

  const card = (itemId: string, themeId: string): ItemCard | null => {
    const item = getTheme(themeId)?.items.find((i) => i.id === itemId);
    if (!item) return null;
    return { name: item.name, size: sizeLabel(item.footprint), thumb: thumbnailer.get(item) || null };
  };

  let saveNoticeShown = false;
  const render = (s: AppState): void => {
    applyScene(s);
    cityView.sync(s);
    refreshHover();

    if (s.screen === 'theme-select') themeSelect.show(); else themeSelect.hide();

    const game = s.game;
    const playing = s.screen === 'playing' && game !== null;
    hud.update({
      visible: s.screen !== 'theme-select',
      current: playing ? card(game.current, game.themeId) : null,
      next: playing ? card(game.next, game.themeId) : null,
      placed: game?.placements.length ?? 0,
      canPlace: s.ghost?.valid === true,
      canRotate: playing,
      hint: playing && s.ghost === null ? T.hintTap : null,
      finished: s.screen === 'finished',
    });

    if (s.screen !== 'finished') viewing = false;
    const catalog = game ? getCatalog(game.themeId) : undefined;
    if (s.screen === 'finished' && game && catalog && !viewing) endScreen.show(fillStats(game.placements, catalog));
    else endScreen.hide();

    if (s.saveFailed && !saveNoticeShown) {
      saveNoticeShown = true;
      showNotice(app, T.noticeSaveFailed, 8000);
    }
  };
  controller.subscribe(render);
  render(controller.getState());

  stage.onFrame((_dtMs, nowMs) => {
    if (fpsMonitor.sample(nowMs) === 'drop' && tier === 'pretty') {
      controller.setQuality('smooth', 'auto');
      showNotice(app, T.noticeQualityDrop);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fpsMonitor.reset();
  });

  // Dev-only console hook: __scene.controller.setSettings({ weather: 'rain' })
  if (import.meta.env.DEV) Object.assign(window, { __scene: { stage, kit, controller } });
}

/**
 * `?gallery=<themeId>`: a review page with every item of the theme laid out on the map. No game:
 * nothing is loaded or saved; the settings panel only switches the lighting, ground and tier.
 * An unknown theme id starts the normal game.
 */
function bootGallery(app: HTMLElement, theme: ThemeDef, devNote?: string): void {
  let quality: QualityTier = loadQuality(browserStore(() => window.localStorage)) ?? detectQuality();
  let scene: SceneSettings = { weather: 'sunny', time: 'day', ground: theme.defaultGround };
  const kit = getStyleKit();
  const stage = createStage(app, quality);
  const ground = createGround(stage);
  const environment = createEnvironment(stage, kit);
  attachFpsOverlay(stage, () => quality);
  attachGallery(stage, kit, theme, { itemId: new URLSearchParams(location.search).get('item') });

  const apply = (): void => {
    environment.apply(scene, quality);
    ground.setGround(scene.ground, scene.weather === 'rain');
  };
  const openSettings = (): void => settings.open({ settings: scene, quality });
  const change = (patch: Partial<SceneSettings>): void => {
    scene = { ...scene, ...patch };
    apply();
    openSettings();
  };
  const settings = createSettingsPanel(app, {
    onWeather: (weather) => change({ weather }),
    onTime: (time) => change({ time }),
    onGround: (g) => change({ ground: g }),
    onQuality: (q) => {
      quality = q;
      stage.setQuality(q);
      change({});
    },
  });
  app.appendChild(el('div', { class: 'gallery-tools' }, [button(T.settings, openSettings)]));
  if (devNote) document.body.append(el('p', { class: 'gallery-dev-note', text: devNote }));
  apply();
}

/** DEV only, `?gallery=batch-<n>`: the School theme reduced to one sculptor batch (module loaded lazily). */
function bootBatchGallery(app: HTMLElement, n: number): void {
  loadBatch(n)
    .then((items) => bootGallery(app, { ...school, name: `โรงเรียน · batch ${n}`, items },
      items.length === 0 ? `batch ${n} is empty: add items to src/themes/school/batches/b${n}.ts` : undefined))
    .catch((e: unknown) => {
      // Covers a failed load and an error thrown while booting the gallery (e.g. an item's build throwing).
      console.error(`batch ${n} failed`, e);
      app.append(el('p', { class: 'gallery-dev-note', text: `batch ${n} failed: ${e instanceof Error ? e.message : String(e)}` }));
    });
}

const app = document.getElementById('app');
if (app) {
  try {
    const galleryTheme = new URLSearchParams(location.search).get('gallery');
    const gallery = galleryTheme === null ? undefined : getTheme(galleryTheme);
    const batch = import.meta.env.DEV ? parseBatchParam(galleryTheme) : null;
    if (!hasWebGL2()) showFatal(app);
    else if (batch !== null) bootBatchGallery(app, batch);
    else if (gallery) bootGallery(app, gallery);
    else boot(app);
  } catch (e) {
    console.error('boot failed', e);
    showFatal(app); // never leave a blank page
  }
  // public/boot-check.js shows the same message if this flag is still unset a few seconds after the
  // page has loaded; if it is already showing (an extremely slow load), take it away.
  (window as unknown as { __cityBooted?: boolean }).__cityBooted = true;
  document.getElementById('boot-fallback')?.remove();
}
