// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { createEndScreen } from './endScreen';
import { T } from './strings';

describe('end screen', () => {
  const setup = () => {
    const root = document.createElement('div');
    const h = { onScreenshot: vi.fn(), onRestart: vi.fn(), onView: vi.fn(), onHome: vi.fn() };
    return { root, h, es: createEndScreen(root, h) };
  };
  it('shows Thai title and summary, no Game Over', () => {
    const { root, es } = setup();
    es.show({ items: 34, tilesUsed: 87, percent: 87 });
    expect(root.textContent).toContain('เมืองเสร็จแล้ว!');
    expect(root.textContent).toContain('วางไป 34 ชิ้น · ใช้พื้นที่ 87%');
    expect(root.textContent!.toLowerCase()).not.toContain('game over');
  });
  it('wires buttons and hides', () => {
    const { root, h, es } = setup();
    es.show({ items: 1, tilesUsed: 1, percent: 1 });
    const click = (t: string) => ([...root.querySelectorAll('button')].find((b) => b.textContent === t) as HTMLButtonElement).click();
    click(T.screenshot); click(T.restart); click(T.viewCity); click(T.home);
    expect(h.onHome).toHaveBeenCalledOnce();
    expect(h.onScreenshot).toHaveBeenCalledOnce();
    expect(h.onRestart).toHaveBeenCalledOnce();
    expect(h.onView).toHaveBeenCalledOnce();
    es.hide();
    expect((root.firstElementChild as HTMLElement).hidden).toBe(true);
  });
});
