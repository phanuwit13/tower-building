// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { createHud, tapHint, type HudView } from './hud';
import { T } from './strings';

const view = (o: Partial<HudView> = {}): HudView => ({
  visible: true,
  current: { name: 'บ้าน', size: '2×2 ช่อง', thumb: null },
  next: [{ name: 'ต้นไม้', size: '1×1 ช่อง', thumb: null }],
  placed: 0, canPlace: true, canRotate: true, hint: null, finished: false, floorMode: false, ...o,
});
const setup = () => {
  const root = document.createElement('div');
  const h = { onRotate: vi.fn(), onPlace: vi.fn(), onRestart: vi.fn(), onFloors: vi.fn(), onHome: vi.fn() };
  const hud = createHud(root, h);
  return { root, h, hud };
};
const btn = (root: HTMLElement, text: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

describe('hud', () => {
  it('shows placed count in Thai', () => {
    const { root, hud } = setup();
    hud.update(view({ placed: 3 }));
    expect(root.textContent).toContain('วางแล้ว 3 ชิ้น');
  });
  it('disables place when canPlace is false', () => {
    const { root, hud } = setup();
    hud.update(view({ canPlace: false }));
    expect(btn(root, T.place).disabled).toBe(true);
    hud.update(view({ canPlace: true }));
    expect(btn(root, T.place).disabled).toBe(false);
  });
  it('หมุน and วาง carry an icon (a box with an arrow, a check) and keep their Thai names', () => {
    const { root, hud } = setup();
    hud.update(view());
    for (const name of [T.rotate, T.place]) {
      const b = btn(root, name);
      expect(b.textContent).toBe(name); // the accessible name is the word alone
      const svg = b.querySelector('svg')!;
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
    }
  });
  it('wires buttons to handlers', () => {
    const { root, h, hud } = setup();
    hud.update(view());
    btn(root, T.rotate).click();
    btn(root, T.place).click();
    expect(h.onRotate).toHaveBeenCalledOnce();
    expect(h.onPlace).toHaveBeenCalledOnce();
  });
  it('shows cards and hint, hides when not visible', () => {
    const { root, hud } = setup();
    hud.update(view({ hint: T.hintTap }));
    expect(root.textContent).toContain('บ้าน');
    expect(root.textContent).toContain('ต้นไม้');
    expect(root.textContent).toContain(T.hintTap);
    hud.update(view({ visible: false }));
    expect((root.firstElementChild as HTMLElement).hidden).toBe(true);
  });
  it('finished: restart replaces rotate/place and uses the restart handler', () => {
    const { root, h, hud } = setup();
    hud.update(view({ finished: true, canPlace: false, canRotate: false, current: null, next: [] }));
    expect(btn(root, T.rotate).hidden).toBe(true);
    expect(btn(root, T.place).hidden).toBe(true);
    const restart = [...root.querySelectorAll('button')].find((b) => b.textContent === T.restart) as HTMLButtonElement;
    expect(restart.hidden).toBe(false);
    restart.click();
    expect(h.onRestart).toHaveBeenCalledOnce();
    hud.update(view());
    expect(restart.hidden).toBe(true);
    expect(btn(root, T.place).hidden).toBe(false);
  });
  it('[ปูกระเบื้อง] opens the floors, while playing and when finished', () => {
    const { root, h, hud } = setup();
    hud.update(view());
    const floors = btn(root, T.floor.open);
    expect(floors.hidden).toBe(false);
    floors.click();
    expect(h.onFloors).toHaveBeenCalledOnce();
    hud.update(view({ finished: true, canPlace: false, canRotate: false, current: null, next: [] }));
    expect(floors.hidden).toBe(false);
  });
  it('floor mode hides the item cards, the hint, หมุน/วาง and [ปูกระเบื้อง]; the counter stays', () => {
    const { root, hud } = setup();
    hud.update(view({ hint: T.hintTap, floorMode: true }));
    const shown = (e: Element | null) => e !== null && !(e as HTMLElement).hidden && !(e as HTMLElement).closest('[hidden]');
    expect(shown(root.querySelector('.card-current'))).toBe(false);
    expect(shown(root.querySelector('.card-next'))).toBe(false);
    expect(shown(root.querySelector('.hud-hint'))).toBe(false);
    for (const name of [T.rotate, T.place, T.floor.open]) expect(shown(btn(root, name)), name).toBe(false);
    expect(shown(root.querySelector('.hud-placed'))).toBe(true);
    hud.update(view({ hint: T.hintTap }));
    for (const name of [T.rotate, T.place, T.floor.open]) expect(shown(btn(root, name)), name).toBe(true);
    expect(shown(root.querySelector('.card-current'))).toBe(true);
    expect(shown(root.querySelector('.hud-hint'))).toBe(true);
  });
  it('leaving floor mode gives the focus back to [ปูกระเบื้อง] when it was left nowhere', () => {
    const { root, hud } = setup();
    document.body.appendChild(root);
    hud.update(view({ floorMode: true }));
    (document.activeElement as HTMLElement | null)?.blur();
    hud.update(view());
    expect(document.activeElement).toBe(btn(root, T.floor.open));
    // still on a drawer button that has just been hidden (เสร็จ)
    const drawer = document.createElement('div');
    const done = document.createElement('button');
    drawer.appendChild(done);
    document.body.appendChild(drawer);
    hud.update(view({ floorMode: true }));
    done.focus();
    drawer.hidden = true;
    hud.update(view());
    expect(document.activeElement).toBe(btn(root, T.floor.open));
    // a focus that went somewhere on purpose stays there
    const other = document.createElement('button');
    document.body.appendChild(other);
    hud.update(view({ floorMode: true }));
    other.focus();
    hud.update(view());
    expect(document.activeElement).toBe(other);
    drawer.remove();
    other.remove();
    root.remove();
  });
  it('🏠 เปลี่ยนธีม is there while playing, after the round and with the floor drawer open', () => {
    const { root, h, hud } = setup();
    const shown = (e: HTMLElement) => !e.hidden && !e.closest('[hidden]');
    hud.update(view());
    const home = btn(root, T.home);
    expect(home.textContent).toBe(T.home);
    expect(shown(home)).toBe(true);
    home.click();
    expect(h.onHome).toHaveBeenCalledOnce();
    hud.update(view({ finished: true, canPlace: false, canRotate: false, current: null, next: [] }));
    expect(shown(home)).toBe(true);
    hud.update(view({ floorMode: true }));
    expect(shown(home)).toBe(true);
  });
  it('🏠 sits top left, above the item cards (never on them)', () => {
    const { root, hud } = setup();
    hud.update(view());
    const left = root.querySelector('.hud-top > .hud-left')!;
    expect(left).not.toBeNull();
    expect(left.previousElementSibling).toBeNull(); // first in the top row
    expect([...left.children].map((c) => c.className)).toEqual(['btn-home', 'hud-cards']);
  });
  it('the floor button reads as tile painting: ปูกระเบื้อง with a brush-and-tile icon', () => {
    const { root, hud } = setup();
    hud.update(view());
    const floors = btn(root, T.floor.open);
    expect(floors.textContent).toBe('ปูกระเบื้อง');
    expect(floors.querySelector('svg rect')).not.toBeNull();
    expect(floors.querySelector('svg path.brush')).not.toBeNull();
  });
  it('shows up to four next cards under one label, fewer when there are fewer, and updates them in place', () => {
    const { root, hud } = setup();
    const c = (name: string) => ({ name, size: '1×1 ช่อง', thumb: null });
    const minis = () => [...root.querySelectorAll<HTMLElement>('.card-mini')].filter((m) => !m.hidden);
    const names = () => minis().map((m) => m.querySelector('.card-name')!.textContent);
    expect(root.querySelectorAll('.card-mini')).toHaveLength(4);
    expect(root.querySelectorAll('.card-label').length).toBe(2); // ชิ้นนี้ and one ชิ้นถัดไป
    hud.update(view({ next: [c('ก'), c('ข'), c('ค'), c('ง')] }));
    expect(names()).toEqual(['ก', 'ข', 'ค', 'ง']);
    hud.update(view({ next: [c('ข'), c('ค'), c('ง'), c('จ')] }));
    expect(names()).toEqual(['ข', 'ค', 'ง', 'จ']);
    hud.update(view({ next: [c('ก'), c('ข')] }));
    expect(names()).toEqual(['ก', 'ข']);
    hud.update(view({ next: [] }));
    expect((root.querySelector('.card-next') as HTMLElement).hidden).toBe(true);
  });
  it('does not re-assign thumbnail src or text when nothing changed', () => {
    const { root, hud } = setup();
    const card = { name: 'บ้าน', size: '2×2 ช่อง', thumb: 'data:image/png;base64,AAAA' };
    hud.update(view({ current: card }));
    const img = root.querySelector('.card-current img') as HTMLImageElement;
    const setAttr = vi.spyOn(img, 'setAttribute');
    const name = root.querySelector('.card-current .card-name') as HTMLElement;
    const nameWrites = vi.spyOn(name, 'textContent', 'set');
    hud.update(view({ current: { ...card } }));
    expect(setAttr).not.toHaveBeenCalled();
    expect(nameWrites).not.toHaveBeenCalled();
    hud.update(view({ current: { ...card, thumb: 'data:image/png;base64,BBBB' } }));
    expect(img.getAttribute('src')).toBe('data:image/png;base64,BBBB');
  });
});

describe('tapHint ("แตะพื้นเพื่อเลือกที่วาง")', () => {
  it('shows while playing with nothing picked yet, until an item has ever been placed in this browser', () => {
    expect(tapHint({ playing: true, ghost: false, placedEver: false })).toBe(T.hintTap);
    expect(tapHint({ playing: true, ghost: true, placedEver: false })).toBeNull(); // a spot is picked
    expect(tapHint({ playing: false, ghost: false, placedEver: false })).toBeNull(); // theme select, a finished round
    expect(tapHint({ playing: true, ghost: false, placedEver: true })).toBeNull(); // never again after the first item
  });
});
