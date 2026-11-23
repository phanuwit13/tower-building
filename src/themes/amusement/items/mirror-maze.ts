import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, wallPanel, type Facing } from '../../../models/parts';

// A purple box house with shiny glass panels on every wall, a glowing yellow entrance with a striped
// awning on +x, and a blue roof tower topped with a chrome mirror ball.
const H = 0.85; // half width of the house
const PLINTH = 0.06;
const WALL = 1.0;
const TOP = PLINTH + WALL;
const PANEL = { w: 0.34, h: 0.62, y: PLINTH + 0.5 };
const DOOR = { w: 0.48, h: 0.78 };

/** บ้านกระจก: a mirror-maze house with glass panels that glow warm at night and a bright entrance. */
export const item: ItemModel = {
  id: 'mirror-maze',
  name: 'บ้านกระจก',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.8, PLINTH, 1.8], [0, PLINTH / 2, 0], 'stone'),
      kit.box([2 * H, WALL, 2 * H], [0, PLINTH + WALL / 2, 0], 'purple'),
      kit.box([1.84, 0.08, 1.84], [0, TOP + 0.04, 0], 'pink'),
      kit.box([0.7, 0.4, 0.7], [0, TOP + 0.08 + 0.2, 0], 'blue'),
      kit.box([0.74, 0.06, 0.74], [0, TOP + 0.08 + 0.43, 0], 'white'),
      kit.sphere(0.24, [0, TOP + 0.08 + 0.46 + 0.2, 0], 'chrome'),
    ];
    for (const x of [-0.82, 0.82]) {
      for (const z of [-0.82, 0.82]) {
        parts.push(kit.box([0.12, WALL + 0.04, 0.12], [x, PLINTH + (WALL + 0.04) / 2, z], 'sunYellow'));
        parts.push(kit.cone(0.08, 0.22, [x * 0.97, TOP + 0.08 + 0.11, z * 0.97], 'red', { segments: 6 }));
      }
    }
    const win = (at: [number, number, number], facing: Facing) =>
      glassWindow(kit, { at, facing, w: PANEL.w, h: PANEL.h, frame: 'white' });
    for (const z of [-0.55, 0.55]) parts.push(...win([H, PANEL.y, z], 'x+'));
    for (const t of [-0.52, 0, 0.52]) {
      parts.push(...win([-H, PANEL.y, t], 'x-'), ...win([t, PANEL.y, H], 'z+'), ...win([t, PANEL.y, -H], 'z-'));
    }
    // entrance on +x: yellow frame, glowing opening, striped awning
    const doorY = PLINTH + DOOR.h / 2;
    parts.push(
      ...wallPanel(kit, { at: [H, doorY, 0], facing: 'x+', w: DOOR.w + 0.12, h: DOOR.h + 0.06, depth: 0.02, color: 'sunYellow' }),
      kit.box([0.03, DOOR.h, DOOR.w], [H + 0.035, doorY - 0.03, 0], 'lampWarm', { glow: true, light: 'window' }),
    );
    (['red', 'white', 'red'] as const).forEach((color, i) => {
      parts.push(kit.wedge([0.12, 0.14, 0.2], [H + 0.06, PLINTH + DOOR.h + 0.12, (i - 1) * 0.2], color, { apex: -0.5 }));
    });
    return kit.finish(parts);
  },
};
