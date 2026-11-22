import '@fontsource/mitr/400.css';
import '@fontsource/mitr/600.css';
import './styles.css';
import type { QualityTier, SceneSettings } from './game/types';
import { getStyleKit } from './models/kit';
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

  // Dev-only console hook: __scene.show({ weather: 'rain', time: 'night', ground: 'snow' }, 'smooth')
  if (import.meta.env.DEV) Object.assign(window, { __scene: { show, stage, kit } });
}
