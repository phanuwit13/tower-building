import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

const G = 0.03; // soft rubber floor thickness
const TOWER = { x: -0.5, z: -0.9, w: 0.64, deck: 0.8, post: 0.04, top: 1.5, roofRise: 0.3 }; // deck top, posts reach `top`
const TUBE = { r: 0.15, startZ: -0.6, startY: 0.98, endZ: 1.2, endY: 0.2 }; // tube slide centre line, sloping down to +z
const NET = { topX: -0.18, botX: 0.45, zs: [-1.1, -0.9, -0.7], rungs: [0.25, 0.5, 0.75], r: 0.018 };
const PODS: Array<[number, number, 'red' | 'sunYellow' | 'orange']> = [[0.55, -0.1, 'red'], [0.6, 0.45, 'sunYellow'], [0.35, 1.0, 'orange']];

/** สนามเด็กเล่น: a play tower with a little roof, a climbing net and a tube slide on a blue rubber floor, with stepping pods. */
export const item: ItemModel = {
  id: 'playground',
  name: 'สนามเด็กเล่น',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, G, 2.96], [0, G / 2, 0], 'blue')];
    const half = TOWER.w / 2;
    // tower: four yellow posts, an orange deck, red guard panels on the back and the -z side, a red roof
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const h = TOWER.top - G;
        parts.push(kit.cylinder(TOWER.post, TOWER.post, h, [TOWER.x + sx * (half - TOWER.post), G + h / 2, TOWER.z + sz * (half - TOWER.post)], 'sunYellow', { segments: 8 }));
      }
    }
    parts.push(
      kit.box([TOWER.w, 0.05, TOWER.w], [TOWER.x, TOWER.deck - 0.025, TOWER.z], 'orange'),
      kit.box([0.04, 0.24, TOWER.w - 0.1], [TOWER.x - half + 0.02, TOWER.deck + 0.12, TOWER.z], 'red'),
      kit.box([TOWER.w - 0.1, 0.24, 0.04], [TOWER.x, TOWER.deck + 0.12, TOWER.z - half + 0.02], 'red'),
      kit.wedge([TOWER.w + 0.16, TOWER.roofRise, TOWER.w + 0.16], [TOWER.x, TOWER.top + TOWER.roofRise / 2, TOWER.z], 'red'),
      kit.sphere(0.05, [TOWER.x, TOWER.top + TOWER.roofRise + 0.02, TOWER.z], 'sunYellow', { detail: 0 }),
    );
    // climbing net on the +x side: strands from the deck edge down to the floor, with rungs across
    const strand = (t: number, z: number): Vec3 => [NET.topX + (NET.botX - NET.topX) * t, TOWER.deck - (TOWER.deck - G) * t, z];
    for (const z of NET.zs) parts.push(rod(kit, strand(0, z), strand(1, z), NET.r, 'white', { segments: 4 }));
    for (const t of NET.rungs) {
      const p = strand(t, (NET.zs[0] + NET.zs[2]) / 2);
      parts.push(kit.cylinder(NET.r, NET.r, 0.4, p, 'white', { rotate: [Math.PI / 2, 0, 0], segments: 4 }));
    }
    parts.push(
      kit.cylinder(0.03, 0.03, 0.5, [NET.topX, TOWER.deck, TOWER.z], 'red', { rotate: [Math.PI / 2, 0, 0], segments: 8 }),
      kit.cylinder(0.03, 0.03, 0.5, [NET.botX, G + 0.03, TOWER.z], 'red', { rotate: [Math.PI / 2, 0, 0], segments: 8 }),
    );
    // tube slide leaving the tower towards +z
    const a: Vec3 = [TOWER.x, TUBE.startY, TUBE.startZ];
    const b: Vec3 = [TOWER.x, TUBE.endY, TUBE.endZ];
    parts.push(rod(kit, a, b, TUBE.r, 'sunYellow', { segments: 8 }), rod(kit, [b[0], b[1] - 0.005, b[2] - 0.08], [b[0], b[1] - 0.01, b[2]], TUBE.r + 0.025, 'orange', { segments: 8 }));
    for (const z of [0.1, 0.75]) {
      const t = (z - TUBE.startZ) / (TUBE.endZ - TUBE.startZ);
      const y = TUBE.startY + (TUBE.endY - TUBE.startY) * t - TUBE.r;
      parts.push(kit.cylinder(0.035, 0.035, y - G, [TOWER.x, G + (y - G) / 2, z], 'blue', { segments: 8 }));
    }
    // stepping pods
    for (const [x, z, color] of PODS) parts.push(kit.cylinder(0.17, 0.17, 0.2, [x, G + 0.1, z], color, { segments: 10 }));
    return kit.finish(parts);
  },
};
