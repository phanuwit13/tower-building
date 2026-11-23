import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A long glass cake case on a wooden base. Three stepped shelves (high at the back, low at the front) so
// every row of cakes is seen from above; the frame is open chrome with lit glass strips inside.
const BASE_H = 0.24;
const TOP_Y = 0.62;
const CASE = { x: 0.62, z: 1.4 }; // half sizes of the glass frame
const SHELVES = [
  { x: -0.38, y: 0.52 },
  { x: 0, y: 0.4 },
  { x: 0.38, y: 0.28 },
] as const;
const ROW_Z = [-1.05, -0.5, 0, 0.5, 1.05] as const;
const WINDOW = { glow: 'windowWarm', light: 'window' } as const;

/** ตู้เค้กโชว์: a long lit glass cake case with three shelves of cakes and tarts. */
export const item: ItemModel = {
  id: 'cake-display',
  name: 'ตู้เค้กโชว์',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.44, BASE_H - 0.04, 2.84], [0, 0.04 + (BASE_H - 0.04) / 2, 0], 'wood'),
      kit.box([1.48, 0.04, 2.88], [0, 0.02, 0], 'woodDark'),
      kit.box([0.02, 0.14, 2.2], [0.73, 0.14, 0], 'teal'), // front panel
      kit.box([1.4, 0.03, 2.8], [0, BASE_H + 0.015, 0], 'white'), // floor of the case
    ];
    // open chrome frame: corner posts, top rails, and glass at the back and front-low
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([0.04, TOP_Y - BASE_H, 0.04], [sx * CASE.x, (TOP_Y + BASE_H) / 2, sz * CASE.z], 'chrome'));
      }
      parts.push(kit.box([0.04, 0.04, CASE.z * 2 + 0.04], [sx * CASE.x, TOP_Y, 0], 'chrome'));
    }
    for (const sz of [-1, 1]) parts.push(kit.box([CASE.x * 2, 0.04, 0.04], [0, TOP_Y, sz * CASE.z], 'chrome'));
    for (const z of [-0.7, 0, 0.7]) parts.push(kit.box([CASE.x * 2, 0.03, 0.03], [0, TOP_Y, z], 'chrome'));
    // lit glass back (four panes, each a little different) and a low glass front
    for (const z of [-1.05, -0.35, 0.35, 1.05]) {
      parts.push(kit.box([0.025, 0.3, 0.66], [-CASE.x + 0.03, 0.4, z], 'skyBlue', WINDOW));
      parts.push(kit.box([0.025, 0.1, 0.66], [CASE.x - 0.01, BASE_H + 0.1, z], 'skyBlue', WINDOW));
    }
    for (const s of SHELVES) {
      parts.push(kit.box([0.34, 0.03, 2.7], [s.x, s.y - 0.015, 0], 'white'));
      parts.push(kit.box([0.03, 0.025, 2.7], [s.x + 0.165, s.y - 0.012, 0], 'sunYellow')); // shelf edge trim
    }
    // cakes: round cake, tart, strawberry cake, chocolate cake, cupcake (rotating per row)
    SHELVES.forEach((s, row) => {
      ROW_Z.forEach((z, i) => {
        const kind = (i + row) % 5;
        const y = s.y;
        if (kind === 0) {
          parts.push(
            kit.cylinder(0.13, 0.13, 0.08, [s.x, y + 0.04, z], 'white', { segments: 10 }),
            kit.cylinder(0.12, 0.12, 0.03, [s.x, y + 0.095, z], 'pink', { segments: 10 }),
            kit.sphere(0.03, [s.x, y + 0.14, z], 'red', { detail: 0 }),
          );
        } else if (kind === 1) {
          parts.push(
            kit.cylinder(0.13, 0.12, 0.05, [s.x, y + 0.025, z], 'sand', { segments: 10 }),
            kit.cylinder(0.1, 0.1, 0.025, [s.x, y + 0.0625, z], 'sunYellow', { segments: 10 }),
            kit.sphere(0.025, [s.x, y + 0.095, z], 'red', { detail: 0 }),
          );
        } else if (kind === 2) {
          parts.push(
            kit.cylinder(0.13, 0.13, 0.09, [s.x, y + 0.045, z], 'cream', { segments: 10 }),
            kit.cylinder(0.12, 0.12, 0.03, [s.x, y + 0.105, z], 'red', { segments: 10 }),
            kit.sphere(0.03, [s.x, y + 0.15, z], 'white', { detail: 0 }),
          );
        } else if (kind === 3) {
          parts.push(
            kit.cylinder(0.13, 0.13, 0.1, [s.x, y + 0.05, z], 'bark', { segments: 10 }),
            kit.cylinder(0.12, 0.12, 0.025, [s.x, y + 0.1125, z], 'woodDark', { segments: 10 }),
            kit.sphere(0.03, [s.x, y + 0.15, z], 'orange', { detail: 0 }),
          );
        } else {
          parts.push(
            kit.cylinder(0.09, 0.065, 0.07, [s.x, y + 0.035, z], 'mint', { segments: 8 }),
            kit.sphere(0.085, [s.x, y + 0.1, z], 'purple', { detail: 0 }),
          );
        }
      });
    });
    return kit.finish(parts);
  },
};
