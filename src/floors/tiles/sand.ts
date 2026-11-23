import type { Part } from '../../models/kit';
import type { PaletteColor } from '../../models/palette';
import type { FloorTile } from '../types';

const BASE_H = 0.01;
const RIPPLE_H = 0.0035;
const PEBBLE_H = 0.005; // top at 0.015, the most a tile may rise
const LOOKS = 6;

/** A tiny seeded random (mulberry32): a look is the same on every build. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One look of the sand: thin pale wind ripples, roughly along x like real ones but each its own
 * length, place and slant, and now and then a pebble. Six looks scattered over the map by cell
 * (cellVariant) keep a wide sand area from showing one stamped pattern per cell. Everything stays
 * clear of the cell edge, so a neighbour never shows a seam.
 */
function look(kit: Parameters<FloorTile['build']>[0], v: number): Part[] {
  const r = seeded(0x5a2d + v * 977);
  const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'sand')];
  for (const row of [-0.3, 0, 0.3]) {
    if (v > 0 && r() < 0.25) continue; // the first look (the thumbnail) keeps all three
    const len = 0.18 + r() * 0.22;
    const width = 0.022 + r() * 0.012;
    const slant = (r() - 0.5) * 0.35;
    const room = 0.5 - 0.06 - len / 2;
    const x = (r() * 2 - 1) * room;
    const z = row + (r() * 2 - 1) * 0.07;
    parts.push(kit.box([len, RIPPLE_H, width], [x, BASE_H + RIPPLE_H / 2, z], 'cream', { rotate: [0, slant, 0] }));
  }
  const pebbles = v === 0 ? 1 : Math.floor(r() * 2.4); // 0 to 2
  for (let i = 0; i < pebbles; i++) {
    const s = 0.035 + r() * 0.03;
    const colour: PaletteColor = r() < 0.3 ? 'stone' : 'wood';
    parts.push(kit.box([s, PEBBLE_H, s * 0.8], [(r() * 2 - 1) * 0.38, BASE_H + PEBBLE_H / 2, (r() * 2 - 1) * 0.38], colour, { rotate: [0, r() * Math.PI, 0] }));
  }
  return parts;
}

/** ทราย: warm sand with thin pale wind ripples and the odd pebble, in six looks so a wide area looks natural. */
export const tile: FloorTile = {
  id: 'sand',
  name: 'ทราย',
  group: 'earth',
  variants: LOOKS,
  build: (kit, variant = 0) => kit.finish(look(kit, variant)),
};
