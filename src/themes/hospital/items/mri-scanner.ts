import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A big, friendly mint ring painted with stars, standing on a teal base, with a lit ring round the hole
// and a padded bed that slides in from the +z end. The ring's axis runs along z, so the stars and lit
// rings show on both ends.
const RING = { R: 0.5, t: 0.2, cy: 0.9, cz: -0.55 };
const BASE = { w: 1.5, h: 0.3, d: 1.1 };
const BED = { z0: -1.05, z1: 1.35, w: 0.34, top: 0.64 }; // the slab; the pad sits on it
const STAR = 0.12;
const STAR_COLORS: readonly PaletteColor[] = ['sunYellow', 'pink', 'orange'];
const STARS = 6;

/** เครื่องสแกน: a friendly ring scanner with a sliding bed, painted with stars, lit ring (no text, no scary parts). */
export const item: ItemModel = {
  id: 'mri-scanner',
  name: 'เครื่องสแกน',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const { R, t, cy, cz } = RING;
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, cz], 'teal'),
      kit.box([BASE.w + 0.02, 0.05, BASE.d + 0.02], [0, 0.17, cz], 'skyBlue'), // a stripe round the base
      kit.torus(R, t, [0, cy, cz], 'mint', { radialSegments: 8, tubularSegments: 16 }),
    ];
    // stars painted on both faces of the ring, and the lit ring just inside each face
    for (const side of [1, -1]) {
      for (let i = 0; i < STARS; i++) {
        const a = (i / STARS) * Math.PI * 2 + (side === 1 ? 0.3 : 0.9);
        const at = (r: number): [number, number, number] => [r * Math.cos(a), cy + r * Math.sin(a), cz + side * (t + 0.006)];
        const col = STAR_COLORS[i % STAR_COLORS.length];
        parts.push(
          kit.box([STAR, STAR * 0.32, 0.012], at(R), col, { rotate: [0, 0, a] }),
          kit.box([STAR * 0.32, STAR, 0.012], at(R), col, { rotate: [0, 0, a] }),
          kit.box([STAR * 0.85, STAR * 0.3, 0.012], at(R), col, { rotate: [0, 0, a + Math.PI / 4] }),
          kit.box([STAR * 0.3, STAR * 0.85, 0.012], at(R), col, { rotate: [0, 0, a + Math.PI / 4] }),
        );
      }
      parts.push(kit.torus(0.34, 0.03, [0, cy, cz + side * 0.115], 'skyBlue', { radialSegments: 4, tubularSegments: 16, glow: true, light: 'window' }));
    }
    // the sliding bed: a slab, a soft pad, a pillow, and a pedestal outside the ring
    const len = BED.z1 - BED.z0;
    const zc = (BED.z0 + BED.z1) / 2;
    parts.push(
      kit.box([BED.w, 0.08, len], [0, BED.top - 0.04, zc], 'stone'),
      kit.box([BED.w - 0.04, 0.05, len - 0.3], [0, BED.top + 0.025, zc], 'blue'),
      kit.sphere(0.13, [0, BED.top + 0.1, BED.z1 - 0.2], 'pink', { scale: [1.3, 0.55, 0.9] }),
      kit.box([0.5, BED.top - 0.08, 0.8], [0, (BED.top - 0.08) / 2, 0.75], 'teal'),
      kit.box([0.56, 0.05, 0.86], [0, 0.025, 0.75], 'skyBlue'),
    );
    return kit.finish(parts);
  },
};
