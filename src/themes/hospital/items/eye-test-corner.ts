import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A kid's eye-test corner: an orange chair at the +x side looking towards a picture chart at the back
// (-x, facing +x) over a little table with an eye-test machine (two glowing lenses). The chart shows
// pictures only: a big apple, two small houses, three tiny stars.
const MAT = 0.03;
const CHAIR = { x: 0.7, z: -0.15 };
const TABLE = { x: 0.2, z: -0.15, top: 0.5 };
const CHART = { x: -0.9, z: -0.15, y: 0.88, w: 0.9, h: 0.95 };

/** มุมตรวจตา: chair, an eye-test machine and a picture chart (apple, house, star), no letters. */
export const item: ItemModel = {
  id: 'eye-test-corner',
  name: 'มุมตรวจตา',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.9, MAT, 1.7], [0, MAT / 2, 0], 'mint')];
    // chair (seat 0.31), backrest on the +x side so the child looks towards the chart
    for (const dx of [-0.15, 0.15]) {
      for (const dz of [-0.15, 0.15]) parts.push(kit.box([0.05, 0.28, 0.05], [CHAIR.x + dx, MAT + 0.14, CHAIR.z + dz], 'stoneDark'));
    }
    parts.push(
      kit.box([0.4, 0.06, 0.4], [CHAIR.x, 0.28, CHAIR.z], 'orange'),
      kit.box([0.07, 0.34, 0.4], [CHAIR.x + 0.17, 0.48, CHAIR.z], 'orange'),
      kit.box([0.08, 0.1, 0.34], [CHAIR.x + 0.17, 0.68, CHAIR.z], 'sunYellow'),
    );
    // table with the machine on it
    for (const dx of [-0.2, 0.2]) {
      for (const dz of [-0.28, 0.28]) parts.push(kit.box([0.05, TABLE.top - 0.05, 0.05], [TABLE.x + dx, MAT + (TABLE.top - 0.05) / 2 - 0.0, TABLE.z + dz], 'woodDark'));
    }
    const m = TABLE.top;
    parts.push(
      kit.box([0.5, 0.05, 0.7], [TABLE.x, m - 0.025, TABLE.z], 'wood'),
      kit.box([0.26, 0.16, 0.34], [TABLE.x - 0.02, m + 0.08, TABLE.z], 'teal'),
      kit.box([0.14, 0.12, 0.3], [TABLE.x + 0.12, m + 0.2, TABLE.z], 'blue'),
      kit.box([0.1, 0.08, 0.34], [TABLE.x - 0.1, m + 0.22, TABLE.z], 'teal'),
      kit.cylinder(0.075, 0.075, 0.04, [TABLE.x + 0.2, m + 0.2, TABLE.z - 0.08], 'skyBlue', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.075, 0.075, 0.04, [TABLE.x + 0.2, m + 0.2, TABLE.z + 0.08], 'skyBlue', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.04, [TABLE.x + 0.1, m + 0.07, TABLE.z + 0.26], 'red', { detail: 0 }), // a button
    );
    // picture chart: feet, frame, board
    const { x, y, w, h, z } = CHART;
    for (const dz of [-w / 2 + 0.1, w / 2 - 0.1]) parts.push(kit.box([0.12, y - h / 2 + 0.02, 0.07], [x, MAT + (y - h / 2 + 0.02) / 2, z + dz], 'woodDark'));
    parts.push(
      kit.box([0.06, h + 0.1, w + 0.1], [x, y, z], 'teal'),
      kit.box([0.03, h, w], [x + 0.03, y, z], 'cream'),
    );
    const f = x + 0.05; // the board face
    // row 1: a big apple
    parts.push(
      kit.sphere(0.17, [f, y + 0.27, z], 'red', { scale: [0.25, 1, 1] }),
      kit.box([0.02, 0.07, 0.025], [f + 0.01, y + 0.46, z], 'bark'),
      kit.box([0.02, 0.05, 0.1], [f + 0.01, y + 0.44, z + 0.07], 'leaf', { rotate: [0.5, 0, 0] }),
    );
    // row 2: two smaller houses
    for (const dz of [-0.2, 0.2]) {
      parts.push(
        kit.box([0.03, 0.12, 0.16], [f + 0.015, y + 0.02, z + dz], 'sunYellow'),
        kit.wedge([0.2, 0.09, 0.03], [f + 0.015, y + 0.125, z + dz], 'terracotta', { rotate: [0, Math.PI / 2, 0] }),
        kit.box([0.04, 0.06, 0.04], [f + 0.015, y - 0.01, z + dz], 'blue'),
      );
    }
    // row 3: three small stars (two crossed bars and a turned pair)
    for (const dz of [-0.26, 0, 0.26]) {
      const at: [number, number, number] = [f + 0.015, y - 0.26, z + dz];
      parts.push(
        kit.box([0.03, 0.1, 0.03], at, 'sunYellow'),
        kit.box([0.03, 0.03, 0.1], at, 'sunYellow'),
        kit.box([0.03, 0.08, 0.025], at, 'sunYellow', { rotate: [Math.PI / 4, 0, 0] }),
        kit.box([0.03, 0.025, 0.08], at, 'sunYellow', { rotate: [Math.PI / 4, 0, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
