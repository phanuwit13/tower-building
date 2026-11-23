import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { glassWindow, rod } from '../../../models/parts';

// An ice-cream kiosk shaped like a big spiral shell: a cream kiosk body with a serving window and counter,
// under a stack of shrinking pink/white shell whorls, topped by a cone-and-scoops sign.
const BASE = { w: 1.84, d: 1.84, h: 0.08 };
const BODY = { x: -0.1, w: 1.4, d: 1.4, h: 0.62 }; // kiosk walls
const BODY_TOP = BASE.h + BODY.h;
const SHELL = { r: 0.85, h: 0.45, x: -0.1, ridges: 10, ridgeR: 0.035 }; // one wide low dome with radiating ridges
const RIDGE_T = [0, 0.45, 0.9, 1.3]; // angles up the dome along each ridge

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
    // the shell: one low scallop dome, pink, with cream ridges radiating from the top and a cream rim
    parts.push(
      kit.dome(SHELL.r, [SHELL.x, BODY_TOP, 0], 'pink', { segments: 12, scale: [1, SHELL.h / SHELL.r, 1] }),
      kit.torus(SHELL.r - 0.02, 0.04, [SHELL.x, BODY_TOP + 0.02, 0], 'cream', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
    );
    for (let k = 0; k < SHELL.ridges; k++) {
      const a = (k / SHELL.ridges) * Math.PI * 2;
      const pts: Vec3[] = RIDGE_T.map((t) => [
        SHELL.x + SHELL.r * 1.02 * Math.cos(t) * Math.cos(a), BODY_TOP + SHELL.h * 1.02 * Math.sin(t), -SHELL.r * 1.02 * Math.cos(t) * Math.sin(a),
      ]);
      for (let i = 1; i < pts.length; i++) parts.push(rod(kit, pts[i - 1], pts[i], SHELL.ridgeR, 'cream', { segments: 4 }));
    }
    // sign: cone (tip down) with scoops, sitting on the crown
    const cone = { r: 0.15, h: 0.4 };
    const cy = BODY_TOP + SHELL.h + 0.02 + cone.h / 2;
    const cx = SHELL.x;
    parts.push(
      kit.cylinder(cone.r, 0, cone.h, [cx, cy, 0], 'sand', { segments: 8 }),
      kit.sphere(0.17, [cx, cy + cone.h / 2 + 0.08, 0], 'pink'),
      kit.sphere(0.13, [cx, cy + cone.h / 2 + 0.3, 0], 'mint', { detail: 1 }),
    );
    return kit.finish(parts);
  },
};
