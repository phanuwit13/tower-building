import '@fontsource/mitr/400.css';
import '@fontsource/mitr/600.css';
import './styles.css';
import type { QualityTier, SceneSettings } from './game/types';
import { getStyleKit } from './models/kit';
import { createController } from './app/controller';
import { randomSeed } from './game/rng';
import type { KeyValueStore } from './game/save';
import { getCatalog, getTheme } from './themes/registry';
import { createCityView } from './render/city';
import { attachInput } from './render/input';
import { createEnvironment } from './render/environment';
import { createGround } from './render/ground';
import { createStage } from './render/stage';

const app = document.getElementById('app');
if (app) {
  const settings: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };
  const quality: QualityTier = 'pretty';
  const kit = getStyleKit();
  const stage = createStage(app, quality);
  const ground = createGround(stage);
  const environment = createEnvironment(stage, kit);

  const show = (s: SceneSettings, q: QualityTier) => {
    stage.setQuality(q);
    environment.apply(s, q);
    ground.setGround(s.ground, s.weather === 'rain');
  };
  show(settings, quality);

  // Temporary wiring until Task 13: localStorage-backed store, auto-pick the school theme.
  const store: KeyValueStore = {
    getItem(k) { try { return localStorage.getItem(k); } catch { return null; } },
    setItem(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
    removeItem(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
  };
  const controller = createController({
    store, getTheme, getCatalog, seed: randomSeed, detectQuality: () => 'pretty',
  });
  const cityView = createCityView(stage, kit, getTheme);
  controller.subscribe(cityView.sync);
  attachInput(stage, controller);
  if (controller.getState().screen === 'theme-select') controller.chooseTheme('school');
  else cityView.sync(controller.getState());

  // Dev-only console hook: __scene.show({ weather: 'rain', time: 'night', ground: 'snow' }, 'smooth')
  if (import.meta.env.DEV) Object.assign(window, { __scene: { show, stage, kit, controller } });
}
