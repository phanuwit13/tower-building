import type { SeenHints } from '../app/hints';
import { TURN_STEP, ZOOM_STEP, type Stage } from '../render/stage';
import { el } from './dom';
import { T } from './strings';

/**
 * A camera move past this many radians (azimuth or tilt) from where the page started counts as the
 * child having turned the camera; a tap's few pixels of orbit stay well under it.
 */
export const TURNED_RAD = 0.15;
/** The slider runs 0..SLIDER_MAX: one step is 1 % of the zoom range. */
const SLIDER_MAX = 100;

export interface CameraControlsView {
  /** With the HUD (playing or a finished city), but not on theme select or while the floor drawer is open. */
  visible: boolean;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Line icons on a 24 px grid in the button's text colour: no font has to carry ⟲ ⟳ ＋ －. */
const ICONS = {
  zoomIn: ['M12 5v14', 'M5 12h14'],
  zoomOut: ['M5 12h14'],
  turnLeft: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  turnRight: ['M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8', 'M21 3v5h-5'],
} as const;

function icon(paths: readonly string[]): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of paths) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  }
  return svg;
}

/** An icon button named for screen readers; the hover tooltip adds its key. */
function iconButton(name: string, key: string, paths: readonly string[], cls: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', { class: `cam-btn ${cls}`, attrs: { type: 'button', 'aria-label': name, title: `${name} (${key})` }, onClick });
  b.appendChild(icon(paths));
  return b;
}

/**
 * The camera controls on the right edge, above หมุน/วาง: ＋, a vertical zoom slider and － (the
 * slider follows the wheel and pinch), then ⟲ ⟳ to turn the view 45 degrees. On a first visit the
 * turn buttons pulse with "ลากเพื่อหมุนมุมกล้อง" beside them, until the camera is turned once (a drag,
 * the buttons or Q/E) — then never again in this browser.
 */
export function createCameraControls(
  root: HTMLElement, stage: Pick<Stage, 'controls' | 'rig'>, seen: SeenHints,
): { update(v: CameraControlsView): void } {
  const { controls, rig } = stage;
  const slider = el('input', {
    class: 'cam-slider',
    attrs: { type: 'range', min: '0', max: String(SLIDER_MAX), step: '1', 'aria-label': T.camera.zoom, 'aria-orientation': 'vertical' },
  });
  slider.addEventListener('input', () => rig.setZoom(Number(slider.value) / SLIDER_MAX));
  const zoom = el('div', { class: 'cam-zoom' }, [
    iconButton(T.camera.zoomIn, '+', ICONS.zoomIn, 'cam-zoom-in', () => rig.zoomBy(ZOOM_STEP)),
    // A horizontal range turned upright: unlike `writing-mode`, this works on every browser the game supports.
    el('div', { class: 'cam-slider-box' }, [slider]),
    iconButton(T.camera.zoomOut, '-', ICONS.zoomOut, 'cam-zoom-out', () => rig.zoomBy(-ZOOM_STEP)),
  ]);
  const left = iconButton(T.camera.turnLeft, 'Q', ICONS.turnLeft, 'cam-turn-left', () => rig.turn(-TURN_STEP));
  const right = iconButton(T.camera.turnRight, 'E', ICONS.turnRight, 'cam-turn-right', () => rig.turn(TURN_STEP));
  const hint = el('div', { class: 'cam-hint', text: T.camera.dragHint });
  const box = el('div', { class: 'cam-controls' }, [zoom, el('div', { class: 'cam-turn' }, [hint, left, right])]);
  box.hidden = true;
  root.appendChild(box);

  const start = { azimuth: controls.getAzimuthalAngle(), polar: controls.getPolarAngle() };
  let turned = seen.has('turned');
  const showHint = (): void => {
    hint.hidden = turned;
    left.classList.toggle('pulse', !turned);
    right.classList.toggle('pulse', !turned);
  };

  /**
   * The camera moved (a drag, the wheel, a pinch, a glide): the slider and the hint follow. The box
   * also carries the azimuth (degrees) and distance as data attributes: what the e2e checks read.
   */
  const sync = (): void => {
    const value = String(Math.round(rig.zoom() * SLIDER_MAX));
    if (slider.value !== value) slider.value = value;
    const azimuth = controls.getAzimuthalAngle();
    const az = ((azimuth * 180) / Math.PI).toFixed(1);
    const dist = controls.getDistance().toFixed(2);
    if (box.dataset.azimuth !== az) box.dataset.azimuth = az;
    if (box.dataset.distance !== dist) box.dataset.distance = dist;
    if (turned) return;
    const d = azimuth - start.azimuth;
    if (Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) > TURNED_RAD || Math.abs(controls.getPolarAngle() - start.polar) > TURNED_RAD) {
      turned = true;
      seen.mark('turned');
      showHint();
    }
  };
  controls.addEventListener('change', sync);
  sync();
  showHint();

  return {
    update(v) {
      box.hidden = !v.visible;
    },
  };
}
