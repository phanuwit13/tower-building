import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, wallPanel, wheel } from '../../../models/parts';

// A pastel camper van parked along z on the -x half (hatch faces +x); a table, stools and a parasol stand beside it.
const VAN = { x: -0.3, w: 0.8, d: 1.4, z: -0.1, y0: 0.14, h: 0.5 };
const CAB = { d: 0.3, h: 0.32 };
const TABLE = { x: 0.6, z: 0.15 };

/** ร้านกาแฟรถตู้: a mint camper van with a serving hatch and a striped awning, and a table with a parasol. */
export const item: ItemModel = {
  id: 'van-cafe',
  name: 'ร้านกาแฟรถตู้',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const hatchX = VAN.x + VAN.w / 2;
    const top = VAN.y0 + VAN.h;
    const frontZ = VAN.z + VAN.d / 2;
    const parts: Part[] = [
      kit.box([VAN.w, VAN.h, VAN.d], [VAN.x, VAN.y0 + VAN.h / 2, VAN.z], 'mint'),
      kit.box([VAN.w + 0.01, 0.06, VAN.d + 0.01], [VAN.x, VAN.y0 + 0.03, VAN.z], 'white'), // lower white band
      kit.box([VAN.w + 0.06, 0.05, VAN.d + 0.06], [VAN.x, top + 0.025, VAN.z], 'pink'), // roof
      kit.box([VAN.w - 0.1, 0.05, VAN.d - 0.2], [VAN.x, top + 0.07, VAN.z], 'white'), // roof box
      // cab at the +z end, lower than the box
      kit.box([VAN.w, CAB.h, CAB.d], [VAN.x, VAN.y0 + CAB.h / 2, frontZ + CAB.d / 2], 'mint'),
      kit.box([VAN.w, 0.04, CAB.d], [VAN.x, VAN.y0 + CAB.h + 0.02, frontZ + CAB.d / 2], 'pink'),
      kit.box([VAN.w + 0.04, 0.1, 0.06], [VAN.x, VAN.y0 + 0.05, frontZ + CAB.d + 0.02], 'stone'), // bumper
      ...glassWindow(kit, { at: [VAN.x, VAN.y0 + 0.2, frontZ + CAB.d], facing: 'z+', w: 0.56, h: 0.16, panes: 3 }),
      ...glassWindow(kit, { at: [hatchX, VAN.y0 + 0.2, frontZ + 0.15], facing: 'x+', w: 0.18, h: 0.16, panes: 1 }),
      kit.sphere(0.035, [VAN.x - 0.28, VAN.y0 + 0.07, frontZ + CAB.d + 0.04], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.035, [VAN.x + 0.28, VAN.y0 + 0.07, frontZ + CAB.d + 0.04], 'lampWarm', { detail: 0, glow: true }),
      // serving hatch on +x: dark opening, wooden counter, striped awning
      ...wallPanel(kit, { at: [hatchX, 0.43, VAN.z - 0.08], facing: 'x+', w: 0.62, h: 0.26, depth: 0.02, color: 'woodDark' }),
      ...glassWindow(kit, { at: [hatchX, 0.43, VAN.z - 0.08], facing: 'x+', w: 0.54, h: 0.18, panes: 3 }),
      ...wallPanel(kit, { at: [hatchX, 0.29, VAN.z - 0.08], facing: 'x+', w: 0.7, h: 0.03, depth: 0.1, color: 'wood' }),
    ];
    // striped awning over the hatch, sloping down away from the van
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([0.22, 0.03, 0.14], [hatchX + 0.1, 0.66, VAN.z - 0.08 - 0.28 + i * 0.14], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -0.35] }));
    }
    // wheels
    for (const wz of [VAN.z - 0.4, VAN.z + 0.55]) {
      for (const sx of [-1, 1]) {
        parts.push(...wheel(kit, { at: [VAN.x + sx * (VAN.w / 2 + 0.01), 0.16, wz], radius: 0.12, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone' }));
      }
    }
    // table, stools and parasol
    parts.push(
      kit.cylinder(0.04, 0.05, 0.3, [TABLE.x, 0.15, TABLE.z], 'woodDark', { segments: 8 }),
      kit.cylinder(0.2, 0.2, 0.04, [TABLE.x, 0.32, TABLE.z], 'wood', { segments: 10 }),
      kit.cylinder(0.02, 0.02, 0.6, [TABLE.x, 0.64, TABLE.z], 'white', { segments: 6 }),
      kit.cone(0.38, 0.17, [TABLE.x, 0.99, TABLE.z], 'red', { segments: 6 }),
      kit.cone(0.38, 0.17, [TABLE.x, 0.99, TABLE.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99] }),
      kit.cylinder(0.05, 0.05, 0.05, [TABLE.x + 0.04, 0.365, TABLE.z + 0.05], 'white', { segments: 8 }), // a cup
      kit.cylinder(0.05, 0.05, 0.05, [TABLE.x - 0.06, 0.365, TABLE.z - 0.07], 'sunYellow', { segments: 8 }),
    );
    for (const [sx, sz] of [[0.0, 0.32], [0.0, -0.32]] as Array<[number, number]>) {
      parts.push(
        kit.cylinder(0.02, 0.02, 0.17, [TABLE.x + 0.3 * 0.0 + sx + 0.05, 0.085, TABLE.z + sz], 'woodDark', { segments: 6 }),
        kit.cylinder(0.08, 0.08, 0.04, [TABLE.x + 0.05, 0.19, TABLE.z + sz], 'orange', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
