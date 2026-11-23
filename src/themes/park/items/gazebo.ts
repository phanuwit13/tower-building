import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A plain open hexagonal shelter. The cylinder-with-6-sides has its corners on +z and -z, so a flat
// side faces +x: that is the open entrance. Angles `a` below run from +z towards +x.
const R_STEP = 0.96; // stone step ring (corner radius)
const R_DECK = 0.88; // wooden floor
const R_POST = 0.8; // the six posts stand on the corners
const DECK_TOP = 0.08;
const EAVE = 1.0; // top of the posts / underside of the roof beam
const RING = { r: 0.9, h: 0.08 }; // white beam ring the roof sits on
const ROOF = { r: 0.96, h: 0.55 };
const SEAT_Y = 0.31;
const BREATHE = { glow: true, light: 'breathe' } as const;

const at = (a: number, r: number): [number, number] => [r * Math.sin(a), r * Math.cos(a)];

/** ศาลาพักผ่อน: an open hexagonal gazebo with a striped roof, benches and a lamp hanging inside. */
export const item: ItemModel = {
  id: 'gazebo',
  name: 'ศาลาพักผ่อน',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const ringBottom = EAVE;
    const roofBase = ringBottom + RING.h;
    const parts: Part[] = [
      kit.cylinder(R_STEP, R_STEP, 0.04, [0, 0.02, 0], 'stone', { segments: 6 }),
      kit.cylinder(R_DECK, R_DECK, DECK_TOP - 0.04, [0, (DECK_TOP + 0.04) / 2, 0], 'wood', { segments: 6 }),
      kit.cylinder(RING.r, RING.r, RING.h, [0, ringBottom + RING.h / 2, 0], 'white', { segments: 6 }),
      // two cones turned half a face apart give red and white stripes
      kit.cone(ROOF.r, ROOF.h, [0, roofBase + ROOF.h / 2, 0], 'red', { segments: 6 }),
      kit.cone(ROOF.r - 0.01, ROOF.h - 0.008, [0, roofBase + 0.004 + (ROOF.h - 0.008) / 2, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
    ];
    for (let k = 0; k < 6; k++) {
      const [x, z] = at((k * Math.PI) / 3, R_POST);
      parts.push(kit.cylinder(0.04, 0.045, EAVE - DECK_TOP, [x, (EAVE + DECK_TOP) / 2, z], 'white', { segments: 8 }));
    }
    // a round cream mat on the deck that shows the lamp's pool of light at night
    parts.push(kit.cylinder(0.38, 0.38, 0.01, [0, DECK_TOP + 0.005, 0], 'lampWarm', { segments: 12, glow: true }));
    // benches along the three sides away from the entrance, seat on little blocks, plus a low back rail
    for (const deg of [210, 270, 330]) {
      const a = (deg * Math.PI) / 180;
      const [bx, bz] = at(a, 0.6);
      const [rx, rz] = at(a, 0.76);
      parts.push(
        kit.box([0.62, 0.05, 0.2], [bx, SEAT_Y, bz], 'wood', { rotate: [0, a, 0] }),
        kit.box([0.5, 0.2, 0.06], [bx, DECK_TOP + 0.1, bz], 'woodDark', { rotate: [0, a, 0] }),
        kit.box([0.66, 0.1, 0.04], [rx, 0.55, rz], 'wood', { rotate: [0, a, 0] }),
      );
    }
    // three beams cross the ring corner to corner; the lamp hangs from their meeting point
    for (let k = 0; k < 3; k++) {
      parts.push(kit.box([2 * R_POST, 0.05, 0.06], [0, EAVE - 0.025, 0], 'woodDark', { rotate: [0, (k * Math.PI) / 3 + Math.PI / 2, 0] }));
    }
    parts.push(
      kit.cylinder(0.01, 0.01, 0.12, [0, EAVE - 0.1, 0], 'stoneDark', { segments: 4 }),
      kit.cylinder(0.03, 0.07, 0.05, [0, EAVE - 0.185, 0], 'brass', { segments: 8 }),
      kit.sphere(0.1, [0, EAVE - 0.3, 0], 'lampWarm', BREATHE),
    );
    // two small lanterns at the entrance posts, so the light shows from the front too
    for (const deg of [60, 120]) {
      const [x, z] = at((deg * Math.PI) / 180, R_POST - 0.1);
      parts.push(
        kit.cylinder(0.01, 0.01, 0.1, [x, EAVE - 0.05, z], 'stoneDark', { segments: 4 }),
        kit.sphere(0.065, [x, EAVE - 0.14, z], 'lampWarm', { ...BREATHE, detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
