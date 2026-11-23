import {
  GROUND_IDS, QUALITY_TIERS, TIME_IDS,
  type GroundId, type QualityTier, type SceneSettings, type TimeId, type WeatherId,
} from '../game/types';
import { button, el } from './dom';
import { focusForKeyboard, focusReturn, trapTab } from './focus';
import { ICONS, lineIcon } from './icons';
import { T } from './strings';

export interface ToolbarView { settings: SceneSettings; quality: QualityTier }
export interface ToolbarHandlers {
  onTime(t: TimeId): void; onWeather(w: WeatherId): void; onGround(g: GroundId): void; onQuality(q: QualityTier): void;
  /** Game actions: left out (no button) when the handler is, so the gallery shows only the scene switches. */
  onScreenshot?(): void; onShortcuts?(): void; onRestart?(): void; onClear?(): void;
  /** A popover opened or closed (the page lets the keyboard through only while none is open). */
  onOpenChange?(open: boolean): void;
}

/** The time icon shows the current time of day. */
export const TIME_ICON: Record<TimeId, readonly string[]> = { dawn: ICONS.sunrise, day: ICONS.sun, dusk: ICONS.sunset, night: ICONS.moon };
export const QUALITY_ICON: Record<QualityTier, readonly string[]> = { pretty: ICONS.sparkles, smooth: ICONS.zap };
const GROUND_COLOUR: Record<GroundId, string> = {
  grass: '#7bc96f', dirt: '#a0724a', concrete: '#9aa0a6', sand: '#e6d08a', snow: '#f4f8fb', wood: '#b98a54', moon: '#b8b8c4',
};
/** How long a finger holds a button before its label shows (the press then does nothing else). */
export const LONG_PRESS_MS = 450;

/** Pure: dawn → day → dusk → night → dawn. */
export const nextTime = (t: TimeId): TimeId => TIME_IDS[(TIME_IDS.indexOf(t) + 1) % TIME_IDS.length];
export const nextQuality = (q: QualityTier): QualityTier => QUALITY_TIERS[(QUALITY_TIERS.indexOf(q) + 1) % QUALITY_TIERS.length];

interface Tool { btn: HTMLButtonElement; icon: HTMLElement; label: HTMLElement }

/** An icon button: the line icon is decoration; the Thai name is the aria-label and the title, and shows as a small label on hover, focus and long-press. */
function tool(cls: string, onClick: () => void): Tool {
  const icon = el('span', { class: 'tb-icon', attrs: { 'aria-hidden': 'true' } });
  const label = el('span', { class: 'tb-label', attrs: { 'aria-hidden': 'true' } });
  const btn = el('button', { class: `tb-btn ${cls}`, attrs: { type: 'button' }, onClick }, [icon, label]);
  return { btn, icon, label };
}
function setIcon(t: Tool, paths: readonly string[]): void {
  t.icon.replaceChildren(lineIcon(paths));
}
function name(t: Tool, text: string): void {
  if (t.btn.getAttribute('aria-label') === text) return;
  t.btn.setAttribute('aria-label', text);
  t.btn.title = text;
  t.label.textContent = text;
}

/**
 * The icon toolbar: time (cycles), rain (toggle), ground colour (swatch popover), quality (toggle), then
 * the game's own 📷 ⌨️ ⋯ (⋯ holds เริ่มใหม่ and เคลียร์). One popover is open at a time; it closes on
 * Esc and on a tap outside, and while it is open the page's keys rest (`isOpen`). On a touch screen a
 * long press shows a button's label and does not run its action.
 */
export function createToolbar(root: HTMLElement, h: ToolbarHandlers): {
  update(v: ToolbarView): void; setVisible(v: boolean): void; closePopovers(): void; isOpen(): boolean;
} {
  let drawn = false;
  let view: ToolbarView = { settings: { weather: 'sunny', time: 'day', ground: 'grass' }, quality: 'pretty' };
  const time = tool('tb-time', () => h.onTime(nextTime(view.settings.time)));
  const rain = tool('tb-rain', () => h.onWeather(view.settings.weather === 'rain' ? 'sunny' : 'rain'));
  const ground = tool('tb-ground', () => toggle('ground', ground.btn));
  const quality = tool('tb-quality', () => h.onQuality(nextQuality(view.quality)));
  setIcon(rain, ICONS.rain);
  setIcon(ground, ICONS.groundFill);
  name(rain, T.weather.rain);
  name(ground, T.ground.title);
  ground.btn.setAttribute('aria-haspopup', 'true');

  const swatches = new Map<GroundId, HTMLButtonElement>();
  for (const id of GROUND_IDS) {
    const dot = el('span', { class: 'tb-dot', attrs: { 'aria-hidden': 'true' } });
    dot.style.background = GROUND_COLOUR[id];
    const b = el('button', { class: 'tb-swatch', attrs: { type: 'button' }, onClick: () => h.onGround(id) }, [dot, el('span', { text: T.ground[id] })]);
    swatches.set(id, b);
  }
  const groundPop = el('div', { class: 'tb-pop tb-pop-ground', attrs: { role: 'group', 'aria-label': T.ground.title } }, [
    el('div', { class: 'tb-pop-title', text: T.ground.title }),
    el('div', { class: 'tb-swatches' }, [...swatches.values()]),
  ]);

  const more = h.onRestart || h.onClear ? tool('tb-more', () => toggle('more', more!.btn)) : null;
  const items = [h.onRestart ? button(T.restart, () => { closePopovers(); h.onRestart!(); }, 'tb-item tb-restart') : null,
    h.onClear ? button(T.clear, () => { closePopovers(); h.onClear!(); }, 'tb-item tb-clear') : null];
  const morePop = more ? el('div', { class: 'tb-pop tb-pop-more', attrs: { role: 'group', 'aria-label': T.toolbar.more } }, items) : null;
  if (more) { setIcon(more, ICONS.more); name(more, T.toolbar.more); more.btn.setAttribute('aria-haspopup', 'true'); }

  const shot = h.onScreenshot ? tool('tb-shot', h.onScreenshot) : null;
  if (shot) { setIcon(shot, ICONS.camera); name(shot, T.screenshot); }
  const keys = h.onShortcuts ? tool('tb-keys', () => { closePopovers(); h.onShortcuts!(); }) : null;
  if (keys) { setIcon(keys, ICONS.keyboard); name(keys, T.toolbar.shortcuts); }

  const tools = [time, rain, ground, quality, shot, keys, more].filter((t): t is Tool => t !== null);
  const row = el('div', { class: 'tb-row' }, tools.map((t) => t.btn));
  const bar = el('div', { class: 'toolbar', attrs: { role: 'toolbar', 'aria-label': T.toolbar.name } }, [row, groundPop, morePop]);
  groundPop.hidden = true;
  if (morePop) morePop.hidden = true;
  root.appendChild(bar);

  // --- popovers
  let open: { id: 'ground' | 'more'; restore: () => void } | null = null;
  const pops = { ground: groundPop, more: morePop };
  function closePopovers(restoreFocus = false): void {
    if (!open) return;
    const { restore } = open;
    open = null;
    groundPop.hidden = true;
    if (morePop) morePop.hidden = true;
    for (const t of tools) t.btn.removeAttribute('aria-expanded');
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', onOutside);
    if (restoreFocus) restore();
    h.onOpenChange?.(false);
  }
  function toggle(id: 'ground' | 'more', opener: HTMLButtonElement): void {
    if (open?.id === id) { closePopovers(true); return; }
    const was = open !== null;
    if (was) closePopovers();
    open = { id, restore: focusReturn(opener) };
    pops[id]!.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    // A keyboard user lands inside the popover; a mouse or finger keeps the focus on the page.
    focusForKeyboard(pops[id]!.querySelector('button'));
    h.onOpenChange?.(true);
  }
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') { e.preventDefault(); closePopovers(true); return; }
    if (open) trapTab(e, pops[open.id]!);
  };
  // Bubbling phase: the map has already ignored this press (the popover still counted as open), so a tap outside only closes.
  const onOutside = (e: PointerEvent): void => {
    if (!bar.contains(e.target as Node)) closePopovers();
  };

  // --- long press: a finger holding a button shows its label, and the click that follows is swallowed
  let held: { btn: HTMLElement; timer: number } | null = null;
  let swallow = false;
  let down = false; // a finger is on the bar
  const clearHeld = (): void => {
    if (!held) return;
    clearTimeout(held.timer);
    const b = held.btn;
    held = null;
    if (b.classList.contains('show-label')) setTimeout(() => b.classList.remove('show-label'), 1200);
  };
  bar.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const btn = (e.target as Element).closest<HTMLElement>('.tb-btn');
    if (!btn) return;
    clearHeld();
    swallow = false;
    down = true;
    held = { btn, timer: window.setTimeout(() => { btn.classList.add('show-label'); swallow = true; }, LONG_PRESS_MS) };
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave'] as const) bar.addEventListener(type, clearHeld);
  bar.addEventListener('pointerup', () => { down = false; });
  // The finger was taken away (cancel) or slid off the bar before lifting: no click follows, so never swallow a later one.
  for (const type of ['pointercancel', 'pointerleave'] as const) bar.addEventListener(type, () => { if (down) swallow = false; down = false; });
  bar.addEventListener('click', (e) => {
    if (!swallow) return;
    swallow = false;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  bar.addEventListener('contextmenu', (e) => e.preventDefault()); // a long press must not open the browser's menu

  return {
    update(v) {
      // Runs on every state change (a ghost drag too): write the DOM only when something shown changed.
      const same = view.settings.time === v.settings.time && view.settings.weather === v.settings.weather
        && view.settings.ground === v.settings.ground && view.quality === v.quality && drawn;
      view = v;
      if (same) return;
      drawn = true;
      const { settings, quality: q } = v;
      setIcon(time, TIME_ICON[settings.time]);
      name(time, `${T.time.title}: ${T.time[settings.time]}`);
      rain.btn.setAttribute('aria-pressed', String(settings.weather === 'rain'));
      rain.btn.classList.toggle('on', settings.weather === 'rain');
      setIcon(quality, QUALITY_ICON[q]);
      name(quality, `${T.quality.title}: ${T.quality[q]}`);
      for (const [id, b] of swatches) {
        b.setAttribute('aria-pressed', String(id === settings.ground));
        b.classList.toggle('selected', id === settings.ground);
      }
    },
    setVisible(v) {
      bar.hidden = !v;
      if (!v) closePopovers();
    },
    closePopovers: () => closePopovers(),
    isOpen: () => open !== null,
  };
}
