import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A dusty paddock ringed by a low wooden fence, with a hay feeder and two striped zebras.
const GROUND_H = 0.03;
const FENCE = { half: 0.93, post: 0.3 }; // fence line (from the centre) and post height
const BODY = { rx: 0.26, ry: 0.16, rz: 0.15, y: 0.5 }; // body ellipsoid radii (local) and centre height
const STRIPES = [-0.17, -0.06, 0.05, 0.16]; // stripe positions along the body

/** A friendly zebra at (x, z), turned by `yaw` (0 faces +x). */
function zebra(kit: StyleKit, x: number, z: number, yaw: number, grazing: boolean): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, GROUND_H + up, z - f * s + side * c];
  const rot: Vec3 = [0, yaw, 0];
  const headY = grazing ? 0.46 : 0.8;
  const headF = grazing ? 0.5 : 0.44;
  const parts: Part[] = [
    kit.sphere(1, at(0, 0, BODY.y), 'white', { scale: [BODY.rx, BODY.ry, BODY.rz], rotate: rot }),
    rod(kit, at(0.2, 0, BODY.y + 0.06), at(headF - 0.06, 0, headY + 0.02), 0.06, 'white', { segments: 6 }),
    kit.sphere(0.085, at(headF, 0, headY), 'white', { scale: [1.35, 0.85, 0.85], rotate: rot }),
    kit.sphere(0.055, at(headF + 0.09, 0, headY - 0.02), 'charcoal', { detail: 0, scale: [1.1, 0.9, 0.95], rotate: rot }),
    kit.sphere(0.028, at(headF + 0.03, 0.065, headY + 0.03), 'white', { detail: 0 }),
    kit.sphere(0.028, at(headF + 0.03, -0.065, headY + 0.03), 'white', { detail: 0 }),
    kit.sphere(0.015, at(headF + 0.05, 0.07, headY + 0.03), 'charcoal', { detail: 0 }),
    kit.sphere(0.015, at(headF + 0.05, -0.07, headY + 0.03), 'charcoal', { detail: 0 }),
    kit.cone(0.03, 0.08, at(headF - 0.05, 0.05, headY + 0.1), 'white', { segments: 5 }),
    kit.cone(0.03, 0.08, at(headF - 0.05, -0.05, headY + 0.1), 'white', { segments: 5 }),
    // mane and tail
    rod(kit, at(0.2, 0, BODY.y + 0.12), at(headF - 0.07, 0, headY + 0.08), 0.022, 'charcoal', { segments: 4 }),
    rod(kit, at(-0.24, 0, 0.55), at(-0.3, 0, 0.32), 0.016, 'charcoal', { segments: 4 }),
    kit.sphere(0.03, at(-0.3, 0, 0.3), 'charcoal', { detail: 0 }),
  ];
  // stripes: thin discs laid across the body, sized to the ellipsoid cross-section at each spot
  for (const t of STRIPES) {
    const k = Math.sqrt(1 - (t / BODY.rx) ** 2) * 1.04;
    parts.push(kit.cylinder(1, 1, 0.035, at(t, 0, BODY.y), 'charcoal', { segments: 8, scale: [BODY.ry * k, 1, BODY.rz * k], rotate: [0, yaw, Math.PI / 2] }));
  }
  for (const [f, side] of [[0.17, 0.08], [0.17, -0.08], [-0.17, 0.08], [-0.17, -0.08]] as const) {
    parts.push(
      kit.cylinder(0.03, 0.034, 0.36, at(f, side, 0.18 + 0.02), 'white', { segments: 6 }),
      kit.cylinder(0.036, 0.036, 0.06, at(f, side, 0.03), 'charcoal', { segments: 6 }),
    );
  }
  return parts;
}

/** A hay feeder: a wooden trough on legs, piled with hay. */
function feeder(kit: StyleKit, x: number, z: number): Part[] {
  return [
    kit.box([0.22, 0.14, 0.6], [x, GROUND_H + 0.17, z], 'woodDark'),
    kit.box([0.17, 0.1, 0.54], [x, GROUND_H + 0.23, z], 'sunYellow'),
    kit.sphere(0.12, [x, GROUND_H + 0.3, z], 'sunYellow', { detail: 0, scale: [1, 0.6, 2] }),
    kit.box([0.05, 0.1, 0.05], [x + 0.08, GROUND_H + 0.05, z + 0.24], 'wood'),
    kit.box([0.05, 0.1, 0.05], [x - 0.08, GROUND_H + 0.05, z + 0.24], 'wood'),
    kit.box([0.05, 0.1, 0.05], [x + 0.08, GROUND_H + 0.05, z - 0.24], 'wood'),
    kit.box([0.05, 0.1, 0.05], [x - 0.08, GROUND_H + 0.05, z - 0.24], 'wood'),
  ];
}

/** คอกม้าลาย: a low-fenced dusty paddock with two zebras and a hay feeder. */
export const item: ItemModel = {
  id: 'zebra-paddock',
  name: 'คอกม้าลาย',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, GROUND_H, 1.96], [0, GROUND_H / 2, 0], 'sand')];
    // fence: corner and mid posts, two rails per side
    const h = FENCE.half;
    const spots = new Map<string, [number, number]>();
    for (const a of [-h, -h / 2, 0, h / 2, h]) {
      for (const [px, pz] of [[a, h], [a, -h], [h, a], [-h, a]] as const) spots.set(`${px.toFixed(3)},${pz.toFixed(3)}`, [px, pz]);
    }
    for (const [px, pz] of spots.values()) {
      parts.push(kit.box([0.07, FENCE.post, 0.07], [px, GROUND_H + FENCE.post / 2, pz], 'woodDark'));
    }
    for (const y of [0.12, 0.23]) {
      parts.push(
        kit.box([2 * h, 0.035, 0.03], [0, GROUND_H + y, h], 'wood'),
        kit.box([2 * h, 0.035, 0.03], [0, GROUND_H + y, -h], 'wood'),
        kit.box([0.03, 0.035, 2 * h], [h, GROUND_H + y, 0], 'wood'),
        kit.box([0.03, 0.035, 2 * h], [-h, GROUND_H + y, 0], 'wood'),
      );
    }
    parts.push(
      ...feeder(kit, -0.62, 0.15),
      ...zebra(kit, 0.3, -0.4, 0.2, false),
      ...zebra(kit, 0.3, 0.5, -2.4, true),
      kit.sphere(0.1, [-0.2, GROUND_H + 0.04, -0.7], 'stone', { detail: 0, scale: [1.2, 0.6, 1] }),
    );
    return kit.finish(parts);
  },
};
