import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, rod } from '../../../models/parts';

// A raised granary: four posts with round rat guards, a plank box, a tall steep roof; a ladder to the door on +x.
const CX = -0.15;
const POST_H = 0.6;
const FLOOR_H = 0.08;
const BOX = { w: 1.0, d: 1.1, h: 0.7, y0: POST_H + FLOOR_H };
const ROOF = { rise: 0.62, eave: 0.2, length: 1.5 };
const WALL_TOP = BOX.y0 + BOX.h;

/** ยุ้งข้าว: a raised wooden rice granary with a tall roof, a ladder up to its door and sacks of rice beside it. */
export const item: ItemModel = {
  id: 'rice-barn',
  name: 'ยุ้งข้าว',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [CX - 0.4, CX + 0.4]) {
      for (const z of [-0.45, 0.45]) {
        parts.push(
          kit.cylinder(0.055, 0.055, POST_H, [x, POST_H / 2, z], 'woodDark', { segments: 8 }),
          kit.cylinder(0.11, 0.11, 0.03, [x, 0.46, z], 'stone', { segments: 8 }), // rat guard
        );
      }
    }
    parts.push(
      kit.box([BOX.w + 0.1, FLOOR_H, BOX.d + 0.1], [CX, POST_H + FLOOR_H / 2, 0], 'woodDark'),
      kit.box([BOX.w, BOX.h, BOX.d], [CX, BOX.y0 + BOX.h / 2, 0], 'wood'),
      kit.wedge([BOX.w, ROOF.rise, BOX.d], [CX, WALL_TOP + ROOF.rise / 2, 0], 'wood'),
      ...gableRoof(kit, { at: [CX, WALL_TOP, 0], length: ROOF.length, width: BOX.w, rise: ROOF.rise, eave: ROOF.eave, color: 'terracotta', ridge: 'redDark' }),
      ...door(kit, { at: [CX + BOX.w / 2, BOX.y0 + 0.27, 0], facing: 'x+', w: 0.36, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
    );
    // dark plank bands on the long walls
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([BOX.w + 0.02, 0.05, 0.02], [CX, BOX.y0 + 0.15, s * (BOX.d / 2 + 0.01)], 'woodDark'),
        kit.box([BOX.w + 0.02, 0.05, 0.02], [CX, BOX.y0 + 0.5, s * (BOX.d / 2 + 0.01)], 'woodDark'),
      );
    }
    // ladder leaning on the floor edge in front of the door
    const lx = CX + BOX.w / 2 + 0.05;
    for (const z of [-0.14, 0.14]) parts.push(rod(kit, [lx + 0.32, 0.03, z], [lx, BOX.y0 - 0.02, z], 0.025, 'sand', { segments: 6 }));
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      parts.push(kit.box([0.04, 0.03, 0.3], [lx + 0.32 * (1 - t), 0.03 + (BOX.y0 - 0.05) * t, 0], 'wood'));
    }
    // sacks of rice on the ground in front of the barn
    const sack = (x: number, z: number, y = 0): void => {
      parts.push(
        kit.cylinder(0.11, 0.15, 0.26, [x, y + 0.13, z], 'cream', { segments: 8 }),
        kit.sphere(0.09, [x, y + 0.29, z], 'cream', { detail: 0 }),
        kit.cylinder(0.1, 0.1, 0.03, [x, y + 0.245, z], 'red', { segments: 8 }),
      );
    };
    sack(0.78, -0.72);
    sack(0.78, -0.4);
    sack(0.78, 0.55);
    sack(0.78, 0.8);
    sack(0.4, -0.72, 0.0);
    parts.push(kit.box([0.3, 0.05, 0.5], [0.72, 0.025, 0.68], 'sand')); // little mat under the sacks
    return kit.finish(parts);
  },
};
