// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ThemeDef } from '../themes/types';
import { createThemeSelect } from './themeSelect';
import { builtLabel, T } from './strings';

const themes = [
  { id: 'school', name: 'โรงเรียน', emoji: '🏫', defaultGround: 'grass', items: [] },
  { id: 'zoo', name: 'สวนสัตว์', emoji: '🦁', defaultGround: 'grass', items: [] },
] satisfies ThemeDef[];

function setup() {
  const root = document.body.appendChild(document.createElement('div'));
  const onPick = vi.fn();
  const ts = createThemeSelect(root, themes, onPick);
  const card = (name: string) => [...root.querySelectorAll<HTMLButtonElement>('.theme-card')].find((b) => b.textContent?.includes(name))!;
  /** The text a child sees on a card (hidden parts left out). */
  const seen = (name: string) => [...card(name).querySelectorAll<HTMLElement>('span')].filter((e) => !e.hidden).map((e) => e.textContent).join(' | ');
  return { root, onPick, ts, card, seen };
}

describe('theme select', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('no cities yet: every theme is just its name', () => {
    const { root, ts, seen } = setup();
    ts.show({});
    expect((root.firstElementChild as HTMLElement).hidden).toBe(false);
    expect(seen('โรงเรียน')).toBe('🏫 | โรงเรียน');
    expect(seen('สวนสัตว์')).toBe('🦁 | สวนสัตว์');
  });

  it('a theme with a city shows how much is built, and when its round is finished', () => {
    const { ts, seen } = setup();
    ts.show({ school: { placed: 32, floors: 0, finished: false }, zoo: { placed: 140, floors: 12, finished: true } });
    expect(seen('โรงเรียน')).toBe(`🏫 | โรงเรียน | ${builtLabel(32)}`);
    expect(seen('สวนสัตว์')).toBe(`🦁 | สวนสัตว์ | ${builtLabel(140)} | ${T.cityDone}`);
  });

  it('an empty city (no items, no floor) has no badge; one with only floor says so', () => {
    const { ts, seen } = setup();
    ts.show({ school: { placed: 0, floors: 0, finished: false }, zoo: { placed: 0, floors: 5, finished: false } });
    expect(seen('โรงเรียน')).toBe('🏫 | โรงเรียน');
    expect(seen('สวนสัตว์')).toBe(`🦁 | สวนสัตว์ | ${T.floorsOnly}`);
  });

  it('the badges follow the cities (a city cleared, a round restarted)', () => {
    const { ts, seen } = setup();
    ts.show({ school: { placed: 3, floors: 0, finished: true }, zoo: { placed: 4, floors: 0, finished: false } });
    ts.show({ zoo: { placed: 0, floors: 0, finished: false } });
    expect(seen('โรงเรียน')).toBe('🏫 | โรงเรียน');
    expect(seen('สวนสัตว์')).toBe('🦁 | สวนสัตว์');
  });

  it('picks a theme; focus() puts the keyboard on a theme\'s card', () => {
    const { onPick, ts, card } = setup();
    ts.show({});
    card('สวนสัตว์').click();
    expect(onPick).toHaveBeenCalledWith('zoo');
    ts.focus('zoo');
    expect(document.activeElement).toBe(card('สวนสัตว์'));
  });

  it('hide() hides the screen', () => {
    const { root, ts } = setup();
    ts.show({});
    ts.hide();
    expect((root.firstElementChild as HTMLElement).hidden).toBe(true);
  });
});
