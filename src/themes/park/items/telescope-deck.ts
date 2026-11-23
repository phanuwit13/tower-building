import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim, wallPanel } from '../../../models/parts';

// A small wooden viewing deck (1x2, long side along z): planks on a low frame, a railing round three sides, a
// step down at the +z end, and a coin telescope on a pedestal aimed out over the +x rail.
const DECK = { x: 0.9, z: 1.8, h: 0.14 };
const RAIL = { top: DECK.h + 0.44, post: 0.04, x: 0.4, z: 0.85 };
const SCOPE = { x: 0.0, z: -0.25 };

/** จุดชมวิว: a wooden deck with a railing and a coin telescope. */
export const item: ItemModel = {
  id: 'telescope-deck',
  name: 'จุดชมวิว',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.x, DECK.h, DECK.z], [0, DECK.h / 2, 0], 'wood'),
      kit.box([DECK.x - 0.1, 0.02, DECK.z - 0.1], [0, DECK.h + 0.01, 0], 'woodDark'), // a darker board panel under the planks
    ];
    // plank lines: thin raised strips across the deck
    for (let i = 0; i < 9; i++) parts.push(kit.box([DECK.x - 0.08, 0.01, 0.02], [0, DECK.h + 0.025, -0.8 + i * 0.2], 'wood'));
    // railing: posts at the corners and midpoints of the -x, +x and -z sides, two rails along each
    const posts: Array<[number, number]> = [
      [-RAIL.x, -RAIL.z], [-RAIL.x, 0], [-RAIL.x, RAIL.z], [RAIL.x, -RAIL.z], [RAIL.x, 0], [RAIL.x, RAIL.z], [0, -RAIL.z],
    ];
    for (const [x, z] of posts) parts.push(kit.box([RAIL.post, RAIL.top - DECK.h, RAIL.post], [x, (RAIL.top + DECK.h) / 2, z], 'woodDark'));
    for (const y of [RAIL.top - 0.03, RAIL.top - 0.2]) {
      for (const x of [-RAIL.x, RAIL.x]) parts.push(kit.box([0.03, 0.03, 2 * RAIL.z], [x, y, 0], 'wood'));
      parts.push(kit.box([2 * RAIL.x, 0.03, 0.03], [0, y, -RAIL.z], 'wood'));
    }
    // a step at the +z end
    parts.push(kit.box([0.5, 0.07, 0.1], [0, 0.035, DECK.z / 2 + 0.05], 'stone'));
    // the coin telescope: a pedestal, a coin box, a tilted tube with an eyepiece and a lens cap
    const base = DECK.h + 0.02;
    const pivot: [number, number, number] = [SCOPE.x, base + 0.55, SCOPE.z];
    const dir: [number, number, number] = [0.85, 0.5, 0.0];
    const len = Math.hypot(...dir);
    const unit = dir.map((v) => v / len) as [number, number, number];
    const mid = (s: number): [number, number, number] => [pivot[0] + unit[0] * s, pivot[1] + unit[1] * s, pivot[2] + unit[2] * s];
    parts.push(
      kit.cylinder(0.09, 0.09, 0.03, [SCOPE.x, base - 0.005 + 0.015, SCOPE.z], 'charcoal', { segments: 8 }),
      kit.cylinder(0.04, 0.05, 0.4, [SCOPE.x, base + 0.2, SCOPE.z], 'chrome', { segments: 8 }),
      kit.box([0.13, 0.1, 0.13], [SCOPE.x, base + 0.45, SCOPE.z], 'sunYellow'),
      ...wallPanel(kit, { at: [SCOPE.x + 0.065, base + 0.45, SCOPE.z], facing: 'x+', w: 0.05, h: 0.05, depth: 0.02, color: 'brass' }), // the coin slot
      kit.sphere(0.06, pivot, 'blue', { detail: 0 }),
      kit.cylinder(0.05, 0.06, 0.4, mid(0.17), 'blue', { segments: 8, rotate: aim(dir) }),
      kit.cylinder(0.065, 0.065, 0.04, mid(0.4), 'navy', { segments: 8, rotate: aim(dir) }), // front lens ring
      kit.cylinder(0.03, 0.03, 0.12, mid(-0.1), 'chrome', { segments: 8, rotate: aim(dir) }), // eyepiece
    );
    return kit.finish(parts);
  },
};
