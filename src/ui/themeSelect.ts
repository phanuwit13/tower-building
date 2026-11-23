import type { CitySummary } from '../app/controller';
import type { ThemeDef, ThemeId } from '../themes/types';
import { el } from './dom';
import { builtLabel, T } from './strings';

/**
 * The first screen: a card per theme. A theme whose city has something in it says how much is built
 * (or that floor is laid) and whether its round is finished; picking it carries on with that city.
 */
export function createThemeSelect(
  root: HTMLElement,
  themes: readonly ThemeDef[],
  onPick: (id: ThemeId) => void,
): { show(cities: Readonly<Record<string, CitySummary>>): void; hide(): void; focus(id: string): void } {
  const cards = themes.map((t) => {
    const built = el('span', { class: 'theme-built' });
    const done = el('span', { class: 'theme-done', text: T.cityDone });
    const card = el('button', { class: 'theme-card', attrs: { type: 'button' }, onClick: () => onPick(t.id) }, [
      el('span', { class: 'theme-emoji', text: t.emoji, attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'theme-name', text: t.name }),
      built,
      done,
    ]);
    return {
      id: t.id,
      card,
      set(c: CitySummary | undefined) {
        // an empty city (picked, then left at once, or just restarted) is no different from none
        const text = !c ? '' : c.placed > 0 ? builtLabel(c.placed) : c.floors > 0 ? T.floorsOnly : '';
        built.hidden = text === '';
        done.hidden = !c?.finished;
        if (built.textContent !== text) built.textContent = text;
      },
    };
  });
  const screen = el('section', { class: 'theme-select screen' }, [
    el('h1', { text: T.appTitle }),
    el('h2', { text: T.pickTheme }),
    el('div', { class: 'theme-grid' }, cards.map((c) => c.card)),
  ]);
  screen.hidden = true;
  root.appendChild(screen);
  return {
    show(cities) {
      for (const c of cards) c.set(Object.hasOwn(cities, c.id) ? cities[c.id] : undefined);
      screen.hidden = false;
    },
    hide: () => { screen.hidden = true; },
    focus(id) { cards.find((c) => c.id === id)?.card.focus(); },
  };
}
