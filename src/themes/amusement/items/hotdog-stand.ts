import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wheel } from '../../../models/parts';

const BODY = { w: 0.7, h: 0.5, d: 1.3, y: 0.15 };
const TOP_Y = BODY.y + BODY.h;
const COUNTER = { w: 0.8, d: 1.4, t: 0.05 };
const BASE = TOP_Y + COUNTER.t; // top of the counter
const POLE = { x: 0, z: 0.1, h: 0.85, r: 0.025 };
const CANOPY = { r: 0.46, h: 0.3 };
const DOG = { len: 0.8, bunR: 0.12 };

/** ร้านฮอทดอก: a red cart with a striped umbrella and a giant hot dog on top as the sign. */
export const item: ItemModel = {
  id: 'hotdog-stand',
  name: 'ร้านฮอทดอก',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY.y + BODY.h / 2, 0], 'red'),
      kit.box([BODY.w + 0.02, 0.08, BODY.d + 0.02], [0, BODY.y + 0.3, 0], 'sunYellow'),
      kit.box([COUNTER.w, COUNTER.t, COUNTER.d], [0, TOP_Y + COUNTER.t / 2, 0], 'stone'),
    ];
    for (const s of [-1, 1]) {
      for (const z of [-0.4, 0.4]) {
        parts.push(...wheel(kit, { at: [s * 0.37, 0.14, z], radius: 0.1, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone', hubRadius: 0.03, hubLength: 0.06 }));
      }
    }
    for (const s of [-1, 1]) parts.push(kit.box([0.04, 0.04, 0.3], [s * 0.2, 0.35, -0.8], 'stoneDark'));
    parts.push(kit.box([0.44, 0.04, 0.04], [0, 0.35, -0.95], 'stoneDark'));
    // sauces and a bun tray on the counter
    parts.push(
      kit.cylinder(0.05, 0.05, 0.14, [0.28, BASE + 0.07, 0.55], 'red', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.14, [0.28, BASE + 0.07, 0.4], 'sunYellow', { segments: 8 }),
      kit.box([0.3, 0.06, 0.4], [0.15, BASE + 0.03, -0.5], 'sand'),
      kit.cylinder(0.05, 0.05, 0.3, [0.15, BASE + 0.09, -0.5], 'terracotta', { rotate: [Math.PI / 2, 0, 0], segments: 8 }),
    );
    // umbrella: pole, two six-sided cones turned 30° for stripes, a tip
    parts.push(kit.cylinder(POLE.r, POLE.r, POLE.h, [POLE.x, BASE + POLE.h / 2, POLE.z], 'white', { segments: 6 }));
    const cy = BASE + POLE.h + CANOPY.h / 2 - 0.05;
    parts.push(
      kit.cone(CANOPY.r, CANOPY.h, [POLE.x, cy, POLE.z], 'red', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [POLE.x, cy, POLE.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
    );
    // the giant hot dog sign, lying along z on the umbrella tip
    const tip = cy + CANOPY.h / 2;
    const dogY = tip + 0.14;
    parts.push(
      kit.cylinder(0.025, 0.025, 0.1, [POLE.x, tip + 0.03, POLE.z], 'stoneDark', { segments: 6 }),
      kit.cylinder(DOG.bunR, DOG.bunR, DOG.len, [POLE.x, dogY, POLE.z], 'sand', { rotate: [Math.PI / 2, 0, 0], segments: 10 }),
      kit.cylinder(0.085, 0.085, DOG.len + 0.14, [POLE.x, dogY + 0.07, POLE.z], 'terracotta', { rotate: [Math.PI / 2, 0, 0], segments: 10 }),
    );
    for (let i = 0; i < 5; i++) {
      parts.push(kit.sphere(0.035, [POLE.x, dogY + 0.15, POLE.z - 0.3 + i * 0.15], 'sunYellow', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
