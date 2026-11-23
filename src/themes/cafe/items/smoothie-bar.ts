import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 2x2 (front faces +x). A counter along z with blenders and cups, and a crate heaped with fruit in front.
const TOP_Y = 0.62;

/** บาร์น้ำปั่น: counter with blenders, cups and a pile of fruit. */
export const item: ItemModel = {
  id: 'smoothie-bar',
  name: 'บาร์น้ำปั่น',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, TOP_Y - 0.06, 1.9], [-0.5, (TOP_Y - 0.06) / 2 + 0.02, 0], 'mint'),
      kit.box([0.9, 0.04, 1.9], [-0.5, 0.02, 0], 'teal'),
      kit.box([0.96, 0.06, 1.96], [-0.5, TOP_Y - 0.03, 0], 'white'),
      // pink trim stripe on the front
      kit.box([0.02, 0.08, 1.9], [-0.04, 0.4, 0], 'pink'),
      kit.box([0.02, 0.08, 1.9], [-0.04, 0.2, 0], 'sunYellow'),
    ];
    // blenders: dark base, glass jar with a smoothie, red lid
    [[-0.65, 'pink'], [0, 'lime'], [0.65, 'orange']].forEach(([z, c]) => {
      const zz = z as number;
      parts.push(
        kit.box([0.22, 0.1, 0.22], [-0.7, TOP_Y + 0.05, zz], 'charcoal'),
        kit.cylinder(0.1, 0.075, 0.26, [-0.7, TOP_Y + 0.23, zz], 'glassBlue', { segments: 8 }),
        kit.cylinder(0.088, 0.07, 0.15, [-0.7, TOP_Y + 0.185, zz], c as 'pink', { segments: 8 }),
        kit.cylinder(0.105, 0.105, 0.04, [-0.7, TOP_Y + 0.38, zz], 'red', { segments: 8 }),
        kit.sphere(0.03, [-0.7, TOP_Y + 0.42, zz], 'sunYellow', { detail: 0 }),
        kit.box([0.02, 0.025, 0.02], [-0.55, TOP_Y + 0.07, zz], 'red'),
      );
    });
    // cups with straws on the counter front
    [[-0.35, 'pink'], [-0.16, 'lime'], [0.34, 'orange'], [0.5, 'purple']].forEach(([z, c]) => {
      const zz = z as number;
      parts.push(
        kit.cylinder(0.07, 0.055, 0.12, [-0.3, TOP_Y + 0.06, zz], c as 'pink', { segments: 8 }),
        kit.cylinder(0.075, 0.075, 0.02, [-0.3, TOP_Y + 0.13, zz], 'white', { segments: 8 }),
        kit.cylinder(0.012, 0.012, 0.14, [-0.3 + 0.015, TOP_Y + 0.19, zz], 'white', { segments: 4 }),
      );
    });
    // fruit bowl on the counter end
    parts.push(
      kit.cylinder(0.17, 0.1, 0.1, [-0.35, TOP_Y + 0.05, 0.78], 'woodDark', { segments: 10 }),
      kit.sphere(0.075, [-0.38, TOP_Y + 0.15, 0.76], 'red', { detail: 0 }),
      kit.sphere(0.07, [-0.3, TOP_Y + 0.14, 0.81], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [-0.35, TOP_Y + 0.2, 0.83], 'lime', { detail: 0 }),
    );
    // front: a wooden crate heaped with fruit
    parts.push(
      kit.box([0.52, 0.22, 1.1], [0.62, 0.12, 0.1], 'woodDark'),
      kit.box([0.52, 0.03, 1.1], [0.62, 0.015, 0.1], 'bark'),
    );
    const fruit = ['red', 'orange', 'sunYellow', 'lime', 'pink', 'purple', 'red', 'orange', 'lime', 'sunYellow', 'pink', 'red'] as const;
    fruit.forEach((c, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      parts.push(kit.sphere(0.085, [0.46 + col * 0.16, 0.3 + (row % 2) * 0.03, -0.35 + row * 0.27], c, { detail: 0 }));
    });
    // a stack of fruit on the counter too: watermelon-ish green ball with a slice
    parts.push(
      kit.sphere(0.12, [-0.3, TOP_Y + 0.13, -0.78], 'leaf', { detail: 0 }),
      kit.sphere(0.1, [-0.4, TOP_Y + 0.12, -0.84], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
