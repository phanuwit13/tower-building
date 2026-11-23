import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two plain vending machines (2×2) side by side facing +x, lit fronts full of colour blocks (no brands),
// and a bench in front for waiting.
const MACH_X = -0.55; // machine centre x
const MACH = { w: 0.8, d: 0.6, h: 1.35 }; // along z, along x, height
const GOODS: PaletteColor[] = ['red', 'orange', 'sunYellow', 'lime', 'skyBlue', 'pink', 'purple', 'white'];

/** มุมตู้กด: two vending machines with lit fronts and a bench. */
export const item: ItemModel = {
  id: 'vending-corner',
  name: 'มุมตู้กด',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [];
    const frontX = MACH_X + MACH.d / 2;
    [
      { z: -0.5, body: 'teal' as PaletteColor, shift: 0 },
      { z: 0.5, body: 'orange' as PaletteColor, shift: 3 },
    ].forEach(({ z, body, shift }) => {
      parts.push(
        kit.box([MACH.d + 0.04, 0.06, MACH.w + 0.04], [MACH_X, 0.03, z], 'charcoal'),
        kit.box([MACH.d, MACH.h - 0.06, MACH.w], [MACH_X, 0.06 + (MACH.h - 0.06) / 2, z], body),
        kit.box([MACH.d + 0.04, 0.04, MACH.w + 0.04], [MACH_X, MACH.h + 0.02, z], 'charcoal'),
        // lit display window with three shelves of colour-block goods
        kit.box([0.02, 0.85, 0.5], [frontX + 0.01, 0.82, z - 0.1], 'glassBlue', { glow: 'windowWarm', light: 'window' }),
      );
      for (let r = 0; r < 3; r++) {
        const y = 0.5 + r * 0.28;
        parts.push(kit.box([0.04, 0.025, 0.5], [frontX + 0.03, y, z - 0.1], 'chrome'));
        for (let c = 0; c < 4; c++) {
          parts.push(kit.box([0.05, 0.14, 0.08], [frontX + 0.04, y + 0.085, z - 0.25 + c * 0.1333], GOODS[(shift + r * 3 + c * 2) % GOODS.length]));
        }
      }
      // side panel with coin slot and buttons, drop tray
      parts.push(
        kit.box([0.03, 0.5, 0.18], [frontX + 0.015, 0.92, z + 0.29], 'charcoal'),
        kit.box([0.04, 0.12, 0.1], [frontX + 0.03, 1.08, z + 0.29], 'sunYellow'),
        kit.box([0.04, 0.03, 0.12], [frontX + 0.03, 0.9, z + 0.29], 'white'),
        kit.box([0.04, 0.05, 0.05], [frontX + 0.03, 0.78, z + 0.26], 'lime'),
        kit.box([0.04, 0.05, 0.05], [frontX + 0.03, 0.78, z + 0.33], 'red'),
        kit.box([0.04, 0.18, 0.5], [frontX + 0.02, 0.2, z - 0.1], 'charcoal'),
        kit.box([0.03, 0.12, 0.4], [frontX + 0.04, 0.2, z - 0.1], 'stoneDark'),
        kit.box([MACH.d - 0.1, 0.1, MACH.w - 0.1], [MACH_X, MACH.h + 0.09, z], body === 'teal' ? 'mint' : 'sunYellow'),
      );
    });

    // bench facing the machines (-x), seat 0.31, back at the +x side
    const BX = 0.62;
    parts.push(
      kit.box([0.4, 0.04, 1.7], [BX - 0.02, 0.29, 0], 'wood'),
      kit.box([0.06, 0.3, 1.7], [BX + 0.17, 0.46, 0], 'wood'),
      kit.box([0.06, 0.04, 1.7], [BX + 0.17, 0.63, 0], 'woodDark'),
    );
    for (const z of [-0.78, 0.78]) {
      parts.push(
        kit.box([0.4, 0.27, 0.06], [BX - 0.02, 0.135, z], 'charcoal'),
        kit.box([0.08, 0.3, 0.06], [BX + 0.17, 0.45, z], 'charcoal'),
      );
    }
    return kit.finish(parts);
  },
};
