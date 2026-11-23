import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// An ice-cream kiosk shaped like a big spiral shell: a cream kiosk body with a serving window and counter,
// under a stack of shrinking pink/white shell whorls, topped by a cone-and-scoops sign.
const BASE = { w: 1.84, d: 1.84, h: 0.08 };
const BODY = { x: -0.1, w: 1.4, d: 1.4, h: 0.62 }; // kiosk walls
const BODY_TOP = BASE.h + BODY.h;
/** Shell whorls from the bottom: [radius, rise (dome height scale), x shift, colour]. */
const WHORLS: Array<{ r: number; y: number; x: number; color: 'pink' | 'white' }> = [
  { r: 0.8, y: BODY_TOP, x: -0.1, color: 'pink' },
  { r: 0.6, y: BODY_TOP + 0.5, x: -0.14, color: 'white' },
  { r: 0.42, y: BODY_TOP + 0.9, x: -0.17, color: 'pink' },
  { r: 0.25, y: BODY_TOP + 1.2, x: -0.19, color: 'white' },
];
const DOME_SQUASH = 1.1;

/** ร้านไอศกรีมเปลือกหอย: ice-cream kiosk shaped like a big spiral shell, cone sign on top. */
export const item: ItemModel = {
  id: 'shell-ice-cream',
  name: 'ร้านไอศกรีมเปลือกหอย',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'sand'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE.h + BODY.h / 2, 0], 'cream'),
    ];
    const frontX = BODY.x + BODY.w / 2;
    parts.push(...glassWindow(kit, { at: [frontX, BASE.h + 0.36, 0], facing: 'x+', w: 0.8, h: 0.28, frame: 'pink', panes: 3 }));
    parts.push(
      kit.box([0.3, 0.05, 1.0], [frontX + 0.15, BASE.h + 0.19, 0], 'wood'), // serving counter
      kit.box([0.12, 0.2, 0.12], [frontX + 0.2, BASE.h + 0.06 + 0.1 + 0.05, 0.34], 'sunYellow', { rotate: [0, 0.4, 0] }), // a cup on it
    );
    // the shell: whorls getting smaller; a white rim ring under each (flat torus) makes the spiral ridges
    for (const w of WHORLS) {
      parts.push(
        kit.dome(w.r, [w.x, w.y, 0], w.color, { segments: 12, scale: [1, DOME_SQUASH * (w.r / 0.8) + 0.1, 1] }),
        kit.torus(w.r, 0.035, [w.x, w.y + 0.01, 0], w.color === 'pink' ? 'white' : 'pink', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      );
    }
    // sign: cone (tip down) with scoops, on a short stem so it sits on the top whorl
    const lastWhorl = WHORLS[WHORLS.length - 1];
    const topY = lastWhorl.y + 0.25 * (DOME_SQUASH * (lastWhorl.r / 0.8) + 0.1); // crown of the last dome
    const cone = { r: 0.15, h: 0.4 };
    const cy = topY + 0.02 + cone.h / 2;
    const cx = lastWhorl.x;
    parts.push(
      kit.cylinder(cone.r, 0, cone.h, [cx, cy, 0], 'sand', { segments: 8 }),
      kit.sphere(0.17, [cx, cy + cone.h / 2 + 0.08, 0], 'pink'),
      kit.sphere(0.13, [cx, cy + cone.h / 2 + 0.3, 0], 'mint', { detail: 1 }),
    );
    return kit.finish(parts);
  },
};
