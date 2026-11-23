import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';
import type { PaletteColor } from '../../../models/palette';

// A wire of paper lanterns (1×2) between two wooden posts: red and white lanterns alternate and glow softly (no drinks, no text).
const POST_Z = 0.82;
const POST_H = 1.5;
const WIRE_END_Y = 1.42;
const SAG = 0.14;
const LANTERNS = 6;
const LANTERN_H = 0.26;
const LANTERN_R = 0.11;

const wireY = (u: number) => WIRE_END_Y - SAG * (1 - (2 * u - 1) ** 2); // u 0..1 along the wire, deepest in the middle

/** แถวโคมกระดาษ: red and white paper lanterns that breathe. */
export const item: ItemModel = {
  id: 'lantern-row',
  name: 'แถวโคมกระดาษ',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.7, 0.03, 1.95], [0, 0.015, 0], 'stone')];
    for (const s of [-1, 1]) {
      parts.push(kit.cylinder(0.14, 0.16, 0.08, [0, 0.07, s * POST_Z], 'stoneDark', { segments: 8 }));
      parts.push(kit.cylinder(0.05, 0.06, POST_H, [0, 0.03 + POST_H / 2, s * POST_Z], 'woodDark', { segments: 8 }));
      parts.push(kit.sphere(0.06, [0, 0.03 + POST_H + 0.03, s * POST_Z], 'brass', { detail: 0 }));
    }
    // the wire as a polyline
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const u0 = i / steps;
      const u1 = (i + 1) / steps;
      parts.push(rod(kit, [0, wireY(u0), -POST_Z + 2 * POST_Z * u0], [0, wireY(u1), -POST_Z + 2 * POST_Z * u1], 0.015, 'charcoal', { segments: 4 }));
    }
    for (let i = 0; i < LANTERNS; i++) {
      const u = (i + 0.5) / LANTERNS;
      const z = -POST_Z + 2 * POST_Z * u;
      const topY = wireY(u) - 0.05;
      const cy = topY - LANTERN_H / 2;
      const red = i % 2 === 0;
      const body: PaletteColor = red ? 'red' : 'white';
      parts.push(kit.cylinder(0.012, 0.012, 0.06, [0, wireY(u) - 0.025, z], 'charcoal', { segments: 4 }));
      parts.push(kit.cylinder(0.07, 0.07, 0.03, [0, topY - 0.015, z], 'charcoal', { segments: 8 }));
      parts.push(kit.cylinder(0.07, 0.07, 0.03, [0, topY - LANTERN_H + 0.015, z], 'charcoal', { segments: 8 }));
      // the paper body bulges: a squashed 8-sided drum, glowing from inside
      parts.push(kit.cylinder(LANTERN_R, LANTERN_R, LANTERN_H - 0.06, [0, cy, z], body, { segments: 8, glow: red ? 'red' : 'lampWarm', light: 'breathe' }));
      parts.push(kit.box([LANTERN_R * 2.05, 0.02, LANTERN_R * 2.05], [0, cy, z], red ? 'sunYellow' : 'redDark'));
      parts.push(kit.cylinder(0.012, 0.012, 0.1, [0, topY - LANTERN_H - 0.05, z], red ? 'sunYellow' : 'red', { segments: 4 })); // tassel
    }
    return kit.finish(parts);
  },
};
