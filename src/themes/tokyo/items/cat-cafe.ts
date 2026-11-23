import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

// A cosy cat café (2×2, front on +x): cream walls, a pink roof topped by a giant pair of cat ears (a sign, glowing pink inside),
// and a front window bay with two cat trees to look at.
const BASE = { w: 1.9, h: 0.03 };
const BODY = { x0: -0.9, x1: 0.2, z: 0.75, top: 0.85 }; // wall box: x from x0 to x1, z ±z
const BODY_W = BODY.x1 - BODY.x0;
const BODY_CX = (BODY.x0 + BODY.x1) / 2;
const BODY_D = BODY.z * 2;
const RISE = 0.3;
const FACE_R = 0.38; // radius of the cat-face sign
const BAY = { x0: BODY.x1, x1: 0.8, z: 0.45, h: 0.55 };

/** คาเฟ่แมว: a cat café with cat ears on the roof and cat trees in the window. */
export const item: ItemModel = {
  id: 'cat-cafe',
  name: 'คาเฟ่แมว',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const top = BASE.h + BODY.top;
    const FACE = { r: FACE_R, y: top + RISE + 0.34 }; // centred above the ridge
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.box([BODY_W, BODY.top, BODY_D], [BODY_CX, BASE.h + BODY.top / 2, 0], 'cream'),
      kit.box([BODY_W + 0.02, 0.07, BODY_D + 0.02], [BODY_CX, BASE.h + 0.035, 0], 'woodDark'), // skirting
      ...gableRoof(kit, { at: [BODY_CX, top, 0], length: BODY_D + 0.1, width: BODY_W, rise: RISE, eave: 0.06, color: 'pink', ridge: 'redDark' }),
      // giant cat-face sign on the ridge, facing +x: round orange face, two big triangular ears (pink glowing inside),
      // glowing eyes, nose and whiskers
      kit.cylinder(FACE.r, FACE.r, 0.08, [BODY_CX, FACE.y, 0], 'orange', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.16, [BODY_CX + 0.03, FACE.y - 0.13, 0], 'white', { scale: [0.35, 0.8, 1.3] }), // muzzle
      kit.sphere(0.035, [BODY_CX + 0.07, FACE.y - 0.06, 0], 'pink', { detail: 0, glow: true }), // nose
      ...[-1, 1].flatMap((s) => [
        kit.cone(0.26, 0.46, [BODY_CX, FACE.y + FACE.r + 0.04, s * 0.24], 'orange', { segments: 4, scale: [0.3, 1, 1], rotate: [s * 0.3, 0, 0] }),
        kit.cone(0.15, 0.3, [BODY_CX + 0.04, FACE.y + FACE.r + 0.0, s * 0.24], 'pink', { segments: 4, scale: [0.3, 1, 1], rotate: [s * 0.3, 0, 0], glow: true }),
        kit.box([0.04, 0.12, 0.08], [BODY_CX + 0.05, FACE.y + 0.1, s * 0.15], 'teal', { glow: true }), // eye
        ...[-0.05, 0.03].map((dy, i) =>
          kit.box([0.03, 0.022, 0.22], [BODY_CX + 0.045, FACE.y - 0.1 + dy, s * 0.3], 'lampWarm', { glow: true, rotate: [s * (i === 0 ? 0.2 : -0.15), 0, 0] }),
        ),
      ]),
      // windows and door
      ...door(kit, { at: [BODY.x1, BASE.h + 0.22, 0.6], facing: 'x+', w: 0.2, h: 0.44, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [BODY.x1, BASE.h + 0.52, 0.6], facing: 'x+', w: 0.18, h: 0.16, frame: 'teal', panes: 1 }),
      ...glassWindow(kit, { at: [BODY.x1, BASE.h + 0.4, -0.62], facing: 'x+', w: 0.18, h: 0.3, frame: 'teal', panes: 1 }),
      ...glassWindow(kit, { at: [BODY_CX, BASE.h + 0.45, BODY.z], facing: 'z+', w: 0.6, h: 0.36, frame: 'teal' }),
      ...glassWindow(kit, { at: [BODY_CX, BASE.h + 0.45, -BODY.z], facing: 'z-', w: 0.6, h: 0.36, frame: 'teal' }),
      ...glassWindow(kit, { at: [BODY.x0, BASE.h + 0.45, -0.25], facing: 'x-', w: 0.4, h: 0.36, frame: 'teal' }),
      ...glassWindow(kit, { at: [BODY.x0, BASE.h + 0.45, 0.25], facing: 'x-', w: 0.4, h: 0.36, frame: 'teal' }),
      // window bay: wood floor, white frame open at the top so the cat trees show
      kit.box([BAY.x1 - BAY.x0, 0.04, BAY.z * 2], [(BAY.x0 + BAY.x1) / 2, BASE.h + 0.02, 0], 'wood'),
    ];
    const by = BASE.h + 0.04;
    for (const sx of [BAY.x0 + 0.02, BAY.x1 - 0.02]) {
      for (const sz of [-BAY.z + 0.02, BAY.z - 0.02]) {
        parts.push(kit.box([0.04, BAY.h, 0.04], [sx, by + BAY.h / 2, sz], 'white'));
      }
      parts.push(kit.box([0.04, 0.04, BAY.z * 2], [sx, by + BAY.h, 0], 'white'));
    }
    parts.push(kit.box([BAY.x1 - BAY.x0, 0.04, 0.04], [(BAY.x0 + BAY.x1) / 2, by + BAY.h, BAY.z - 0.02], 'white'));
    parts.push(kit.box([BAY.x1 - BAY.x0, 0.04, 0.04], [(BAY.x0 + BAY.x1) / 2, by + BAY.h, -BAY.z + 0.02], 'white'));
    // two cat trees: post, two cushioned platforms and a ball
    const trees = [
      { z: -0.2, h: 0.42, a: 'sunYellow', b: 'pink' },
      { z: 0.2, h: 0.34, a: 'pink', b: 'sunYellow' },
    ] as const;
    for (const t of trees) {
      const x = (BAY.x0 + BAY.x1) / 2;
      parts.push(kit.cylinder(0.03, 0.03, t.h, [x, by + t.h / 2, t.z], 'sand', { segments: 8 }));
      parts.push(kit.box([0.22, 0.03, 0.22], [x, by + t.h, t.z], 'woodDark'));
      parts.push(kit.box([0.18, 0.03, 0.18], [x, by + t.h + 0.03, t.z], t.a));
      parts.push(kit.box([0.18, 0.03, 0.18], [x, by + t.h * 0.5, t.z], 'woodDark'));
      parts.push(kit.box([0.14, 0.03, 0.14], [x, by + t.h * 0.5 + 0.03, t.z], t.b));
      parts.push(kit.sphere(0.035, [x + 0.04, by + 0.035, t.z + 0.1], 'orange', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
