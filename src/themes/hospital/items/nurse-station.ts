import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// An L-shaped counter: the long side runs along z, a short arm turns towards +x at the -z end.
// On top: two screens (lit, facing +x), file trays, a phone and a desk lamp. A potted plant fills the corner.
const TOP_Y = 0.62;
const MAIN = { x: -0.5, w: 0.8, d: 2.8 }; // long counter body
const ARM = { x: 0.4, z: -1.1, w: 1.0, d: 0.6 }; // short arm body
const SLAB_T = 0.04;

/** A screen on a little stand, face to +x: the face is lit like a window. */
function screen(kit: StyleKit, x: number, y: number, z: number): Part[] {
  return [
    kit.box([0.14, 0.02, 0.14], [x, y + 0.01, z], 'white'),
    kit.cylinder(0.03, 0.03, 0.08, [x, y + 0.06, z], 'chrome', { segments: 8 }),
    kit.box([0.04, 0.2, 0.28], [x, y + 0.2, z], 'charcoal'),
    kit.box([0.02, 0.16, 0.24], [x + 0.025, y + 0.2, z], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
    kit.box([0.01, 0.03, 0.12], [x + 0.045, y + 0.25, z - 0.04], 'white'),
    kit.box([0.01, 0.03, 0.18], [x + 0.045, y + 0.19, z], 'mint'),
    kit.box([0.01, 0.03, 0.08], [x + 0.045, y + 0.13, z + 0.05], 'pink'),
  ];
}

/** เคาน์เตอร์พยาบาล: an L-shaped counter with screens, file trays, a phone and a desk lamp. */
export const item: ItemModel = {
  id: 'nurse-station',
  name: 'เคาน์เตอร์พยาบาล',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      // long counter
      kit.box([MAIN.w + 0.04, 0.04, MAIN.d + 0.04], [MAIN.x, 0.02, 0], 'stoneDark'),
      kit.box([MAIN.w, TOP_Y - SLAB_T - 0.04, MAIN.d], [MAIN.x, 0.04 + (TOP_Y - SLAB_T - 0.04) / 2, 0], 'mint'),
      kit.box([MAIN.w + 0.12, SLAB_T, MAIN.d + 0.1], [MAIN.x + 0.02, TOP_Y - SLAB_T / 2, 0], 'white'),
      // arm
      kit.box([ARM.w + 0.04, 0.04, ARM.d + 0.04], [ARM.x, 0.02, ARM.z], 'stoneDark'),
      kit.box([ARM.w, TOP_Y - SLAB_T - 0.04, ARM.d], [ARM.x, 0.04 + (TOP_Y - SLAB_T - 0.04) / 2, ARM.z], 'mint'),
      kit.box([ARM.w + 0.08, SLAB_T, ARM.d + 0.1], [ARM.x + 0.02, TOP_Y - SLAB_T / 2, ARM.z], 'white'),
    ];
    // front colour panels on the +x face of the long side and the +z face of the arm
    for (const z of [-0.45, 0.3, 1.0]) parts.push(kit.box([0.02, 0.34, 0.55], [MAIN.x + MAIN.w / 2 + 0.01, 0.3, z], 'teal'));
    for (const x of [0.15, 0.65]) parts.push(kit.box([0.45, 0.34, 0.02], [x, 0.3, ARM.z + ARM.d / 2 + 0.01], 'sunYellow'));

    // two screens on the long counter
    parts.push(...screen(kit, -0.6, TOP_Y, -0.35), ...screen(kit, -0.6, TOP_Y, 0.55));

    // file trays on the arm: three stacked trays with paper
    const tx = 0.55;
    const tz = ARM.z;
    (['sunYellow', 'pink', 'skyBlue'] as const).forEach((c, i) => {
      const y = TOP_Y + 0.02 + i * 0.06;
      parts.push(kit.box([0.28, 0.03, 0.22], [tx, y, tz], c), kit.box([0.24, 0.02, 0.18], [tx, y + 0.02, tz], 'white'));
    });
    // a second small stack of folders
    parts.push(
      kit.box([0.2, 0.04, 0.26], [0.1, TOP_Y + 0.02, tz], 'mint'),
      kit.box([0.2, 0.04, 0.26], [0.1, TOP_Y + 0.06, tz], 'lime'),
      kit.box([0.18, 0.015, 0.22], [0.1, TOP_Y + 0.0875, tz], 'white'),
    );

    // phone: base, handset, big buttons
    parts.push(
      kit.box([0.18, 0.05, 0.2], [-0.55, TOP_Y + 0.025, 1.05], 'blue'),
      kit.box([0.06, 0.04, 0.2], [-0.5, TOP_Y + 0.07, 1.05], 'skyBlue'),
      kit.box([0.06, 0.012, 0.06], [-0.62, TOP_Y + 0.056, 1.05], 'white'),
    );

    // desk lamp (the bulb glows softly)
    parts.push(
      kit.cylinder(0.07, 0.08, 0.03, [-0.8, TOP_Y + 0.015, -1.2], 'chrome', { segments: 8 }),
      kit.cylinder(0.015, 0.015, 0.26, [-0.8, TOP_Y + 0.16, -1.2], 'chrome', { segments: 6 }),
      kit.dome(0.1, [-0.8, TOP_Y + 0.26, -1.2], 'teal', { segments: 8 }),
      kit.sphere(0.04, [-0.8, TOP_Y + 0.26, -1.2], 'lampWarm', { detail: 0, glow: true, light: 'window' }),
    );

    // plant in the corner by the arm
    parts.push(
      kit.cylinder(0.14, 0.1, 0.2, [0.7, 0.1, 0.75], 'terracotta', { segments: 8 }),
      kit.sphere(0.2, [0.7, 0.36, 0.75], 'leaf', { detail: 0 }),
      kit.sphere(0.14, [0.62, 0.52, 0.7], 'lime', { detail: 0 }),
      kit.sphere(0.13, [0.78, 0.5, 0.82], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
