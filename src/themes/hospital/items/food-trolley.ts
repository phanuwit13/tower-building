import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A two-level trolley (handle at -z): covered meal trays (domes) on the top deck beside a fruit bowl,
// more covered trays on the lower deck. Chunky colour on every top.
const TOP_Y = 0.75;
const LOW_Y = 0.32;
const LEN = 1.5;
const Z0 = 0.1;
const TRAY: PaletteColor[] = ['orange', 'sunYellow', 'lime', 'pink'];

/** รถเข็นอาหาร: trolley with covered meal trays and a fruit bowl. */
export const item: ItemModel = {
  id: 'food-trolley',
  name: 'รถเข็นอาหาร',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // frame: cream cabinet ends and teal decks
    for (const x of [-0.31, 0.31]) for (const z of [Z0 - LEN / 2 + 0.04, Z0 + LEN / 2 - 0.04]) parts.push(kit.box([0.05, TOP_Y, 0.05], [x, TOP_Y / 2 + 0.05, z], 'chrome'));
    parts.push(
      kit.box([0.72, 0.04, LEN], [0, LOW_Y, Z0], 'stone'),
      kit.box([0.76, 0.05, LEN + 0.04], [0, TOP_Y - 0.025, Z0], 'teal'),
      kit.box([0.04, 0.3, LEN - 0.1], [0.34, LOW_Y + 0.17, Z0], 'mint'),
      kit.box([0.04, 0.3, LEN - 0.1], [-0.34, LOW_Y + 0.17, Z0], 'mint'),
    );
    // handle at -z
    const hz = Z0 - LEN / 2 - 0.02;
    parts.push(
      kit.box([0.04, 0.36, 0.04], [-0.28, 0.93, hz], 'chrome'),
      kit.box([0.04, 0.36, 0.04], [0.28, 0.93, hz], 'chrome'),
      kit.box([0.6, 0.05, 0.05], [0, 1.1, hz], 'orange'),
    );
    for (const x of [-0.33, 0.33]) for (const z of [Z0 - 0.62, Z0 + 0.62]) {
      parts.push(
        kit.cylinder(0.08, 0.08, 0.06, [x, 0.0761, z], 'charcoal', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.035, 0.035, 0.07, [x, 0.0761, z], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.box([0.04, 0.1, 0.04], [x * 0.95, 0.17, z], 'chrome'),
      );
    }
    // covered trays: a coloured tray with a chrome dome and a knob, on both decks
    const tray = (y: number, z: number, c: PaletteColor) => {
      parts.push(
        kit.box([0.5, 0.03, 0.34], [0, y + 0.015, z], c),
        kit.dome(0.16, [0, y + 0.03, z], 'chrome', { segments: 12, scale: [1.4, 0.8, 1] }),
        kit.sphere(0.025, [0, y + 0.03 + 0.16 * 0.8, z], 'sunYellow', { detail: 0 }),
      );
    };
    tray(TOP_Y, Z0 - 0.5, 'orange');
    tray(TOP_Y, Z0 - 0.1, 'lime');
    tray(LOW_Y + 0.02, Z0 - 0.5, 'sunYellow');
    tray(LOW_Y + 0.02, Z0 - 0.1, 'pink');
    tray(LOW_Y + 0.02, Z0 + 0.3, 'skyBlue');
    // fruit bowl on the top deck at +z: stone bowl, apples, an orange, bananas
    const bz = Z0 + 0.42;
    parts.push(
      kit.cylinder(0.2, 0.12, 0.1, [0, TOP_Y + 0.05, bz], 'sunYellow', { segments: 10 }),
      kit.sphere(0.075, [-0.07, TOP_Y + 0.15, bz - 0.05], 'red', { detail: 0 }),
      kit.sphere(0.075, [0.08, TOP_Y + 0.15, bz - 0.03], 'lime', { detail: 0 }),
      kit.sphere(0.07, [0, TOP_Y + 0.15, bz + 0.08], 'orange', { detail: 0 }),
      kit.sphere(0.06, [-0.02, TOP_Y + 0.22, bz], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
