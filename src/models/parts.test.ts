import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { ItemModel } from './contract';
import { getStyleKit, type Part, type Vec3 } from './kit';
import { PALETTE, type PaletteColor } from './palette';
import { aim, along, barrelRoof, door, gableRoof, glassWindow, heading, ICO_LOW, rod, wallPanel, wheel, type Facing } from './parts';
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

const v3 = (a: Vec3) => new THREE.Vector3(...a);
const eulerOf = (a: Vec3) => new THREE.Euler(...a);

describe('aim, heading and along', () => {
  const dirs: Vec3[] = [[0, 1, 0], [1, 0, 0], [0, 0, -2], [0.3, -0.5, 0.8], [-1, 1, 1], [0, -1, 0]];
  for (const turn of ['x', 'y'] as const) {
    for (const d of dirs) {
      it(`turn '${turn}' points +y along [${d}]`, () => {
        const out = new THREE.Vector3(0, 1, 0).applyEuler(eulerOf(aim(d, turn)));
        expect(out.distanceTo(v3(d).normalize())).toBeLessThan(1e-9);
      });
    }
  }
  it('heading: yaw 0 is +x, yaw 90 degrees is -z, pitch lifts it; a part rotated [0, yaw, pitch] has +x along it', () => {
    expect(heading(0, 0)).toEqual([1, 0, -0]);
    const [x, , z] = heading(Math.PI / 2, 0);
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(-1);
    expect(heading(0.7, Math.PI / 2)[1]).toBeCloseTo(1);
    for (const [yaw, pitch] of [[0.4, 0.3], [2.5, -0.6]]) {
      const out = new THREE.Vector3(1, 0, 0).applyEuler(eulerOf([0, yaw, pitch]));
      expect(out.distanceTo(v3(heading(yaw, pitch)))).toBeLessThan(1e-9);
    }
  });
  it('along moves a point s along a direction', () => {
    expect(along([1, 2, 3], [0, 1, 0], 0.5)).toEqual([1, 2.5, 3]);
  });
});

describe('rod', () => {
  it('runs from a to b with the given radius, colour and segments', () => {
    const a: Vec3 = [0.1, 0.2, -0.3], b: Vec3 = [0.5, 0.9, 0.4];
    const part = rod(kit, a, b, 0.03, 'red', { segments: 4 });
    const box = bounds([part]);
    const len = v3(a).distanceTo(v3(b));
    // 4-sided: the end rings are squares (corners at the radius * sqrt 2 across), so check both end centres through the bounds' middle
    expect(box.getCenter(new THREE.Vector3()).distanceTo(v3(a).add(v3(b)).multiplyScalar(0.5))).toBeLessThan(1e-6);
    expect(box.max.y - box.min.y).toBeGreaterThan(0.7 - 0.03 * 2);
    expect(box.max.y - box.min.y).toBeLessThan(0.7 + 0.03 * 2);
    expect(part.geometry.attributes.position.count).toBe(4 * 12); // 4 sides: 4 side quads, 2 end fans
    expect(hex(part.geometry, 'color')).toBe(paletteHex('red'));
    expect(part.glow).toBe(false);
    expect(len).toBeCloseTo(Math.hypot(0.4, 0.7, 0.7));
  });
  it('stands on its end points: every vertex lies between the end planes', () => {
    const a: Vec3 = [0, 0, 0], b: Vec3 = [0.6, 0.3, -0.2];
    const axis = v3(b).sub(v3(a)).normalize();
    const pos = rod(kit, a, b, 0.02, 'wood').geometry.attributes.position;
    const len = v3(b).length();
    for (let i = 0; i < pos.count; i++) {
      const along_ = new THREE.Vector3().fromBufferAttribute(pos, i).dot(axis);
      expect(along_).toBeGreaterThan(-1e-6);
      expect(along_).toBeLessThan(len + 1e-6);
    }
  });
  it('defaults to 6 segments and can glow', () => {
    expect(rod(kit, [0, 0, 0], [0, 1, 0], 0.02, 'wood').geometry.attributes.position.count).toBe(6 * 12);
    expect(rod(kit, [0, 0, 0], [0, 1, 0], 0.02, 'sunYellow', { glow: true }).glow).toBe(true);
  });
});

describe('barrelRoof', () => {
  const roof = (alongAxis: 'x' | 'z') => barrelRoof(kit, {
    at: [0.1, 0.5, -0.2], length: 2, width: 1.6, rise: 0.7, color: 'teal', along: alongAxis, spring: 0.2, thickness: 0.06,
    endWall: { color: 'cream', length: 1.9 },
  });
  it('makes a slab and an end wedge per segment (8 by default), teal slabs and cream wedges', () => {
    const parts = roof('x');
    expect(parts).toHaveLength(16);
    expect(hex(parts[0].geometry, 'color')).toBe(paletteHex('teal'));
    expect(hex(parts[1].geometry, 'color')).toBe(paletteHex('cream'));
    expect(barrelRoof(kit, { at: [0, 0, 0], length: 1, width: 1, rise: 0.5, color: 'red', segments: 6 })).toHaveLength(6);
  });
  it('along x: spans the roof length centred on at[0], crowns rise above at[1], centred across on at[2]', () => {
    const slabs = roof('x').filter((_, i) => i % 2 === 0);
    const b = bounds(slabs);
    expect(b.max.x - b.min.x).toBeCloseTo(2);
    expect(b.getCenter(new THREE.Vector3()).x).toBeCloseTo(0.1);
    expect(b.max.y).toBeGreaterThan(0.5 + 0.7); // the crown: the ellipse top plus the slab's thickness
    expect(b.max.y).toBeLessThan(0.5 + 0.7 + 0.1);
    expect(b.max.z + b.min.z).toBeCloseTo(-0.4, 1); // symmetric about z = -0.2
    expect(b.max.z - b.min.z).toBeLessThan(1.6 + 0.2);
    expect(b.max.z - b.min.z).toBeGreaterThan(1.6 * Math.cos(0.2) - 0.1);
  });
  it('along z is the same roof turned: spans the length along z and the width along x', () => {
    const slabs = roof('z').filter((_, i) => i % 2 === 0);
    const b = bounds(slabs);
    expect(b.max.z - b.min.z).toBeCloseTo(2);
    expect(b.getCenter(new THREE.Vector3()).z).toBeCloseTo(-0.2);
    expect(b.max.y).toBeGreaterThan(0.5 + 0.7);
    expect(b.max.y).toBeLessThan(0.5 + 0.7 + 0.1);
    expect(b.max.x + b.min.x).toBeCloseTo(0.2, 1);
    expect(b.max.x - b.min.x).toBeGreaterThan(1.6 * Math.cos(0.2) - 0.1);
  });
  for (const alongAxis of ['x', 'z'] as const) {
    it(`along ${alongAxis}: the end wall fills under the arch, stays under the slabs and inside its own length`, () => {
      const parts = roof(alongAxis);
      const walls = bounds(parts.filter((_, i) => i % 2 === 1));
      const slabs = bounds(parts.filter((_, i) => i % 2 === 0));
      const axis = alongAxis;
      expect(walls.max[axis] - walls.min[axis]).toBeCloseTo(1.9);
      expect(walls.max.y).toBeLessThan(slabs.max.y);
      expect(walls.min.y).toBeGreaterThan(0.5 - 0.7 * Math.sin(0.2) - 0.1); // below, only down to where the arch springs
    });
  }
  it('every slab stays outside the wedge below it (no wedge pokes through its slab)', () => {
    for (const alongAxis of ['x', 'z'] as const) {
      const parts = roof(alongAxis);
      // all end-wall points lie inside the half ellipse (a = 0.8, b = 0.7 about (u0, y0))
      const u0 = alongAxis === 'x' ? -0.2 : 0.1;
      for (const w of parts.filter((_, i) => i % 2 === 1)) {
        const pos = w.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = (alongAxis === 'x' ? pos.getZ(i) : pos.getX(i)) - u0;
          const y = pos.getY(i) - 0.5;
          expect((u / 0.8) ** 2 + (y / 0.7) ** 2).toBeLessThan(1 + 1e-6);
        }
      }
    }
  });
  it('without an endWall there are only slabs', () => {
    const parts = barrelRoof(kit, { at: [0, 0, 0], length: 1, width: 1, rise: 0.5, color: 'red' });
    expect(parts).toHaveLength(8);
    expect(parts.every((p) => hex(p.geometry, 'color') === paletteHex('red'))).toBe(true);
  });
});

describe('wheel', () => {
  const base = { at: [0.2, 0.3, -0.1] as Vec3, radius: 0.25, tube: 0.04, color: 'charcoal' as PaletteColor };
  it('axis z stands in the x-y plane: wide in x and y, thin in z, centred on `at`', () => {
    const b = bounds(wheel(kit, { ...base, axis: 'z' }));
    expect(b.max.x - b.min.x).toBeCloseTo(0.5 + 2 * 0.04, 1);
    expect(b.max.y - b.min.y).toBeCloseTo(0.5 + 2 * 0.04, 1);
    expect(b.max.z - b.min.z).toBeLessThan(0.1);
    expect(b.getCenter(new THREE.Vector3()).distanceTo(v3(base.at))).toBeLessThan(0.02);
  });
  it('axis x stands in the z-y plane', () => {
    const b = bounds(wheel(kit, { ...base, axis: 'x' }));
    expect(b.max.z - b.min.z).toBeCloseTo(0.5 + 2 * 0.04, 1);
    expect(b.max.y - b.min.y).toBeCloseTo(0.5 + 2 * 0.04, 1);
    expect(b.max.x - b.min.x).toBeLessThan(0.1);
  });
  it('is tyre then (optional hub) then spokes, in the given colours', () => {
    const plain = wheel(kit, { ...base, axis: 'z' });
    expect(plain).toHaveLength(3); // tyre + 2 spokes
    expect(hex(plain[0].geometry, 'color')).toBe(paletteHex('charcoal'));
    expect(hex(plain[1].geometry, 'color')).toBe(paletteHex('white'));
    const hubbed = wheel(kit, { ...base, axis: 'x', hubColor: 'stone', spokes: 3, spokeColor: 'wood' });
    expect(hubbed).toHaveLength(5);
    expect(hex(hubbed[1].geometry, 'color')).toBe(paletteHex('stone'));
    expect(hex(hubbed[2].geometry, 'color')).toBe(paletteHex('wood'));
  });
  it('the tyre reaches the very bottom (radius + tube below centre) with 8 or 12 tubular segments, not with 10', () => {
    for (const tubularSegments of [8, 12]) {
      expect(bounds([wheel(kit, { ...base, axis: 'z', tubularSegments })[0]]).min.y).toBeCloseTo(0.3 - 0.29, 6);
    }
    expect(bounds([wheel(kit, { ...base, axis: 'z', tubularSegments: 10 })[0]]).min.y).toBeGreaterThan(0.3 - 0.29 + 1e-4);
  });
  it('spokes span the wheel diameter, are turned apart, and a hub has the hub colour at the centre', () => {
    const parts = wheel(kit, { ...base, axis: 'z', spokes: 2, hubColor: 'stone', hubRadius: 0.05, hubLength: 0.12 });
    const spokeB = bounds([parts[2]]);
    expect(spokeB.max.y - spokeB.min.y).toBeGreaterThan(0.5 * 0.7);
    const hubB = bounds([parts[1]]);
    expect(hubB.max.z - hubB.min.z).toBeCloseTo(0.12, 6); // hub along the axle
    expect(hubB.getCenter(new THREE.Vector3()).distanceTo(v3(base.at))).toBeLessThan(1e-6);
  });
});

describe('ICO_LOW', () => {
  it('is how far a detail-0 sphere reaches below its centre, as a share of its radius', () => {
    const b = bounds([kit.sphere(1, [0, 0, 0], 'red', { detail: 0 })]);
    expect(-b.min.y).toBeCloseTo(ICO_LOW, 3);
  });
});
