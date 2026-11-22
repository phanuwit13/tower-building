import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ItemModel } from './contract';
import { getStyleKit, type Part } from './kit';
import { PALETTE, type PaletteColor } from './palette';
import { door, gableRoof, glassWindow, wallPanel, type Facing } from './parts';
import { validateItemModel } from './validate';

const kit = getStyleKit();

function bounds(parts: Part[]): THREE.Box3 {
  const b = new THREE.Box3();
  for (const p of parts) {
    p.geometry.computeBoundingBox();
    b.union(p.geometry.boundingBox!);
  }
  return b;
}
const hex = (g: THREE.BufferGeometry, name: 'color' | 'glowColor') =>
  new THREE.Color().fromBufferAttribute(g.attributes[name] as THREE.BufferAttribute, 0).getHex();
const paletteHex = (c: PaletteColor) => new THREE.Color(PALETTE[c]).getHex();

/** Distance of a box's near and far faces from a wall at `wall` along the facing's normal. */
function depth(b: THREE.Box3, facing: Facing, wall: number): [number, number] {
  const axis = facing[0] as 'x' | 'z';
  const sign = facing[1] === '+' ? 1 : -1;
  const near = sign > 0 ? b.min[axis] - wall : wall - b.max[axis];
  const far = sign > 0 ? b.max[axis] - wall : wall - b.min[axis];
  return [+near.toFixed(6), +far.toFixed(6)];
}

const FACINGS: Array<[Facing, [number, number, number], number]> = [
  ['x+', [0.8, 0.6, 0.1], 0.8],
  ['x-', [-0.8, 0.6, 0.1], -0.8],
  ['z+', [0.1, 0.6, 0.8], 0.8],
  ['z-', [0.1, 0.6, -0.8], -0.8],
];

describe('glassWindow', () => {
  it('is a frame, a sky-blue pane that glows warm at night, and a bar between two panes', () => {
    const parts = glassWindow(kit, { at: [0.8, 0.6, 0], facing: 'x+', w: 0.3, h: 0.32 });
    expect(parts).toHaveLength(3);
    const glass = parts.filter((p) => p.glow);
    expect(glass).toHaveLength(1);
    expect(hex(glass[0].geometry, 'color')).toBe(paletteHex('skyBlue'));
    expect(hex(glass[0].geometry, 'glowColor')).toBe(paletteHex('windowWarm'));
    for (const p of parts.filter((q) => !q.glow)) expect(hex(p.geometry, 'color')).toBe(paletteHex('teal'));
  });
  it('takes a frame colour and a number of panes', () => {
    const one = glassWindow(kit, { at: [0, 1, 0], facing: 'z+', w: 0.4, h: 0.4, frame: 'white', panes: 1 });
    expect(one).toHaveLength(2);
    expect(hex(one[0].geometry, 'color')).toBe(paletteHex('white'));
    expect(glassWindow(kit, { at: [0, 1, 0], facing: 'z+', w: 0.6, h: 0.4, panes: 3 })).toHaveLength(4);
  });
  for (const [facing, at, wall] of FACINGS) {
    it(`stands out from a wall facing ${facing} in layers at least 0.01 apart, never inside it`, () => {
      const parts = glassWindow(kit, { at, facing, w: 0.3, h: 0.32 });
      const layers = parts.map((p) => depth(bounds([p]), facing, wall));
      for (const [near] of layers) expect(near).toBe(0); // backs flush on the wall, hidden
      expect(layers.map(([, far]) => far)).toEqual([0.02, 0.03, 0.04]); // frame, glass, bar
      const b = bounds(parts);
      const across = facing[0] === 'x' ? b.max.z - b.min.z : b.max.x - b.min.x;
      expect(across).toBeCloseTo(0.3 + 0.08);
      expect(b.max.y - b.min.y).toBeCloseTo(0.32 + 0.08);
      expect(b.getCenter(new THREE.Vector3()).y).toBeCloseTo(0.6);
      expect(facing[0] === 'x' ? b.getCenter(new THREE.Vector3()).z : b.getCenter(new THREE.Vector3()).x).toBeCloseTo(0.1);
    });
  }
});

describe('door and wallPanel', () => {
  for (const [facing, at, wall] of FACINGS) {
    it(`a door on a wall facing ${facing} is a slab 0.03 out from the wall`, () => {
      const parts = door(kit, { at, facing, w: 0.3, h: 0.44, color: 'woodDark' });
      expect(parts).toHaveLength(1);
      const b = bounds(parts);
      expect(depth(b, facing, wall)).toEqual([0, 0.03]);
      expect(b.max.y - b.min.y).toBeCloseTo(0.44);
      expect(hex(parts[0].geometry, 'color')).toBe(paletteHex('woodDark'));
    });
  }
  it('a door can have a knob, in front of the door', () => {
    const parts = door(kit, { at: [0.5, 0.3, 0], facing: 'x+', w: 0.3, h: 0.5, color: 'red', knob: 'sunYellow' });
    expect(parts).toHaveLength(2);
    expect(hex(parts[1].geometry, 'color')).toBe(paletteHex('sunYellow'));
    expect(bounds([parts[1]]).min.x).toBeGreaterThanOrEqual(0.5 + 0.03 - 1e-6);
  });
  it('wallPanel puts any flat box on a wall and can glow', () => {
    const [p] = wallPanel(kit, { at: [0, 1, -0.5], facing: 'z-', w: 0.6, h: 0.2, depth: 0.02, color: 'navy', glow: 'lampWarm' });
    const b = bounds([p]);
    expect(depth(b, 'z-', -0.5)).toEqual([0, 0.02]);
    expect(b.max.x - b.min.x).toBeCloseTo(0.6);
    expect(p.glow).toBe(true);
    expect(hex(p.geometry, 'glowColor')).toBe(paletteHex('lampWarm'));
  });
});

describe('gableRoof', () => {
  const opts = { at: [0.1, 1, -0.2] as [number, number, number], length: 2, width: 1.2, rise: 0.4, eave: 0.15, color: 'red' as const };
  const pitch = Math.atan2(0.4, 0.6);
  it('is two slabs sloping from the ridge down past the walls, plus an optional ridge cap', () => {
    const plain = gableRoof(kit, opts);
    expect(plain).toHaveLength(2);
    const capped = gableRoof(kit, { ...opts, ridge: 'redDark' });
    expect(capped).toHaveLength(3);
    expect(hex(capped[2].geometry, 'color')).toBe(paletteHex('redDark'));
  });
  it('along z (default): the slabs meet over `at` and pass over the wall tops at ±width/2', () => {
    const b = bounds(gableRoof(kit, opts));
    const t = 0.08;
    // lowest point: the eave edge, `eave` past the wall and below the wall top along the slope
    expect(b.min.y).toBeCloseTo(1 - 0.15 * Math.tan(pitch));
    expect(b.max.y).toBeCloseTo(1 + 0.4 + t * Math.cos(pitch));
    expect(b.max.x).toBeCloseTo(0.1 + 0.6 + 0.15 + t * Math.sin(pitch));
    expect(b.min.x).toBeCloseTo(0.1 - (0.6 + 0.15 + t * Math.sin(pitch)));
    expect(b.max.z - b.min.z).toBeCloseTo(2);
    expect(b.getCenter(new THREE.Vector3()).z).toBeCloseTo(-0.2);
  });
  it('along x turns the same roof a quarter', () => {
    const b = bounds(gableRoof(kit, { ...opts, along: 'x', ridge: 'redDark' }));
    expect(b.max.x - b.min.x).toBeCloseTo(2 + 0.02); // the ridge cap pokes 0.01 past each end
    expect(b.max.z).toBeCloseTo(-0.2 + 0.6 + 0.15 + 0.08 * Math.sin(pitch));
    expect(b.min.y).toBeCloseTo(1 - 0.15 * Math.tan(pitch));
  });
  it('a thinner roof gets a thinner ridge cap', () => {
    const thick = bounds(gableRoof(kit, { ...opts, ridge: 'redDark' }));
    const thin = bounds(gableRoof(kit, { ...opts, ridge: 'redDark', thickness: 0.04 }));
    expect(thin.max.y).toBeLessThan(thick.max.y);
  });
});

describe('parts inside an item pass validation', () => {
  const house = (along: 'x' | 'z'): ItemModel => ({
    id: `test-house-${along}`, name: 'บ้านทดสอบ', category: 'building', footprint: { w: 2, d: 2 },
    build: (k) => k.finish([
      k.box([1.4, 1, 1.4], [0, 0.5, 0], 'cream'),
      k.wedge(along === 'z' ? [1.4, 0.4, 1.4] : [1.4, 0.4, 1.4], [0, 1.2, 0], 'cream', { rotate: [0, along === 'z' ? 0 : Math.PI / 2, 0] }),
      ...gableRoof(k, { at: [0, 1, 0], length: 1.6, width: 1.4, rise: 0.4, eave: 0.12, color: 'red', ridge: 'redDark', along }),
      ...glassWindow(k, { at: [0.7, 0.6, 0.35], facing: 'x+', w: 0.3, h: 0.3 }),
      ...glassWindow(k, { at: [-0.7, 0.6, 0], facing: 'x-', w: 0.3, h: 0.3, frame: 'white', panes: 1 }),
      ...glassWindow(k, { at: [0, 0.6, 0.7], facing: 'z+', w: 0.5, h: 0.3, panes: 3 }),
      ...glassWindow(k, { at: [0, 0.6, -0.7], facing: 'z-', w: 0.3, h: 0.3 }),
      ...door(k, { at: [0.7, 0.25, -0.3], facing: 'x+', w: 0.26, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...wallPanel(k, { at: [0.7, 0.85, -0.3], facing: 'x+', w: 0.4, h: 0.12, depth: 0.02, color: 'navy' }),
    ]),
  });
  it('a test house built from every helper, ridge along z and along x', () => {
    expect(validateItemModel(house('z'), kit)).toEqual([]);
    expect(validateItemModel(house('x'), kit)).toEqual([]);
  });
});
