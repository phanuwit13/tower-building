import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow, wallPanel } from '../../../models/parts';

// A pastel van, long side along z with the cab at +z; the serving hatch is on the +x side.
const CHASSIS = { w: 0.7, h: 0.1, d: 1.6, y: 0.17 }; // dark underframe
const BODY = { w: 0.72, h: 0.58, d: 0.95, z: -0.33 }; // box body; its floor sits on the chassis
const CAB = { w: 0.72, h: 0.4, d: 0.5, z: 0.6 };
const WHEEL = { r: 0.15, w: 0.1, x: 0.34, z: [-0.45, 0.55] };
const HATCH = { w: 0.5, h: 0.24, y: 0.5, z: -0.33 };
const CONE = { r: 0.16, h: 0.42 }; // giant cone on the roof, pointing down into the roof

/** รถขายไอศกรีม: a mint-and-pink van with a side serving hatch under a striped awning and a giant cone on the roof. */
export const item: ItemModel = {
  id: 'ice-cream-truck',
  name: 'รถขายไอศกรีม',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const bodyBottom = CHASSIS.y + CHASSIS.h / 2;
    const bodyTop = bodyBottom + BODY.h;
    const parts: Part[] = [
      kit.box([CHASSIS.w, CHASSIS.h, CHASSIS.d], [0, CHASSIS.y, 0], 'charcoal'),
      kit.box([BODY.w, BODY.h, BODY.d], [0, bodyBottom + BODY.h / 2, BODY.z], 'mint'),
      kit.box([CAB.w, CAB.h, CAB.d], [0, bodyBottom + CAB.h / 2, CAB.z], 'pink'),
      // roof trim and a pink stripe round the body
      kit.box([BODY.w + 0.02, 0.05, BODY.d + 0.02], [0, bodyTop - 0.025, BODY.z], 'white'),
      kit.box([BODY.w + 0.02, 0.06, BODY.d + 0.02], [0, bodyBottom + 0.1, BODY.z], 'pink'),
      // bumpers
      kit.box([0.5, 0.06, 0.05], [0, 0.2, CAB.z + CAB.d / 2 + 0.02], 'chrome'),
      kit.box([0.5, 0.06, 0.05], [0, 0.2, BODY.z - BODY.d / 2 - 0.02], 'chrome'),
    ];
    for (const s of [-1, 1]) for (const z of WHEEL.z) {
      parts.push(
        kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, [s * WHEEL.x, WHEEL.r, z], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.07, 0.07, WHEEL.w + 0.02, [s * WHEEL.x, WHEEL.r, z], 'stone', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    // cab windows: a windscreen at the +z end and a side window each side
    parts.push(
      ...glassWindow(kit, { at: [0, bodyBottom + 0.26, CAB.z + CAB.d / 2], facing: 'z+', w: 0.5, h: 0.2, frame: 'white', panes: 1 }),
      ...glassWindow(kit, { at: [CAB.w / 2, bodyBottom + 0.26, CAB.z], facing: 'x+', w: 0.28, h: 0.2, frame: 'white', panes: 1 }),
      ...glassWindow(kit, { at: [-CAB.w / 2, bodyBottom + 0.26, CAB.z], facing: 'x-', w: 0.28, h: 0.2, frame: 'white', panes: 1 }),
    );
    // serving hatch on the +x side: dark opening, a counter and a striped awning above
    const hatchY = bodyBottom + HATCH.y - 0.16;
    parts.push(
      ...wallPanel(kit, { at: [BODY.w / 2, hatchY, HATCH.z], facing: 'x+', w: HATCH.w + 0.08, h: HATCH.h + 0.08, depth: 0.02, color: 'white' }),
      ...wallPanel(kit, { at: [BODY.w / 2, hatchY, HATCH.z], facing: 'x+', w: HATCH.w, h: HATCH.h, depth: 0.03, color: 'woodDark' }),
      kit.box([0.1, 0.03, HATCH.w + 0.08], [BODY.w / 2 + 0.05, hatchY - HATCH.h / 2 - 0.02, HATCH.z], 'wood'),
    );
    for (let k = 0; k < 3; k++) {
      parts.push(kit.box([0.14, 0.03, 0.2], [BODY.w / 2 + 0.05, hatchY + HATCH.h / 2 + 0.1, HATCH.z + (k - 1) * 0.2], k === 1 ? 'white' : 'red', { rotate: [0, 0, -0.4] }));
    }
    // the giant cone on the roof: an upside-down waffle cone under three scoops
    const base = bodyTop;
    parts.push(
      kit.cone(CONE.r, CONE.h, [0, base + CONE.h / 2, BODY.z], 'sand', { segments: 8, rotate: [Math.PI, 0, 0] }),
      kit.sphere(0.2, [0, base + CONE.h + 0.1, BODY.z], 'pink', { detail: 1 }),
      kit.sphere(0.15, [0, base + CONE.h + 0.28, BODY.z], 'white', { detail: 1 }),
      kit.sphere(0.04, [0, base + CONE.h + 0.44, BODY.z], 'red', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
