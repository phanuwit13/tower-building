import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// 1×1. A small round pool with two toy sailboats.
const POOL = { rim: 0.46, water: 0.4, rimTop: 0.07, top: 0.09 };
/** Boats: [x, z, yaw, hull colour, sail colour]. */
const BOATS: Array<[number, number, number, PaletteColor, PaletteColor]> = [[0.1, 0.1, 0.5, 'red', 'white'], [-0.12, -0.14, 2.4, 'sunYellow', 'orange']];

/** A toy sailboat heading `yaw` (0 = +x): a rounded hull, a mast, a tall sail and a small jib. */
function sailboat(kit: StyleKit, x: number, z: number, yaw: number, hull: PaletteColor, sail: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, POOL.top + up, z - f * s + side * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.1, at(0, 0, 0.03), hull, { scale: [1.6, 0.55, 0.75], rotate }),
    kit.box([0.2, 0.025, 0.1], at(-0.01, 0, 0.08), 'wood', { rotate }), // deck
    kit.cylinder(0.011, 0.011, 0.34, at(0, 0, 0.25), 'woodDark', { segments: 4 }),
    // main sail: a thin triangle in the boat's side plane, tall edge on the mast (apex over the mast end)
    kit.wedge([0.17, 0.27, 0.014], at(-0.1, 0.0, 0.26), sail, { apex: 0.5, rotate }),
    kit.wedge([0.11, 0.2, 0.014], at(0.08, 0.0, 0.2), sail === 'white' ? 'cream' : 'white', { apex: -0.5, rotate }),
    kit.cone(0.025, 0.04, at(0, 0, 0.44), 'sunYellow', { segments: 4 }), // masthead
  ];
}

/** เรือใบจำลอง: a small round pool with two toy sailboats. */
export const item: ItemModel = {
  id: 'toy-sailboat',
  name: 'เรือใบจำลอง',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 0.98], [0, 0.015, 0], 'lime'),
      kit.cylinder(POOL.rim, POOL.rim, POOL.rimTop, [0, POOL.rimTop / 2, 0], 'sunYellow', { segments: 16 }),
      kit.cylinder(POOL.water, POOL.water, POOL.top, [0, POOL.top / 2, 0], 'navy', { segments: 16, motion: { kind: 'water', water: 'pond' } }),
    ];
    for (const [x, z, yaw, hull, sail] of BOATS) parts.push(...sailboat(kit, x, z, yaw, hull, sail));
    // a floating rubber ring and a pad on the water, a daisy by the rim
    parts.push(
      kit.torus(0.06, 0.02, [-0.2, POOL.top + 0.02, 0.2], 'pink', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.07, 0.07, 0.02, [0.22, POOL.top + 0.01, -0.2], 'leaf', { segments: 8 }),
      kit.sphere(0.04, [0.22, POOL.top + 0.04, -0.2], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
