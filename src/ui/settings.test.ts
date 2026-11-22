// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSettingsPanel } from './settings';

const noop = () => {};
const h = { onWeather: noop, onTime: noop, onGround: noop, onQuality: noop, onRestart: noop, onClear: noop };
const cur = { settings: { weather: 'sunny', time: 'day', ground: 'grass' }, quality: 'pretty' } as const;

describe('settings panel', () => {
  afterEach(() => { document.body.innerHTML = ''; });
  it('Escape on document closes and returns focus to opener', () => {
    const root = document.body.appendChild(document.createElement('div'));
    const opener = document.body.appendChild(document.createElement('button'));
    const panel = createSettingsPanel(root, h);
    opener.focus();
    panel.open(cur);
    const sheet = root.firstElementChild as HTMLElement;
    expect(sheet.hidden).toBe(false);
    expect(sheet.contains(document.activeElement)).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(sheet.hidden).toBe(true);
    expect(document.activeElement).toBe(opener);
  });
  it('removes the document listener on close', () => {
    const root = document.body.appendChild(document.createElement('div'));
    const remove = vi.spyOn(document, 'removeEventListener');
    const panel = createSettingsPanel(root, h);
    panel.open(cur);
    panel.close();
    expect(remove.mock.calls.some((c) => c[0] === 'keydown')).toBe(true);
    remove.mockRestore();
  });
});
