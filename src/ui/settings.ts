import {
  GROUND_IDS, QUALITY_TIERS, TIME_IDS, WEATHER_IDS,
  type GroundId, type QualityTier, type SceneSettings, type TimeId, type WeatherId,
} from '../game/types';
import { button, el } from './dom';
import { T } from './strings';

export interface SettingsHandlers {
  onWeather(w: WeatherId): void; onTime(t: TimeId): void; onGround(g: GroundId): void;
  onQuality(q: QualityTier): void; onRestart(): void; onClear(): void;
}

function group<V extends string>(title: string, ids: readonly V[], labels: Record<V, string>, pick: (v: V) => void) {
  const chips = new Map<V, HTMLButtonElement>();
  for (const id of ids) {
    const b = button(labels[id], () => pick(id), 'chip');
    chips.set(id, b);
  }
  const box = el('div', { class: 'settings-group', attrs: { role: 'group', 'aria-label': title } }, [
    el('h3', { text: title }),
    el('div', { class: 'chips' }, [...chips.values()]),
  ]);
  return {
    box,
    mark(cur: V) {
      for (const [id, b] of chips) {
        b.setAttribute('aria-pressed', String(id === cur));
        b.classList.toggle('selected', id === cur);
      }
    },
  };
}

export function createSettingsPanel(
  root: HTMLElement,
  h: SettingsHandlers,
): { open(cur: { settings: SceneSettings; quality: QualityTier }): void; close(): void } {
  const weather = group(T.weather.title, WEATHER_IDS, T.weather, h.onWeather);
  const time = group(T.time.title, TIME_IDS, T.time, h.onTime);
  const ground = group(T.ground.title, GROUND_IDS, T.ground, h.onGround);
  const quality = group(T.quality.title, QUALITY_TIERS, T.quality, h.onQuality);
  const panel = el('div', { class: 'settings-sheet', attrs: { role: 'dialog', 'aria-label': T.settings } }, [
    el('div', { class: 'settings-head' }, [
      el('h2', { text: T.settings }),
      button(T.close, () => close(), 'btn-close'),
    ]),
    weather.box, time.box, ground.box, quality.box,
    el('div', { class: 'settings-danger' }, [button(T.restart, h.onRestart), button(T.clear, h.onClear)]),
  ]);
  const wrap = el('div', { class: 'settings screen' }, [panel]);
  wrap.hidden = true;
  wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  root.appendChild(wrap);
  function close(): void { wrap.hidden = true; }
  return {
    open(cur) {
      weather.mark(cur.settings.weather);
      time.mark(cur.settings.time);
      ground.mark(cur.settings.ground);
      quality.mark(cur.quality);
      wrap.hidden = false;
    },
    close,
  };
}
