import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const BODY = { x: 0.05, y: 0.45, rx: 0.32, ry: 0.32, rz: 0.28 };

/** ถังขยะรูปปลา: a blue fish-shaped bin on two feet, mouth open towards +x as the slot. */
export const item: ItemModel = {
  id: 'fish-bin',
  name: 'ถังขยะรูปปลา',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.sphere(1, [BODY.x, BODY.y, 0], 'blue', { scale: [BODY.rx, BODY.ry, BODY.rz] }),
      kit.sphere(1, [BODY.x + 0.02, BODY.y - 0.2, 0], 'skyBlue', { detail: 0, scale: [0.26, 0.1, 0.25] }), // pale belly
      kit.box([0.06, 0.2, 0.26], [0.34, BODY.y, 0], 'charcoal'), // the mouth
      kit.box([0.07, 0.05, 0.3], [0.34, BODY.y + 0.125, 0], 'orange'), // lips
      kit.box([0.07, 0.05, 0.3], [0.34, BODY.y - 0.125, 0], 'orange'),
      kit.wedge([0.5, 0.28, 0.08], [-0.34, BODY.y, 0], 'teal', { rotate: [0, 0, -Math.PI / 2] }), // tail fin
      kit.wedge([0.3, 0.2, 0.06], [BODY.x - 0.03, BODY.y + BODY.ry + 0.07, 0], 'teal', { apex: -0.3 }), // dorsal fin
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.065, [0.16, BODY.y + 0.12, s * 0.22], 'white', { detail: 0 }),
        kit.sphere(0.035, [0.2, BODY.y + 0.12, s * 0.27], 'charcoal', { detail: 0 }),
        kit.sphere(0.1, [-0.02, BODY.y - 0.06, s * 0.28], 'teal', { detail: 0, scale: [1, 0.5, 0.35] }), // side fin
        kit.box([0.09, 0.2, 0.09], [0.0, 0.1, s * 0.14], 'charcoal'), // feet
      );
    }
    return kit.finish(parts);
  },
};
