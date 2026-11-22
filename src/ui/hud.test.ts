// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { createHud, type HudView } from './hud';
import { T } from './strings';

const view = (o: Partial<HudView> = {}): HudView => ({
  visible: true,
  current: { name: 'บ้าน', size: '2×2 ช่อง', thumb: null },
  next: { name: 'ต้นไม้', size: '1×1 ช่อง', thumb: null },
  placed: 0, canPlace: true, canRotate: true, hint: null, finished: false, ...o,
});
const setup = () => {
  const root = document.createElement('div');
  const h = { onRotate: vi.fn(), onPlace: vi.fn(), onSettings: vi.fn(), onScreenshot: vi.fn(), onRestart: vi.fn() };
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
  it('wires buttons to handlers', () => {
    const { root, h, hud } = setup();
    hud.update(view());
    btn(root, T.rotate).click();
    btn(root, T.place).click();
    btn(root, T.settings).click();
    btn(root, T.screenshot).click();
    expect(h.onRotate).toHaveBeenCalledOnce();
    expect(h.onPlace).toHaveBeenCalledOnce();
    expect(h.onSettings).toHaveBeenCalledOnce();
    expect(h.onScreenshot).toHaveBeenCalledOnce();
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
    hud.update(view({ finished: true, canPlace: false, canRotate: false, current: null, next: null }));
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
