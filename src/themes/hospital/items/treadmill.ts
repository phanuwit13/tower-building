import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A therapy treadmill (1×2, long side along z): belt deck, side handrails and a console with a lit panel at the -z end.
const DECK = { w: 0.5, d: 1.7, top: 0.2 };
const POST_Z = -0.7;
const RAIL_Y = 0.72;

/** ลู่วิ่งกายภาพ: a therapy treadmill with handrails and a lit panel. */
export const item: ItemModel = {
  id: 'treadmill',
  name: 'ลู่วิ่งกายภาพ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.w, 0.12, DECK.d], [0, 0.08, 0], 'charcoal'), // frame, bottom at 0.02
      kit.box([DECK.w - 0.12, 0.03, DECK.d - 0.1], [0, DECK.top - 0.015, 0.02], 'stoneDark'), // belt
      kit.box([DECK.w, 0.02, DECK.d], [0, 0.01, 0], 'stone'),
      kit.cylinder(0.045, 0.045, DECK.w - 0.1, [0, DECK.top - 0.02, DECK.d / 2 - 0.04], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    ];
    // belt stripes
    for (let i = 0; i < 6; i++) parts.push(kit.box([DECK.w - 0.14, 0.005, 0.04], [0, DECK.top + 0.002, -0.6 + i * 0.25], 'stone'));
    for (const s of [-1, 1]) {
      // side platform, upright post, handrail running along z, bracing to the console
      parts.push(
        kit.box([0.06, 0.03, 0.9], [s * (DECK.w / 2 - 0.03), DECK.top + 0.015, 0.1], 'teal'),
        kit.cylinder(0.03, 0.03, RAIL_Y - DECK.top, [s * 0.22, (RAIL_Y + DECK.top) / 2, POST_Z], 'chrome', { segments: 8 }),
        kit.cylinder(0.03, 0.03, RAIL_Y - DECK.top, [s * 0.22, (RAIL_Y + DECK.top) / 2, POST_Z + 0.95], 'chrome', { segments: 8 }),
        kit.cylinder(0.025, 0.025, 1.0, [s * 0.22, RAIL_Y, POST_Z + 0.475], 'sunYellow', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      );
    }
    // console: a crossbar and a tilted lit panel facing +z
    parts.push(
      kit.cylinder(0.03, 0.03, 0.44, [0, RAIL_Y, POST_Z], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.4, 0.2, 0.06], [0, RAIL_Y + 0.14, POST_Z], 'charcoal', { rotate: [-0.35, 0, 0] }),
      kit.box([0.32, 0.13, 0.02], [0, RAIL_Y + 0.15, POST_Z + 0.04], 'skyBlue', { rotate: [-0.35, 0, 0], glow: 'windowWarm', light: 'window' }),
      kit.sphere(0.025, [-0.14, RAIL_Y + 0.07, POST_Z + 0.07], 'lime', { detail: 0, glow: true, light: 'window' }),
      kit.sphere(0.025, [0.14, RAIL_Y + 0.07, POST_Z + 0.07], 'sunYellow', { detail: 0, glow: true, light: 'window' }),
    );
    return kit.finish(parts);
  },
};
