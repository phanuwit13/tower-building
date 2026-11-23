import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from '../../models/kit';
import { LIGHT_CODE, LIGHT_STRIDE, MOTION_CODE, type LightKind, type MotionKind } from '../../models/motion';
import { school } from './index';

/** The motion kinds and light patterns every built item carries (read back from its vertex attributes). */
function animationOf(id: string) {
  const item = school.items.find((i) => i.id === id)!;
  const motions = new Set<string>();
  const lights = new Set<string>();
  const pivots = new Map<string, Set<string>>();
  const axes = new Map<string, Set<string>>();
  item.build(getStyleKit()).traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry;
    const anim = g.attributes.anim;
    const pivot = g.attributes.pivot;
    const axis = g.attributes.axis;
    for (let i = 0; i < anim.count; i++) {
      const packed = Math.round(anim.getX(i));
      const light = Math.floor(packed / LIGHT_STRIDE);
      const motion = packed - light * LIGHT_STRIDE;
      const name = Object.entries(MOTION_CODE).find(([, c]) => c === motion)![0];
      if (motion) {
        motions.add(name);
        const set = pivots.get(name) ?? new Set<string>();
        set.add([pivot.getX(i), pivot.getY(i), pivot.getZ(i)].map((v) => v.toFixed(4)).join(','));
        pivots.set(name, set);
        const axisSet = axes.get(name) ?? new Set<string>();
        axisSet.add([axis.getX(i), axis.getY(i), axis.getZ(i)].map((v) => v.toFixed(4)).join(','));
        axes.set(name, axisSet);
      }
      if (light) lights.add(Object.entries(LIGHT_CODE).find(([, c]) => c === light)![0]);
    }
  });
  return { motions, lights, pivots, axes };
}

const MOTION: Record<string, MotionKind[]> = {
  tree: ['sway'], 'banana-tree': ['sway'], 'coconut-palm': ['sway'], 'flower-planter': ['sway'],
  'flower-garden': ['sway'], 'vegetable-garden': ['sway'], flagpole: ['wave'],
  'merry-go-round': ['spin'], 'swing-set': ['swing'], seesaw: ['swing'],
};
const LIGHT: Record<string, LightKind[]> = {
  'street-lamp': ['breathe'], canteen: ['breathe'], 'bus-stop': ['blink'], 'school-bus': ['blink'],
  classroom: ['window'], library: ['window'], 'science-lab': ['window'], 'assembly-hall': ['window'], 'garden-shed': ['window'],
};

describe('school item animation', () => {
  for (const [id, kinds] of Object.entries(MOTION)) {
    it(`${id} moves: ${kinds.join(', ')}`, () => {
      const { motions } = animationOf(id);
      for (const k of kinds) expect(motions.has(k)).toBe(true);
    });
  }
  for (const [id, kinds] of Object.entries(LIGHT)) {
    it(`${id} lights: ${kinds.join(', ')}`, () => {
      const { lights } = animationOf(id);
      for (const k of kinds) expect(lights.has(k)).toBe(true);
    });
  }
  it('the ponds and the pool are water', () => {
    expect(animationOf('fish-pond').motions.has('pond')).toBe(true);
    expect(animationOf('swimming-pool').motions.has('pool')).toBe(true);
  });
  it('the swaying plants of one item share one pivot (they bend together)', () => {
    for (const id of ['tree', 'banana-tree', 'coconut-palm', 'flower-planter', 'flower-garden', 'vegetable-garden']) {
      expect(animationOf(id).pivots.get('sway')!.size, id).toBe(1);
    }
  });
  it('the flag cloth shares one pivot', () => {
    expect(animationOf('flagpole').pivots.get('wave')!.size).toBe(1);
  });
  it('the swing set hangs each swing from its own pivot on the top bar, and swings about the bar (x)', () => {
    const { pivots, axes, motions } = animationOf('swing-set');
    expect([...motions]).toEqual(['swing']);
    const points = [...pivots.get('swing')!].map((p) => p.split(',').map(Number));
    expect(points.length).toBeGreaterThanOrEqual(2); // one per swing
    for (const [x, y, z] of points) {
      expect(y).toBeCloseTo(1.24, 4); // the top bar
      expect(z).toBeCloseTo(0, 4);
      expect(Math.abs(x)).toBeLessThan(0.86); // within the bar's length
    }
    expect(new Set(points.map((p) => p[0])).size).toBe(points.length); // distinct pivots
    expect([...axes.get('swing')!]).toEqual(['1.0000,0.0000,0.0000']);
  });
  it('the seesaw rocks as one piece: a single shared swing pivot on the fulcrum, about x', () => {
    const { pivots, axes, motions } = animationOf('seesaw');
    expect([...motions]).toEqual(['swing']);
    expect([...pivots.get('swing')!]).toEqual(['0.0000,0.3200,0.0000']);
    expect([...axes.get('swing')!]).toEqual(['1.0000,0.0000,0.0000']);
  });
  it('the merry-go-round spins as one piece about its centre axis', () => {
    const { pivots, axes, motions } = animationOf('merry-go-round');
    expect([...motions]).toEqual(['spin']);
    expect([...pivots.get('spin')!]).toEqual(['0.0000,0.0000,0.0000']);
    expect([...axes.get('spin')!]).toEqual(['0.0000,1.0000,0.0000']);
  });
  it('every building that uses glassWindow has per-pane window lights', () => {
    for (const id of ['assembly-hall', 'classroom', 'library', 'garden-shed', 'science-lab', 'school-bus']) {
      expect(animationOf(id).lights.has('window'), id).toBe(true);
    }
  });
});
