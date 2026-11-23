import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { quadruped, type QuadSpec } from './cow-pen';

// A mud wallow (2×3): a muddy brown pool with the water `pond` motion, a grey buffalo standing in it, one lying down, egrets on the bank.
const BANK_H = 0.03;
const MUD_H = 0.04;
const WATER_H = 0.05; // water top, just above the ground
const POOL = { w: 1.5, d: 2.5 };

const BUFFALO: Omit<QuadSpec, 'x' | 'z' | 'yaw' | 'leg'> = {
  len: 0.85, wid: 0.42, hgt: 0.34, color: 'stoneDark', head: 0.15, muzzle: 'stone', snout: 1.15,
  ear: 'flop', earColor: 'stoneDark', horn: 'out', hornColor: 'stone', tail: 'charcoal',
};

/** A white egret: round body, a long neck, a yellow beak, thin legs. Faces +x at yaw 0. */
function egret(kit: Parameters<ItemModel['build']>[0], x: number, z: number, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const n = Math.sin(yaw);
  const pt = (f: number, u: number, s = 0): [number, number, number] => [x + f * c + s * n, BANK_H + u, z - f * n + s * c];
  const rotate: [number, number, number] = [0, yaw, 0];
  return [
    kit.cylinder(0.014, 0.014, 0.14, pt(0, 0.07, 0.03), 'orange', { segments: 4 }),
    kit.cylinder(0.014, 0.014, 0.14, pt(0, 0.07, -0.03), 'orange', { segments: 4 }),
    kit.sphere(1, pt(0, 0.19, 0), 'white', { scale: [0.11, 0.07, 0.065], rotate }),
    kit.sphere(1, pt(-0.12, 0.2, 0), 'white', { detail: 0, scale: [0.07, 0.03, 0.04], rotate }),
    kit.cylinder(0.025, 0.035, 0.17, pt(0.08, 0.3, 0), 'white', { segments: 6 }),
    kit.sphere(0.05, pt(0.09, 0.4, 0), 'white', { detail: 0, scale: [1.1, 1, 0.95], rotate }),
    kit.cone(0.022, 0.09, pt(0.18, 0.395, 0), 'sunYellow', { segments: 5, rotate: [0, yaw, -Math.PI / 2] }),
    kit.sphere(0.013, pt(0.12, 0.415, 0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.013, pt(0.12, 0.415, -0.04), 'charcoal', { detail: 0 }),
  ];
}

/** ปลักควาย: a muddy brown pool with two buffaloes, one lying in the water, and white egrets on the bank. */
export const item: ItemModel = {
  id: 'buffalo-wallow',
  name: 'ปลักควาย',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, BANK_H, 2.98], [0, BANK_H / 2, 0], 'lime'),
      kit.box([POOL.w + 0.2, MUD_H, POOL.d + 0.2], [0, MUD_H / 2, 0], 'bark'),
      kit.box([POOL.w, WATER_H, POOL.d], [0, WATER_H / 2, 0], 'woodDark', { motion: { kind: 'water', water: 'pond' } }),
    ];
    parts.push(
      ...quadruped(kit, WATER_H, { ...BUFFALO, x: 0.1, z: -0.7, yaw: -0.5, leg: 0.15 }),
      ...quadruped(kit, 0.02, { ...BUFFALO, x: -0.15, z: 0.55, yaw: 0.4, leg: 0, len: 0.8, hgt: 0.36 }),
    );
    parts.push(...egret(kit, -0.72, 1.3, 0.6), ...egret(kit, 0.82, 1.25, -1.2), ...egret(kit, -0.78, -0.2, 2.2));
    // reeds, a rock and a bush on the bank
    for (const [x, z, h] of [[0.9, -1.35, 0.4], [0.8, -1.4, 0.32], [-0.9, -1.35, 0.42], [-0.8, -1.4, 0.34]] as const) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, BANK_H + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.1, [x, BANK_H + h + 0.02, z], 'bark', { segments: 6 }),
      );
    }
    parts.push(
      kit.sphere(0.14, [0.85, BANK_H + 0.08, 0.2], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.2, [0.78, BANK_H + 0.12, -1.0], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.13, [0.82, BANK_H + 0.08, -0.82], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
