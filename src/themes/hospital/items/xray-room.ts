import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An x-ray table with a ceiling-style arm swinging over it, and a lightbox stand at the back showing a
// teddy bear's x-ray outline (a simple silhouette, no bones). The lightbox faces +z.
const MAT = 0.03;
const TABLE = { x: 0, z: 0.4, w: 1.3, d: 0.6, top: 0.5 };
const ARM = { x: -0.85, y: 1.5 }; // column position (at table z) and arm height
const BOX = { z: -0.8, w: 1.0, h: 0.7, y0: 0.55 }; // lightbox panel

/** ห้องเอกซเรย์: x-ray table, an arm with a lamp head, and a lightbox with a teddy bear x-ray picture. */
export const item: ItemModel = {
  id: 'xray-room',
  name: 'ห้องเอกซเรย์',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const tz = TABLE.z;
    const parts: Part[] = [
      kit.box([1.9, MAT, 1.9], [0, MAT / 2, 0], 'mint'),
      // table: pedestal, mattress slab, soft pad
      kit.box([0.9, 0.38, 0.4], [TABLE.x, MAT + 0.19, tz], 'teal'),
      kit.box([TABLE.w, 0.08, TABLE.d], [TABLE.x, TABLE.top - 0.08, tz], 'stone'),
      kit.box([TABLE.w - 0.06, 0.04, TABLE.d - 0.06], [TABLE.x, TABLE.top - 0.02, tz], 'blue'),
      kit.sphere(0.1, [0.5, TABLE.top + 0.04, tz], 'pink', { scale: [1.2, 0.5, 1.4] }), // little pillow
      // arm: column, horizontal beam, head with a glowing lens
      kit.box([0.16, ARM.y, 0.16], [ARM.x, ARM.y / 2 + MAT * 0, tz], 'stone'),
      kit.box([0.22, 0.08, 0.22], [ARM.x, 0.04, tz], 'teal'),
      kit.box([0.95, 0.12, 0.14], [ARM.x + 0.47, ARM.y - 0.06, tz], 'stone'),
      kit.box([0.5, 0.26, 0.5], [0.0, ARM.y - 0.2, tz], 'teal'),
      kit.box([0.4, 0.03, 0.4], [0.0, ARM.y - 0.34, tz], 'skyBlue'),
      kit.cylinder(0.05, 0.05, 0.1, [0.0, ARM.y - 0.07, tz], 'chrome', { segments: 8 }),
      // lightbox: two legs, a frame, a glowing blue panel
      kit.box([0.08, BOX.y0, 0.08], [-0.42, BOX.y0 / 2, BOX.z], 'stoneDark'),
      kit.box([0.08, BOX.y0, 0.08], [0.42, BOX.y0 / 2, BOX.z], 'stoneDark'),
    ];
    // lightbox frame and glowing deep-blue panel, leaning back towards -z so the camera sees them
    const TILT = -0.3;
    const cy = BOX.y0 + BOX.h / 2;
    /** A point on the tilted panel: dx across, dy up its face, dz out of it. */
    const P = (dx: number, dy: number, dz: number): [number, number, number] => [
      dx,
      cy + dy * Math.cos(TILT) - dz * Math.sin(TILT),
      BOX.z + dy * Math.sin(TILT) + dz * Math.cos(TILT),
    ];
    parts.push(
      kit.box([BOX.w, BOX.h + 0.1, 0.07], P(0, 0, 0), 'teal', { rotate: [TILT, 0, 0] }),
      kit.box([BOX.w - 0.1, BOX.h - 0.06, 0.03], P(0, 0, 0.04), 'blue', { glow: true, light: 'window', rotate: [TILT, 0, 0] }),
    );
    // teddy bear x-ray silhouette: a bold light shape on the panel, with navy eyes and nose
    const blob = (r: number, dx: number, dy: number, detail: 0 | 1, sx = 1, sy = 1) =>
      parts.push(kit.sphere(r, P(dx, dy, 0.07), 'glassBlue', { detail, scale: [sx, sy, 0.15], rotate: [TILT, 0, 0] }));
    blob(0.2, 0, -0.1, 1, 1.0, 1.15); // body
    blob(0.15, 0, 0.14, 1); // head
    blob(0.065, -0.12, 0.26, 0); // ears
    blob(0.065, 0.12, 0.26, 0);
    blob(0.07, -0.26, -0.04, 0, 1, 1.5); // arms
    blob(0.07, 0.26, -0.04, 0, 1, 1.5);
    blob(0.08, -0.12, -0.3, 0, 1, 1.3); // legs
    blob(0.08, 0.12, -0.3, 0, 1, 1.3);
    for (const dx of [-0.055, 0.055]) parts.push(kit.sphere(0.022, P(dx, 0.17, 0.095), 'navy', { detail: 0, rotate: [TILT, 0, 0] }));
    parts.push(kit.sphere(0.035, P(0, 0.11, 0.095), 'navy', { detail: 0, scale: [1.3, 0.8, 0.6], rotate: [TILT, 0, 0] })); // nose
    return kit.finish(parts);
  },
};
