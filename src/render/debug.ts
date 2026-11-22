import type { QualityTier } from '../game/types';
import { T } from '../ui/strings';
import type { Stage } from './stage';

const UPDATE_MS = 500;

/** `?fps=1` overlay for testing a real device: average fps and tier, refreshed about twice a second. */
export function attachFpsOverlay(stage: Stage, getTier: () => QualityTier): void {
  if (new URLSearchParams(location.search).get('fps') !== '1') return;
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed', top: '8px', right: '8px', zIndex: '1000', pointerEvents: 'none',
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
    const fps = Math.round((frames * 1000) / elapsed);
    box.textContent = `${fps} fps · ${T.quality[getTier()]}`;
    frames = 0;
    elapsed = 0;
  });
}
