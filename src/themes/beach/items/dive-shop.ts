import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof, glassWindow, wallPanel, rod } from '../../../models/parts';

// A small teal-roofed kiosk (back half, -z) with a service window facing +x, and a wooden rack on the front half
// (+z) holding masks, snorkels and flippers.
const KIOSK = { x: 0, z: -0.45, w: 0.76, d: 0.9, h: 0.58 };
const FRONT = KIOSK.x + KIOSK.w / 2;
const RACK = { x: 0.12, z: 0.55, w: 0.8, h: 0.62 }; // board standing on two legs, faces +x

/** ร้านอุปกรณ์ดำน้ำ: a kiosk with a rack of masks, snorkels and flippers. */
export const item: ItemModel = {
  id: 'dive-shop',
  name: 'ร้านอุปกรณ์ดำน้ำ',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([KIOSK.w, KIOSK.h, KIOSK.d], [KIOSK.x, KIOSK.h / 2, KIOSK.z], 'cream'),
      ...gableRoof(kit, { at: [KIOSK.x, KIOSK.h, KIOSK.z], length: KIOSK.d + 0.08, width: KIOSK.w, rise: 0.2, eave: 0.05, color: 'teal', ridge: 'stone' }),
      kit.wedge([KIOSK.w, 0.2, KIOSK.d - 0.02], [KIOSK.x, KIOSK.h + 0.1, KIOSK.z], 'cream'),
      ...glassWindow(kit, { at: [FRONT, 0.3, KIOSK.z], facing: 'x+', w: 0.46, h: 0.2, panes: 2 }),
      kit.box([0.1, 0.04, 0.56], [FRONT + 0.05, 0.17, KIOSK.z], 'woodDark'), // counter shelf under the window
      ...wallPanel(kit, { at: [FRONT, 0.5, KIOSK.z], facing: 'x+', w: 0.56, h: 0.09, depth: 0.03, color: 'blue' }),
      kit.cylinder(0.035, 0.035, 0.02, [FRONT + 0.04, 0.5, KIOSK.z], 'white', { segments: 8, rotate: [0, 0, Math.PI / 2] }), // sign: a white round mask
    ];
    // the rack: a board on two posts with a top and a lower hanging bar
    const boardY = 0.14 + RACK.h / 2;
    parts.push(
      kit.box([0.05, RACK.h, RACK.w], [RACK.x, boardY, RACK.z], 'wood'),
      kit.box([0.12, 0.04, RACK.w + 0.06], [RACK.x, 0.14 + RACK.h + 0.02, RACK.z], 'woodDark'),
      kit.box([0.1, 0.14, 0.06], [RACK.x, 0.07, RACK.z - RACK.w / 2 + 0.06], 'woodDark'),
      kit.box([0.1, 0.14, 0.06], [RACK.x, 0.07, RACK.z + RACK.w / 2 - 0.06], 'woodDark'),
    );
    const fx = RACK.x + 0.025;
    // two masks: a blue frame ring round a glass pane, with a strap, on pegs at the top
    for (const z of [RACK.z - 0.27, RACK.z + 0.05]) {
      parts.push(
        kit.torus(0.07, 0.016, [fx + 0.016, 0.62, z], 'blue', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0], scale: [1, 0.75, 1] }),
        kit.cylinder(0.062, 0.062, 0.012, [fx + 0.008, 0.62, z], 'skyBlue', { segments: 8, rotate: [0, 0, Math.PI / 2], scale: [1, 1, 0.75] }),
      );
    }
    // two snorkels: a chrome tube with an orange mouthpiece at the foot
    for (const z of [RACK.z + 0.28, RACK.z + 0.36]) {
      parts.push(
        rod(kit, [fx + 0.02, 0.4, z], [fx + 0.02, 0.74, z], 0.013, 'chrome', { segments: 6 }),
        kit.box([0.03, 0.03, 0.05], [fx + 0.03, 0.4, z], 'orange'),
      );
    }
    // flippers: three pairs of long flat blades with a darker foot pocket, hanging from the lower bar
    const colors = ['sunYellow', 'pink', 'mint'] as const;
    colors.forEach((c, i) => {
      const z = RACK.z - 0.3 + i * 0.3;
      parts.push(
        kit.box([0.02, 0.24, 0.1], [fx + 0.012, 0.27, z], c),
        kit.box([0.025, 0.06, 0.07], [fx + 0.014, 0.4, z], 'charcoal'),
      );
    });
    return kit.finish(parts);
  },
};
