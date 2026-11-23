import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three sorting bins in a row (along z) with picture lids, no words: bottles (blue bin), cans (teal
// bin) and burnable waste (red bin). Each bin has a white panel on the front with its picture, and a
// matching opening on the lid.
const PAD = 0.03;
const BIN = { w: 0.46, h: 0.5, d: 0.26 };
const ZS = [-0.3, 0, 0.3];

function picture(kit: StyleKit, kind: 'bottle' | 'can' | 'flame', x: number, y: number, z: number): Part[] {
  if (kind === 'bottle') {
    return [
      kit.cylinder(0.04, 0.04, 0.1, [x, y - 0.03, z], 'skyBlue', { segments: 6 }),
      kit.cylinder(0.018, 0.04, 0.05, [x, y + 0.045, z], 'skyBlue', { segments: 6 }),
      kit.cylinder(0.018, 0.018, 0.03, [x, y + 0.085, z], 'navy', { segments: 6 }),
    ];
  }
  if (kind === 'can') {
    return [kit.cylinder(0.045, 0.045, 0.14, [x, y, z], 'chrome', { segments: 8 }), kit.cylinder(0.046, 0.046, 0.03, [x, y + 0.03, z], 'orange', { segments: 8 })];
  }
  return [kit.cone(0.06, 0.15, [x, y, z], 'orange', { segments: 6 }), kit.cone(0.032, 0.09, [x, y - 0.02, z], 'sunYellow', { segments: 6 })];
}

/** ถังขยะแยกประเภท: bins with picture lids. */
export const item: ItemModel = {
  id: 'trash-bins',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.8, PAD, 0.98], [0, PAD / 2, 0], 'stone')];
    const colors: PaletteColor[] = ['blue', 'teal', 'red'];
    const kinds = ['bottle', 'can', 'flame'] as const;
    ZS.forEach((z, i) => {
      const top = PAD + BIN.h;
      const front = BIN.w / 2;
      parts.push(
        kit.box([BIN.w, BIN.h, BIN.d], [0, PAD + BIN.h / 2, z], colors[i]),
        kit.box([BIN.w + 0.04, 0.06, BIN.d + 0.02], [0, top + 0.03, z], 'charcoal'), // lid
        kit.box([0.03, 0.26, 0.2], [front + 0.015, PAD + 0.28, z], 'white'), // picture panel
      );
      parts.push(...picture(kit, kinds[i], front + 0.05, PAD + 0.28, z));
      // opening on the lid, shaped for what goes in
      if (i === 2) parts.push(kit.box([0.2, 0.012, 0.12], [0.02, top + 0.066, z], 'stoneDark'));
      else parts.push(kit.cylinder(0.06, 0.06, 0.012, [0.02, top + 0.066, z], 'stoneDark', { segments: 8 }));
    });
    return kit.finish(parts);
  },
};
