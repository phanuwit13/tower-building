import type { ThemeDef, ThemeId } from '../themes/types';
import { el } from './dom';
import { T } from './strings';

export function createThemeSelect(
  root: HTMLElement,
  themes: readonly ThemeDef[],
  onPick: (id: ThemeId) => void,
): { show(): void; hide(): void } {
  const cards = themes.map((t) =>
    el('button', { class: 'theme-card', attrs: { type: 'button' }, onClick: () => onPick(t.id) }, [
      el('span', { class: 'theme-emoji', text: t.emoji, attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'theme-name', text: t.name }),
    ]),
  );
  const screen = el('section', { class: 'theme-select screen' }, [
    el('h1', { text: T.appTitle }),
    el('h2', { text: T.pickTheme }),
    el('div', { class: 'theme-grid' }, cards),
  ]);
  screen.hidden = true;
  root.appendChild(screen);
  return {
    show: () => { screen.hidden = false; },
    hide: () => { screen.hidden = true; },
  };
}
