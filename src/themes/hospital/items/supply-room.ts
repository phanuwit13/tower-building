import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A tall shelf unit along the back (-x) with boxes and folded towels, a wooden ladder leaning on it and
// a few boxes stacked on the floor in front.
const SHELF = { x: -0.7, d: 0.5, h: 1.2, len: 1.9 };
const TOWELS: PaletteColor[] = ['skyBlue', 'mint', 'pink', 'sunYellow', 'lime'];
const BOXES: PaletteColor[] = ['orange', 'purple', 'blue', 'terracotta', 'sunYellow'];

/** ห้องเก็บของ: shelves of boxes, folded towels and a ladder. */
export const item: ItemModel = {
  id: 'supply-room',
  name: 'ห้องเก็บของ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // frame
    parts.push(
      kit.box([0.04, SHELF.h, SHELF.len], [SHELF.x - SHELF.d / 2 + 0.02, SHELF.h / 2, 0], 'stoneDark'),
      kit.box([SHELF.d, 0.04, SHELF.len], [SHELF.x, 0.02, 0], 'stoneDark'),
    );
    for (const z of [-SHELF.len / 2 + 0.03, SHELF.len / 2 - 0.03]) parts.push(kit.box([SHELF.d, SHELF.h, 0.06], [SHELF.x, SHELF.h / 2, z], 'stone'));
    const ys = [0.04, 0.4, 0.76, SHELF.h - 0.04];
    ys.forEach((y, i) => parts.push(kit.box([SHELF.d, 0.04, SHELF.len - 0.12], [SHELF.x, y + 0.02, 0], i === 3 ? 'cream' : 'stone')));
    // level 0: boxes, level 1: folded towel stacks, level 2: boxes and bins
    for (let i = 0; i < 4; i++) {
      const z = -0.7 + i * 0.46;
      const h = 0.22 + (i % 2) * 0.06;
      parts.push(kit.box([0.36, h, 0.36], [SHELF.x + 0.03, 0.08 + h / 2, z], BOXES[i % 5]));
      parts.push(kit.box([0.1, 0.03, 0.2], [SHELF.x + 0.22, 0.08 + h * 0.6, z], 'white'));
    }
    for (let i = 0; i < 4; i++) {
      const z = -0.7 + i * 0.46;
      for (let k = 0; k < 4; k++) parts.push(kit.box([0.34, 0.07, 0.38], [SHELF.x + 0.04, 0.44 + k * 0.075 + 0.035, z], TOWELS[(i + k) % 5]));
    }
    for (let i = 0; i < 4; i++) {
      const z = -0.7 + i * 0.46;
      if (i % 2 === 0) parts.push(kit.box([0.36, 0.3, 0.36], [SHELF.x + 0.03, 0.8 + 0.15, z], BOXES[(i + 2) % 5]));
      else parts.push(kit.cylinder(0.16, 0.14, 0.28, [SHELF.x + 0.03, 0.8 + 0.14, z], 'sunYellow', { segments: 8 }));
    }
    // bright boxes on the top plate (seen from above)
    for (let i = 0; i < 4; i++) {
      const z = -0.7 + i * 0.46;
      parts.push(kit.box([0.3, 0.12 + (i % 2) * 0.06, 0.3], [SHELF.x + 0.03, SHELF.h + 0.06 + (i % 2) * 0.03, z], BOXES[(i + 1) % 5]));
    }
    // ladder leaning on the shelf front (rails from the floor up to the shelf edge)
    const top = SHELF.x + SHELF.d / 2 + 0.03;
    for (const z of [0.4, 0.8]) parts.push(rod(kit, [0.18, 0.03, z], [top, 1.1, z], 0.025, 'wood', { segments: 6 }));
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.7) / 5.4;
      parts.push(kit.box([0.04, 0.03, 0.4], [0.18 + (top - 0.18) * t, 0.03 + 1.07 * t, 0.6], 'woodDark'));
    }
    // floor stack in front
    parts.push(
      kit.box([0.4, 0.3, 0.44], [0.6, 0.15, -0.55], 'orange'),
      kit.box([0.34, 0.24, 0.38], [0.6, 0.42, -0.55], 'sunYellow'),
      kit.box([0.1, 0.02, 0.2], [0.78, 0.15, -0.55], 'white'),
      kit.box([0.3, 0.2, 0.34], [0.55, 0.1, -0.05], 'blue'),
    );
    return kit.finish(parts);
  },
};
