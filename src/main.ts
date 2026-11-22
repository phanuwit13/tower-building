import '@fontsource/mitr/400.css';
import '@fontsource/mitr/600.css';
import './styles.css';
import type { QualityTier, SceneSettings } from './game/types';
import { getStyleKit } from './models/kit';
import { createController, type AppState } from './app/controller';
import { detectTier, FpsMonitor } from './app/quality';
import { randomSeed } from './game/rng';
import { fillStats } from './game/grid';
import type { KeyValueStore } from './game/save';
import { getCatalog, getTheme, THEMES } from './themes/registry';
import { createCityView } from './render/city';
import { attachInput } from './render/input';
import { createEnvironment } from './render/environment';
import { createGround } from './render/ground';
import { attachFpsOverlay } from './render/debug';
import { createStage } from './render/stage';
import { createThumbnailer } from './render/thumbnails';
import { captureCanvas, createBrowserShareEnv, deliverImage, screenshotFilename } from './render/screenshot';
import { createThemeSelect } from './ui/themeSelect';
import { createHud, type ItemCard } from './ui/hud';
import { createSettingsPanel } from './ui/settings';
import { confirmDialog } from './ui/dialogs';
import { createEndScreen } from './ui/endScreen';
import { showNotice } from './ui/notices';
import { sizeLabel, T } from './ui/strings';

const BACKDROP: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };

function hasWebGL2(): boolean {
  try {
    return document.createElement('canvas').getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

/** Accessing `localStorage` itself can throw (Safari with storage blocked): then saving fails visibly. */
function browserStore(): KeyValueStore {
  try {
    const ls = window.localStorage;
    return {
      getItem: (k) => ls.getItem(k),
      setItem: (k, v) => ls.setItem(k, v),
      removeItem: (k) => ls.removeItem(k),
    };
  } catch {
    return {
      getItem: () => null,
      setItem: () => { throw new Error('storage unavailable'); },
      removeItem: () => { throw new Error('storage unavailable'); },
    };
  }
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
  if (!hasWebGL2()) {
    const p = document.createElement('p');
    p.className = 'no-webgl';
    p.textContent = T.noWebGL;
    app.appendChild(p);
    return;
  }

  const controller = createController({
    store: browserStore(), getTheme, getCatalog, seed: randomSeed, detectQuality,
  });
  let tier = controller.getState().quality;
  let appliedKey = '';

  const kit = getStyleKit();
  const stage = createStage(app, tier);
  const ground = createGround(stage);
  const environment = createEnvironment(stage, kit);
  const cityView = createCityView(stage, kit, getTheme);
  attachInput(stage, controller);
  const thumbnailer = createThumbnailer(kit);
  const fpsMonitor = new FpsMonitor();
  attachFpsOverlay(stage, () => tier);

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
    if (await confirmDialog(app, { message, confirmLabel })) action();
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
      const blob = await captureCanvas(stage);
      const result = await deliverImage(blob, screenshotFilename(themeId, new Date()), shareEnv);
      if (result === 'downloaded') showNotice(app, T.noticeShotSaved);
    } catch {
      // the screenshot is a nicety: never break the game over it
    }
  };

  const openSettings = () => {
    const s = controller.getState();
    settings.open({ settings: s.game?.settings ?? BACKDROP, quality: s.quality });
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

    if (s.screen === 'theme-select') themeSelect.show(); else themeSelect.hide();

    const game = s.game;
    const playing = s.screen === 'playing' && game !== null;
    hud.update({
      visible: s.screen !== 'theme-select',
      current: playing ? card(game.current, game.themeId) : null,
      next: playing ? card(game.next, game.themeId) : null,
      placed: game?.placements.length ?? 0,
      canPlace: s.ghost?.valid === true,
      canRotate: s.ghost !== null,
      hint: playing && s.ghost === null ? T.hintTap : null,
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

const app = document.getElementById('app');
if (app) boot(app);
