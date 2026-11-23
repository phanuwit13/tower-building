import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small yellow crane on a stone pad (1×2, long side along z), with a jib that holds an orange crate on a cable.
const PAD_H = 0.06;
const MAST_Z = -0.55;
const MAST_TOP = 1.2;
const JIB_Y = 1.2;
const JIB_FRONT = 0.7;
const JIB_BACK = -0.8;
const CRATE_Z = 0.5;

/** เครนยกของ: a little crane lifting a crate. */
export const item: ItemModel = {
  id: 'cargo-crane',
  name: 'เครนยกของ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, PAD_H, 1.9], [0, PAD_H / 2, 0], 'stone'),
      // driver cab on the pad, window facing +x
      kit.box([0.4, 0.3, 0.4], [0.18, PAD_H + 0.15, MAST_Z + 0.4], 'teal'),
      kit.box([0.02, 0.15, 0.26], [0.39, PAD_H + 0.19, MAST_Z + 0.4], 'skyBlue', { glow: 'windowWarm', light: 'window' }),
      // mast, slewing ring and the jib
      kit.box([0.2, MAST_TOP - PAD_H, 0.2], [-0.05, (MAST_TOP + PAD_H) / 2, MAST_Z], 'sunYellow'),
      kit.cylinder(0.17, 0.17, 0.06, [-0.05, MAST_TOP + 0.03, MAST_Z], 'charcoal', { segments: 10 }),
      kit.box([0.14, 0.14, JIB_FRONT - JIB_BACK], [-0.05, JIB_Y + 0.13, (JIB_FRONT + JIB_BACK) / 2], 'sunYellow'),
      kit.box([0.16, 0.05, JIB_FRONT - JIB_BACK], [-0.05, JIB_Y + 0.22, (JIB_FRONT + JIB_BACK) / 2], 'orange'),
      // counterweight at the back
      kit.box([0.28, 0.24, 0.24], [-0.05, JIB_Y + 0.15, JIB_BACK + 0.12], 'stoneDark'),
      // cable, hook and the crate it holds
      kit.cylinder(0.012, 0.012, 0.5, [-0.05, JIB_Y + 0.06 - 0.25 + 0.0, CRATE_Z], 'charcoal', { segments: 4 }),
      kit.box([0.1, 0.03, 0.1], [-0.05, JIB_Y - 0.42, CRATE_Z], 'charcoal'),
      kit.box([0.3, 0.26, 0.3], [-0.05, JIB_Y - 0.58, CRATE_Z], 'orange'),
      kit.box([0.32, 0.04, 0.04], [-0.05, JIB_Y - 0.58, CRATE_Z], 'redDark'),
      kit.box([0.04, 0.28, 0.32], [-0.05, JIB_Y - 0.58, CRATE_Z], 'redDark'),
      // tiny loading stack under it
      kit.box([0.3, 0.14, 0.3], [-0.05, PAD_H + 0.07, CRATE_Z], 'blue'),
    ];
    return kit.finish(parts);
  },
};
