import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A small ring with a centre post and two saddled ponies hanging from arms. The post, the arms, the ponies
// and the little canopy all share ONE spin pivot on the centre post; they stay inside r 0.47 of the 1 x 2 footprint.
const GROUND = { w: 0.96, d: 1.96, h: 0.03 };
const DECK = { r: 0.47, h: 0.05 }; // still round footing
const DECK_TOP = GROUND.h + DECK.h;
const POST = { r: 0.05, top: 0.98 };
const ARM_Y = 0.7;
const RING = 0.34; // ponies' distance from the post
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], axis: [0, 1, 0], speed: 0.4 };
const PONIES: Array<{ body: PaletteColor; mane: PaletteColor; saddle: PaletteColor; a: number }> = [
  { body: 'white', mane: 'pink', saddle: 'red', a: 0 },
  { body: 'wood', mane: 'woodDark', saddle: 'sunYellow', a: Math.PI },
];

function pony(kit: StyleKit, p: (typeof PONIES)[number]): Part[] {
  const px = RING * Math.cos(p.a);
  const pz = RING * Math.sin(p.a);
  const yaw = Math.atan2(Math.cos(p.a), Math.sin(p.a)); // local +x runs along the circle, the way it spins
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (lx: number, ly: number, lz = 0): Vec3 => [px + lx * c + lz * s, ly, pz - lx * s + lz * c];
  const m = { motion: SPIN };
  const turn: Vec3 = [0, yaw, 0];
  const BY = 0.38;
  const parts: Part[] = [
    kit.sphere(0.1, at(0, BY), p.body, { scale: [1.5, 1, 0.85], rotate: turn, ...m }),
    kit.sphere(0.075, at(0.15, BY + 0.1), p.body, { scale: [1.2, 1.1, 0.9], rotate: turn, ...m }), // neck
    kit.sphere(0.07, at(0.21, BY + 0.17), p.body, { scale: [1.2, 1, 0.9], rotate: turn, ...m }), // head
    kit.sphere(0.04, at(0.28, BY + 0.14), 'pink', { detail: 0, scale: [1, 0.8, 1], rotate: turn, ...m }), // muzzle
    kit.box([0.17, 0.03, 0.14], at(0, BY + 0.095), p.saddle, { rotate: turn, ...m }),
    kit.box([0.05, 0.07, 0.04], at(0.14, BY + 0.2), p.mane, { rotate: turn, ...m }),
    kit.sphere(0.04, at(-0.17, BY + 0.04), p.mane, { detail: 0, scale: [0.8, 1.6, 0.8], rotate: turn, ...m }), // tail
    // pole from the arm to the saddle
    kit.cylinder(0.015, 0.015, ARM_Y - BY - 0.1, at(0, (ARM_Y + BY + 0.1) / 2), 'brass', { segments: 4, ...m }),
  ];
  for (const z of [-1, 1]) {
    parts.push(
      kit.cone(0.025, 0.05, at(0.19, BY + 0.26, z * 0.04), p.body, { segments: 4, ...m }),
      kit.sphere(0.022, at(0.25, BY + 0.2, z * 0.055), 'white', { detail: 0, ...m }),
      kit.sphere(0.012, at(0.27, BY + 0.2, z * 0.058), 'charcoal', { detail: 0, ...m }),
    );
    for (const x of [-0.1, 0.1]) parts.push(kit.cylinder(0.025, 0.025, 0.2, at(x, BY - 0.12, z * 0.05), p.body, { segments: 6, ...m }));
  }
  // radial arm from the post to the pole
  parts.push(kit.box([RING + 0.02, 0.035, 0.045], [(px) / 2, ARM_Y, pz / 2], 'sunYellow', { rotate: [0, -p.a, 0], ...m }));
  return parts;
}

/** ม้าโพนี่วนรอบเสา: a centre post with two saddled ponies on arms that turn slowly. */
export const item: ItemModel = {
  id: 'pony-ride',
  name: 'ม้าโพนี่วนรอบเสา',
  category: 'ride',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const m = { motion: SPIN };
    const parts: Part[] = [
      kit.box([GROUND.w, GROUND.h, GROUND.d], [0, GROUND.h / 2, 0], 'lime'),
      kit.cylinder(DECK.r, DECK.r, DECK.h, [0, GROUND.h + DECK.h / 2, 0], 'stone', { segments: 20 }),
      kit.cylinder(POST.r, POST.r, POST.top - DECK_TOP, [0, (POST.top + DECK_TOP) / 2, 0], 'sunYellow', { segments: 8, ...m }),
      kit.cylinder(0.46, 0.46, 0.05, [0, POST.top + 0.025, 0], 'red', { segments: 12, ...m }),
      kit.cone(0.46, 0.2, [0, POST.top + 0.15, 0], 'red', { segments: 6, ...m }),
      kit.cone(0.46, 0.2, [0, POST.top + 0.15, 0], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], ...m }),
      kit.sphere(0.04, [0, POST.top + 0.27, 0], 'sunYellow', { detail: 0, ...m }),
    ];
    for (const p of PONIES) parts.push(...pony(kit, p));
    // still decoration at both ends: hay bales and a flower bush
    parts.push(
      kit.box([0.3, 0.2, 0.22], [0, GROUND.h + 0.1, 0.8], 'sunYellow'),
      kit.box([0.32, 0.03, 0.04], [0, GROUND.h + 0.12, 0.8], 'brass'),
      kit.sphere(0.16, [0.1, 0.17, -0.8], 'leaf', { scale: [1.2, 0.9, 1.2] }),
      kit.sphere(0.04, [0.2, 0.3, -0.72], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.02, 0.3, -0.85], 'sunYellow', { detail: 0 }),
      kit.box([0.04, 0.34, 0.04], [-0.3, GROUND.h + 0.17, -0.8], 'wood'),
      kit.box([0.2, 0.12, 0.03], [-0.3, GROUND.h + 0.36, -0.8], 'blue'),
    );
    return kit.finish(parts);
  },
};
