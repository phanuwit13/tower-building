// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SceneSettings } from '../game/types';
import { T } from './strings';
import { createToolbar, LONG_PRESS_MS, nextTime, TIME_ICON, type ToolbarHandlers } from './toolbar';

const scene: SceneSettings = { weather: 'sunny', time: 'day', ground: 'grass' };
const handlers = (): Required<ToolbarHandlers> => ({
  onTime: vi.fn(), onWeather: vi.fn(), onGround: vi.fn(), onQuality: vi.fn(), onScreenshot: vi.fn(),
  onShortcuts: vi.fn(), onRestart: vi.fn(), onClear: vi.fn(), onOpenChange: vi.fn(),
});
const setup = (h: ToolbarHandlers = handlers()) => {
  const root = document.body.appendChild(document.createElement('div'));
  const tb = createToolbar(root, h);
  tb.update({ settings: scene, quality: 'pretty' });
  const byName = (n: string | RegExp) =>
    [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) => (typeof n === 'string' ? b.getAttribute('aria-label') === n || b.textContent === n : n.test(b.getAttribute('aria-label') ?? ''))) as HTMLButtonElement;
  return { root, tb, h, byName };
};
const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('toolbar', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });

  it('time cycles dawn → day → dusk → night → dawn and its icon is the current time', () => {
    expect(['dawn', 'day', 'dusk', 'night'].map((t) => nextTime(t as never))).toEqual(['day', 'dusk', 'night', 'dawn']);
    const { tb, h, byName, root } = setup();
    byName(/^ช่วงเวลา/).click();
    expect(h.onTime).toHaveBeenCalledWith('dusk');
    tb.update({ settings: { ...scene, time: 'night' }, quality: 'pretty' });
    expect(root.querySelector('.tb-time .tb-icon')!.textContent).toBe(TIME_ICON.night);
    expect(byName(/^ช่วงเวลา/).getAttribute('aria-label')).toBe(`${T.time.title}: ${T.time.night}`);
    byName(/^ช่วงเวลา/).click();
    expect(h.onTime).toHaveBeenLastCalledWith('dawn');
  });

  it('every icon button has a Thai aria-label, a title and a label', () => {
    const { root } = setup();
    const btns = root.querySelectorAll<HTMLButtonElement>('.tb-btn');
    expect(btns).toHaveLength(7);
    for (const b of btns) {
      expect(b.getAttribute('aria-label')).toMatch(/[ก-๙]/);
      expect(b.title).toBe(b.getAttribute('aria-label'));
      expect(b.querySelector('.tb-label')!.textContent).toBe(b.title);
    }
  });

  it('rain is a toggle', () => {
    const { tb, h, byName } = setup();
    const rain = byName(T.weather.rain);
    expect(rain.getAttribute('aria-pressed')).toBe('false');
    rain.click();
    expect(h.onWeather).toHaveBeenCalledWith('rain');
    tb.update({ settings: { ...scene, weather: 'rain' }, quality: 'pretty' });
    expect(rain.getAttribute('aria-pressed')).toBe('true');
    rain.click();
    expect(h.onWeather).toHaveBeenLastCalledWith('sunny');
  });

  it('quality toggles สวย/ลื่น and its name carries the current one', () => {
    const { tb, h, byName } = setup();
    byName(/^คุณภาพภาพ/).click();
    expect(h.onQuality).toHaveBeenCalledWith('smooth');
    tb.update({ settings: scene, quality: 'smooth' }); // e.g. the auto-downgrade
    expect(byName(/^คุณภาพภาพ/).getAttribute('aria-label')).toBe(`${T.quality.title}: ${T.quality.smooth}`);
    byName(/^คุณภาพภาพ/).click();
    expect(h.onQuality).toHaveBeenLastCalledWith('pretty');
  });

  it('ground opens a popover labelled สีพื้นทั้งแผนที่ with a swatch per ground; Esc and an outside tap close it', () => {
    const { root, tb, h, byName } = setup();
    const pop = root.querySelector<HTMLElement>('.tb-pop-ground')!;
    expect(pop.hidden).toBe(true);
    byName('สีพื้นทั้งแผนที่').click();
    expect(pop.hidden).toBe(false);
    expect(pop.getAttribute('aria-label')).toBe('สีพื้นทั้งแผนที่');
    expect(tb.isOpen()).toBe(true);
    expect(h.onOpenChange).toHaveBeenLastCalledWith(true);
    const sand = [...pop.querySelectorAll('button')].find((b) => b.textContent === T.ground.sand)!;
    sand.click();
    expect(h.onGround).toHaveBeenCalledWith('sand');
    expect(pop.hidden).toBe(false); // stays open to try more
    press('Escape');
    expect(pop.hidden).toBe(true);
    expect(tb.isOpen()).toBe(false);
    byName('สีพื้นทั้งแผนที่').click();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(pop.hidden).toBe(true);
    expect(h.onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('⋯ holds เริ่มใหม่ and เคลียร์; choosing one closes the menu and runs the handler', () => {
    const { root, tb, h, byName } = setup();
    const pop = root.querySelector<HTMLElement>('.tb-pop-more')!;
    byName(T.toolbar.more).click();
    expect([...pop.querySelectorAll('button')].map((b) => b.textContent)).toEqual([T.restart, T.clear]);
    pop.querySelector<HTMLElement>('.tb-restart')!.click();
    expect(h.onRestart).toHaveBeenCalledOnce();
    expect(tb.isOpen()).toBe(false);
    byName(T.toolbar.more).click();
    pop.querySelector<HTMLElement>('.tb-clear')!.click();
    expect(h.onClear).toHaveBeenCalledOnce();
  });

  it('opening one popover closes the other; setVisible(false) closes all', () => {
    const { root, tb, byName } = setup();
    byName(T.toolbar.more).click();
    byName('สีพื้นทั้งแผนที่').click();
    expect(root.querySelector<HTMLElement>('.tb-pop-more')!.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('.tb-pop-ground')!.hidden).toBe(false);
    tb.setVisible(false);
    expect(tb.isOpen()).toBe(false);
    expect((root.firstElementChild as HTMLElement).hidden).toBe(true);
  });

  it('📷 and ⌨️ call their handlers', () => {
    const { h, byName } = setup();
    byName(T.screenshot).click();
    byName(T.toolbar.shortcuts).click();
    expect(h.onScreenshot).toHaveBeenCalledOnce();
    expect(h.onShortcuts).toHaveBeenCalledOnce();
  });

  it('the gallery gets only the scene switches: no 📷, ⌨️ or ⋯', () => {
    const { root } = setup({ onTime: vi.fn(), onWeather: vi.fn(), onGround: vi.fn(), onQuality: vi.fn() });
    expect([...root.querySelectorAll('.tb-btn')].map((b) => b.className.split(' ')[1])).toEqual(['tb-time', 'tb-rain', 'tb-ground', 'tb-quality']);
  });

  it('a long press (touch) shows the label and does not run the action; a short tap does', () => {
    vi.useFakeTimers();
    const { root, h, byName } = setup();
    const rain = byName(T.weather.rain);
    const ptr = (type: string) => rain.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', bubbles: true }));
    ptr('pointerdown');
    vi.advanceTimersByTime(LONG_PRESS_MS + 10);
    expect(rain.classList.contains('show-label')).toBe(true);
    ptr('pointerup');
    rain.click();
    expect(h.onWeather).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1300);
    expect(rain.classList.contains('show-label')).toBe(false);
    ptr('pointerdown');
    vi.advanceTimersByTime(100);
    ptr('pointerup');
    rain.click();
    expect(h.onWeather).toHaveBeenCalledOnce();
    expect(root.querySelector('.show-label')).toBeNull();
  });
});
