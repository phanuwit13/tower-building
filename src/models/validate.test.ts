import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from './kit';
import { validateItemModel, validateTheme } from './validate';
import type { ItemModel } from './contract';
import type { ThemeDef } from '../themes/types';

const kit = getStyleKit();

function model(over: Partial<ItemModel> = {}): ItemModel {
  return {
    id: 'sample', name: 'ตัวอย่าง', category: 'decoration', footprint: { w: 1, d: 1 },
    build: (k) => k.finish([k.box([0.8, 0.8, 0.8], [0, 0.4, 0], 'cream')]),
    ...over,
  };
}

describe('validateItemModel', () => {
  it('accepts a valid model', () => {
    expect(validateItemModel(model(), kit)).toEqual([]);
  });
  it('rejects a box wider than the footprint', () => {
    const m = model({ build: (k) => k.finish([k.box([1.2, 0.5, 0.5], [0, 0.25, 0], 'cream')]) });
    expect(validateItemModel(m, kit).join('|')).toContain('footprint');
  });
  it('turns a throwing build() into an error naming the item', () => {
    const m = model({ id: 'boom', build: () => { throw new Error('bad geometry'); } });
    const errs = validateItemModel(m, kit);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain('"boom"');
    expect(errs[0]).toContain('bad geometry');
  });
  it('rejects an empty group', () => {
    const errs = validateItemModel(model({ build: () => new THREE.Group() }), kit);
    expect(errs.join('|')).toContain('no meshes');
  });
  it('rejects a floating item (box does not start on the ground)', () => {
    const m = model({ build: (k) => k.finish([k.box([0.5, 0.5, 0.5], [0, 0.75, 0], 'cream')]) });
    expect(validateItemModel(m, kit).join('|')).toContain('ground');
  });
  it('rejects an item sunk below the ground', () => {
    const m = model({ build: (k) => k.finish([k.box([0.5, 0.5, 0.5], [0, 0.1, 0], 'cream')]) });
    expect(validateItemModel(m, kit).join('|')).toContain('ground');
  });
  it('rejects a mesh with its own material', () => {
    const m = model({
      build: () => new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5).translate(0, 0.25, 0), new THREE.MeshBasicMaterial()),
    });
    expect(validateItemModel(m, kit).join('|')).toContain('material');
  });
  it('rejects a model over the triangle budget', () => {
    const m = model({
      build: (k) => k.finish([k.sphere(0.4, [0, 0.4, 0], 'cream', { detail: 20 })]),
    });
    expect(validateItemModel(m, kit).join('|')).toContain('triangles');
  });
  it('rejects bad id, name, category, footprint, and too many meshes', () => {
    const errs = validateItemModel(
      model({ id: 'Bad Id', name: '', category: 'nope' as never, footprint: { w: 3, d: 3 } }), kit);
    expect(errs.length).toBeGreaterThanOrEqual(4);
    const many = model({
      build: () => {
        const g = new THREE.Group();
        for (let i = 0; i < 3; i++) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1).translate(0, 0.1, 0), kit.materials.body));
        return g;
      },
    });
    expect(validateItemModel(many, kit).join('|')).toContain('meshes');
  });
  it('finish merges into body + glow meshes with shared materials', () => {
    const g = kit.finish([
      kit.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream'),
      kit.cylinder(0.1, 0.1, 0.3, [0, 0.6, 0], 'cream', { glow: true }),
    ]);
    const meshes = g.children as THREE.Mesh[];
    expect(meshes).toHaveLength(2);
    expect(meshes.map((m) => m.material)).toEqual([kit.materials.body, kit.materials.glow]);
  });
  it('setGlowStrength updates the shared uniform', () => {
    kit.setGlowStrength(0.7);
    const shader = { uniforms: {} as Record<string, { value: number }>, fragmentShader: 'vec3 totalEmissiveRadiance = emissive;' };
    kit.materials.glow.onBeforeCompile(shader as never, null as never);
    expect(shader.uniforms.glowStrength.value).toBe(0.7);
    kit.setGlowStrength(0);
    expect(shader.uniforms.glowStrength.value).toBe(0);
  });
  it('getStyleKit is a singleton', () => {
    expect(getStyleKit()).toBe(kit);
  });
});

describe('validateItemModel hardening', () => {
  it('rejects a transformed root (rotation, offset, scale)', () => {
    const rot = model({ build: (k) => { const g = k.finish([k.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream')]); g.rotation.y = 0.5; return g; } });
    expect(validateItemModel(rot, kit).join('|')).toContain('transform the parts, not the returned group');
    const off = model({ build: (k) => { const g = k.finish([k.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream')]); g.position.x = 0.1; return g; } });
    expect(validateItemModel(off, kit).join('|')).toContain('transform the parts, not the returned group');
    const sc = model({ build: (k) => { const g = k.finish([k.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream')]); g.scale.setScalar(0.9); return g; } });
    expect(validateItemModel(sc, kit).join('|')).toContain('transform the parts, not the returned group');
  });
  it('rejects NaN geometry', () => {
    const m = model({ build: (k) => k.finish([k.box([NaN, 0.5, 0.5], [0, 0.25, 0], 'cream')]) });
    expect(validateItemModel(m, kit).join('|')).toContain('non-finite geometry');
  });
  it('rejects a raw mesh without a color attribute', () => {
    const m = model({ build: () => new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5).translate(0, 0.25, 0), kit.materials.body) });
    expect(validateItemModel(m, kit).join('|')).toContain('color');
  });
  it('rejects a vertex colour that is not in the palette', () => {
    const m = model({
      build: (k) => {
        const part = k.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream');
        const c = part.geometry.attributes.color as THREE.BufferAttribute;
        for (let i = 0; i < c.count; i++) c.setXYZ(i, 0.123, 0.456, 0.789);
        return k.finish([part]);
      },
    });
    expect(validateItemModel(m, kit).join('|')).toContain('palette');
  });
  it('rejects a build() that is not deterministic', () => {
    const m = model({ build: (k) => k.finish([k.box([0.4, 0.4, 0.4], [Math.random() * 0.2, 0.2, 0], 'cream')]) });
    expect(validateItemModel(m, kit).join('|')).toContain('build() must be deterministic');
  });
});

describe('validateTheme', () => {
  const theme = (items: ItemModel[]): ThemeDef => ({ id: 'school', name: 't', emoji: 'x', defaultGround: 'grass', items });
  it('flags duplicate ids and names and too few items', () => {
    const errs = validateTheme(theme([model(), model()]), kit, { minItems: 3 }).join('|');
    expect(errs).toContain('duplicate id');
    expect(errs).toContain('duplicate name');
    expect(errs).toContain('items');
  });
  it('passes a clean theme', () => {
    expect(validateTheme(theme([model(), model({ id: 'other', name: 'อื่น' })]), kit, { minItems: 2 })).toEqual([]);
  });
});
