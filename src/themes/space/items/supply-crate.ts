import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Stacked supply boxes (1×1): a blue box, an orange box on top and a small yellow box beside them.
// Each has a white label with a little picture (a planet, a star-diamond, a leaf) and no text.

/** A white label on the +x face (and a second one on +z) with a coloured picture. */
function label(kit: StyleKit, at: Vec3, size: number, pic: PaletteColor, shape: 'disc' | 'diamond', face: 'x' | 'z'): Part[] {
  const along = face === 'x' ? [0.02, size, size] : [size, size, 0.02];
  const out = face === 'x' ? [0.035, size * 0.55, size * 0.55] : [size * 0.55, size * 0.55, 0.035];
  const p: Vec3 = [at[0] + (face === 'x' ? 0.005 : 0), at[1], at[2] + (face === 'z' ? 0.005 : 0)];
  const r = size * 0.28;
  const picture = shape === 'disc'
    ? kit.cylinder(r, r, 0.03, p, pic, { segments: 8, rotate: face === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0] })
    : kit.box(out as Vec3, p, pic, { rotate: face === 'x' ? [Math.PI / 4, 0, 0] : [0, 0, Math.PI / 4] });
  return [kit.box(along as Vec3, [at[0] - (face === 'x' ? 0.005 : 0), at[1], at[2] - (face === 'z' ? 0.005 : 0)], 'white'), picture];
}

/** กล่องเสบียง: stacked supply boxes with picture labels. */
export const item: ItemModel = {
  id: 'supply-crate',
  name: 'กล่องเสบียง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      // blue box
      kit.box([0.56, 0.28, 0.56], [-0.12, 0.14, -0.1], 'blue'),
      kit.box([0.6, 0.04, 0.6], [-0.12, 0.26, -0.1], 'navy'),
      kit.box([0.04, 0.28, 0.58], [-0.12, 0.14, -0.1], 'white'),
      // orange box on top
      kit.box([0.42, 0.24, 0.42], [-0.1, 0.4, -0.1], 'orange'),
      kit.box([0.46, 0.04, 0.46], [-0.1, 0.54, -0.1], 'redDark'),
      // small yellow box
      kit.box([0.34, 0.22, 0.34], [0.26, 0.11, 0.26], 'sunYellow'),
      kit.box([0.37, 0.04, 0.37], [0.26, 0.22, 0.26], 'brass'),
      // a round tin on the ground
      kit.cylinder(0.1, 0.1, 0.2, [0.3, 0.1, -0.3], 'teal', { segments: 10 }),
      kit.cylinder(0.105, 0.105, 0.04, [0.3, 0.2, -0.3], 'white', { segments: 10 }),
    ];
    parts.push(...label(kit, [0.17, 0.14, -0.08], 0.18, 'teal', 'disc', 'x'));
    parts.push(...label(kit, [-0.1, 0.14, 0.18], 0.2, 'sunYellow', 'diamond', 'z'));
    parts.push(...label(kit, [0.12, 0.4, -0.1], 0.15, 'red', 'diamond', 'x'));
    parts.push(...label(kit, [0.26, 0.11, 0.43], 0.16, 'blue', 'disc', 'z'));
    return kit.finish(parts);
  },
};
