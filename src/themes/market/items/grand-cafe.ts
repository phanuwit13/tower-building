import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// A two-storey café (2×3, long side along z, front on +x): the building at the back, a terrace with
// tables and string bulbs in front, and an orange cup neon on a sign board above the roof.
const B = { x0: -0.9, x1: 0.1, z: 1.4, top: 1.3 }; // building: x range, half length, wall top
const DECK = { x0: 0.1, x1: 0.97, h: 0.03 };
const TABLE_Z = [-0.85, 0, 0.85];
const TABLE_X = 0.55;
const BULB_Y = 0.85;

/** ร้านกาแฟหลังใหญ่: a two-storey café with a terrace, tables and string bulbs. */
export const item: ItemModel = {
  id: 'grand-cafe',
  name: 'ร้านกาแฟหลังใหญ่',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const cx = (B.x0 + B.x1) / 2;
    const parts: Part[] = [
      kit.box([B.x1 - B.x0 + 0.04, 0.05, 2 * B.z + 0.04], [cx, 0.025, 0], 'stone'),
      kit.box([B.x1 - B.x0, B.top - 0.05, 2 * B.z], [cx, (0.05 + B.top) / 2, 0], 'cream'),
      // a roof slab with a terracotta edge, and a cornice band between the floors
      kit.box([B.x1 - B.x0 + 0.1, 0.07, 2 * B.z + 0.1], [cx, B.top + 0.035, 0], 'terracotta'),
      kit.box([B.x1 - B.x0 + 0.02, 0.06, 2 * B.z + 0.02], [cx, 0.68, 0], 'woodDark'),
      // the terrace deck
      kit.box([DECK.x1 - DECK.x0, DECK.h, 2 * B.z], [(DECK.x0 + DECK.x1) / 2, DECK.h / 2, 0], 'wood'),
      // sign board standing on the roof, a cup neon on its front
      kit.box([0.05, 0.5, 1.1], [-0.35, B.top + 0.07 + 0.25, 0], 'navy'),
      kit.box([0.05, 0.05, 1.1], [-0.35, B.top + 0.07 + 0.52, 0], 'woodDark'),
      // the cup (glowing orange), its handle, a saucer and two steam curls
      kit.box([0.03, 0.2, 0.24], [-0.31, B.top + 0.32, 0], 'orange', { glow: true }),
      kit.torus(0.07, 0.022, [-0.31, B.top + 0.32, 0.17], 'orange', { glow: true, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.03, 0.035, 0.38], [-0.31, B.top + 0.2, 0], 'orange', { glow: true }),
      kit.box([0.03, 0.12, 0.035], [-0.31, B.top + 0.52, -0.06], 'orange', { glow: true }),
      kit.box([0.03, 0.12, 0.035], [-0.31, B.top + 0.52, 0.06], 'orange', { glow: true }),
      // ground floor: two big windows and a door; upper floor: three windows
      ...glassWindow(kit, { at: [B.x1, 0.38, -0.9], facing: 'x+', w: 0.7, h: 0.4, panes: 3 }),
      ...glassWindow(kit, { at: [B.x1, 0.38, 0.9], facing: 'x+', w: 0.7, h: 0.4, panes: 3 }),
      ...door(kit, { at: [B.x1, 0.3, 0], facing: 'x+', w: 0.3, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [B.x1, 0.98, -0.9], facing: 'x+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [B.x1, 0.98, 0], facing: 'x+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [B.x1, 0.98, 0.9], facing: 'x+', w: 0.5, h: 0.3 }),
      // the sides and the back
      ...glassWindow(kit, { at: [-0.4, 0.4, B.z], facing: 'z+', w: 0.5, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.4, 0.98, B.z], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [-0.4, 0.4, -B.z], facing: 'z-', w: 0.5, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.4, 0.98, -B.z], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [B.x0, 0.4, -0.7], facing: 'x-', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [B.x0, 0.4, 0.7], facing: 'x-', w: 0.7, h: 0.4 }),
      ...glassWindow(kit, { at: [B.x0, 0.98, 0], facing: 'x-', w: 0.9, h: 0.3, panes: 3 }),
      ...wallPanel(kit, { at: [B.x1, 0.68, 0], facing: 'x+', w: 2.6, h: 0.08, depth: 0.04, color: 'woodDark' }),
    ];
    // terrace: round tables, each with two chairs, and a bulb post line on the outer edge
    const chairColors = ['red', 'teal', 'sunYellow'] as const;
    TABLE_Z.forEach((z, i) => {
      parts.push(
        kit.cylinder(0.04, 0.07, 0.26, [TABLE_X, DECK.h + 0.13, z], 'charcoal', { segments: 8 }),
        kit.cylinder(0.17, 0.17, 0.035, [TABLE_X, DECK.h + 0.275, z], 'white', { segments: 10 }),
      );
      for (const dx of [-0.26, 0.26]) {
        const cx2 = TABLE_X + dx;
        parts.push(
          kit.box([0.12, 0.17, 0.12], [cx2, DECK.h + 0.085, z], 'charcoal'),
          kit.box([0.17, 0.03, 0.17], [cx2, DECK.h + 0.185, z], chairColors[i]),
          kit.box([0.03, 0.14, 0.17], [cx2 + Math.sign(dx) * 0.07, DECK.h + 0.27, z], chairColors[i]),
        );
      }
    });
    // poles and a string of bulbs along the outer edge, plus lines back to the café wall
    const POLE_Z = [-1.35, -0.45, 0.45, 1.35];
    for (const z of POLE_Z) {
      parts.push(kit.cylinder(0.025, 0.025, BULB_Y, [0.93, DECK.h + BULB_Y / 2, z], 'woodDark', { segments: 6 }));
      parts.push(kit.box([0.84, 0.025, 0.025], [0.52, DECK.h + BULB_Y, z], 'woodDark'));
    }
    const N = 15;
    for (let i = 0; i < N; i++) {
      const z = -1.35 + (2.7 * i) / (N - 1);
      parts.push(kit.sphere(0.035, [0.93, DECK.h + BULB_Y - 0.03, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    }
    parts.push(kit.box([0.025, 0.025, 2.7], [0.93, DECK.h + BULB_Y, 0], 'woodDark'));
    return kit.finish(parts);
  },
};
