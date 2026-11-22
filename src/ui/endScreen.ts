import type { FillStats } from '../game/types';
import { button, el } from './dom';
import { summaryLabel, T } from './strings';

export function createEndScreen(
  root: HTMLElement,
  h: { onScreenshot(): void; onRestart(): void; onView(): void },
): { show(s: FillStats): void; hide(): void } {
  const summary = el('p', { class: 'end-summary' });
  const screen = el('section', { class: 'end-screen screen', attrs: { role: 'status' } }, [
    el('div', { class: 'end-card' }, [
      el('h2', { text: T.endTitle }),
      summary,
      el('div', { class: 'end-actions' }, [
        button(T.screenshot, h.onScreenshot),
        button(T.restart, h.onRestart),
        button(T.viewCity, h.onView),
      ]),
    ]),
  ]);
  screen.hidden = true;
  root.appendChild(screen);
  return {
    show(s) { summary.textContent = summaryLabel(s); screen.hidden = false; },
    hide() { screen.hidden = true; },
  };
}
