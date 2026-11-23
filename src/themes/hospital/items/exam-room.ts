import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An exam bed with a paper roll (head at -z), a doctor's desk with a computer and a clipboard,
// a stool, and a folding screen of three pastel panels.
const BED = { x: -0.5, z: -0.35, w: 0.7, d: 1.2 };
const BED_TOP = 0.5;
const DESK = { x: 0.52, z: 0.62, w: 0.7, d: 0.5 }; // top at 0.5
const SCREEN_X = 0.78;

/** ห้องตรวจ: an exam bed with a paper roll, a doctor's desk and a folding screen. */
export const item: ItemModel = {
  id: 'exam-room',
  name: 'ห้องตรวจ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // exam bed: base cabinet, padded top, paper sheet, raised head pad, paper roll
      kit.box([BED.w - 0.1, 0.34, BED.d - 0.1], [BED.x, 0.19, BED.z], 'white'),
      kit.box([BED.w, 0.1, BED.d], [BED.x, BED_TOP - 0.1, BED.z], 'teal'),
      kit.box([BED.w - 0.06, 0.04, BED.d - 0.06], [BED.x, BED_TOP - 0.03, BED.z], 'mint'),
      kit.box([BED.w - 0.16, 0.01, BED.d - 0.3], [BED.x, BED_TOP - 0.005, BED.z + 0.12], 'white'),
      kit.box([BED.w - 0.1, 0.1, 0.28], [BED.x, BED_TOP + 0.04, BED.z - 0.36], 'teal', { rotate: [0.18, 0, 0] }),
      kit.cylinder(0.065, 0.065, BED.w - 0.04, [BED.x, BED_TOP + 0.09, BED.z - 0.53], 'white', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.025, 0.025, BED.w, [BED.x, BED_TOP + 0.09, BED.z - 0.53], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.box([BED.w - 0.1, 0.012, 0.1], [BED.x, BED_TOP + 0.006, BED.z - 0.52], 'white'),
      // drawer fronts with knobs on the +x face
      kit.box([0.02, 0.13, 0.4], [BED.x + BED.w / 2 - 0.04, 0.12, BED.z + 0.1], 'sunYellow'),
      kit.box([0.02, 0.13, 0.4], [BED.x + BED.w / 2 - 0.04, 0.27, BED.z + 0.1], 'pink'),
    ];
    // step stool at the foot of the bed
    parts.push(kit.box([0.26, 0.14, 0.2], [BED.x, 0.07, BED.z + BED.d / 2 + 0.2], 'sunYellow'));

    // doctor's desk (top 0.5): two pedestals, a top slab, a screen, a clipboard, a mug
    parts.push(
      kit.box([0.2, 0.44, DESK.d - 0.04], [DESK.x - DESK.w / 2 + 0.12, 0.22, DESK.z], 'wood'),
      kit.box([0.2, 0.44, DESK.d - 0.04], [DESK.x + DESK.w / 2 - 0.12, 0.22, DESK.z], 'wood'),
      kit.box([DESK.w, 0.04, DESK.d], [DESK.x, 0.48, DESK.z], 'cream'),
      kit.box([0.02, 0.11, 0.14], [DESK.x + DESK.w / 2 - 0.1, 0.18, DESK.z], 'sand'),
      // computer: stand, frame and a pale-blue face (no light: the day is the same all day)
      kit.box([0.12, 0.02, 0.12], [DESK.x - 0.1, BED_TOP + 0.01, DESK.z - 0.1], 'white'),
      kit.cylinder(0.025, 0.025, 0.08, [DESK.x - 0.1, BED_TOP + 0.06, DESK.z - 0.1], 'chrome', { segments: 6 }),
      kit.box([0.04, 0.2, 0.28], [DESK.x - 0.1, BED_TOP + 0.2, DESK.z - 0.1], 'charcoal'),
      kit.box([0.02, 0.16, 0.24], [DESK.x - 0.075, BED_TOP + 0.2, DESK.z - 0.1], 'glassBlue'),
      kit.box([0.01, 0.04, 0.14], [DESK.x - 0.06, BED_TOP + 0.24, DESK.z - 0.1], 'mint'),
      kit.box([0.01, 0.03, 0.1], [DESK.x - 0.06, BED_TOP + 0.17, DESK.z - 0.1], 'pink'),
      // clipboard with colour blocks, and a mug
      kit.box([0.18, 0.012, 0.24], [DESK.x + 0.12, BED_TOP + 0.006, DESK.z + 0.1], 'wood'),
      kit.box([0.14, 0.012, 0.2], [DESK.x + 0.12, BED_TOP + 0.018, DESK.z + 0.1], 'white'),
      kit.box([0.1, 0.01, 0.04], [DESK.x + 0.12, BED_TOP + 0.03, DESK.z + 0.04], 'skyBlue'),
      kit.box([0.1, 0.01, 0.04], [DESK.x + 0.12, BED_TOP + 0.03, DESK.z + 0.12], 'lime'),
      kit.cylinder(0.04, 0.035, 0.07, [DESK.x + 0.26, BED_TOP + 0.035, DESK.z - 0.12], 'pink', { segments: 8 }),
    );
    // doctor's stool (seat 0.31)
    const SX = DESK.x - 0.0;
    const SZ = 0.12;
    parts.push(
      kit.cylinder(0.15, 0.15, 0.05, [SX, 0.285, SZ], 'teal', { segments: 10 }),
      kit.cylinder(0.025, 0.025, 0.22, [SX, 0.15, SZ], 'chrome', { segments: 6 }),
      kit.cylinder(0.14, 0.14, 0.03, [SX, 0.015, SZ], 'stoneDark', { segments: 8 }),
    );

    // folding screen: three panels zig-zag along z (x = SCREEN_X), pastel with a pale frame
    const cols = ['mint', 'pink', 'glassBlue'] as const;
    const A = 0.5;
    const PW = 0.3;
    for (let i = 0; i < 3; i++) {
      const z = -0.76 + i * 0.27;
      const yaw = i % 2 ? A : -A;
      const x = SCREEN_X + (i % 2 ? 0.07 : -0.07);
      parts.push(
        kit.box([0.04, 0.95, PW], [x, 0.1 + 0.475, z], cols[i], { rotate: [0, yaw, 0] }),
        kit.box([0.06, 0.05, PW + 0.02], [x, 1.07, z], 'white', { rotate: [0, yaw, 0] }),
        kit.box([0.06, 0.1, PW + 0.02], [x, 0.05, z], 'white', { rotate: [0, yaw, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
