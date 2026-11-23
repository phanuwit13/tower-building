import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from '../models/kit';
import { FLOOR_GROUPS, FLOOR_TILES, getFloorTile, isFloorTile } from './index';
import { validateFloorTile } from './validate';
import type { FloorTile } from './types';

const kit = getStyleKit();

const tile = (over: Partial<FloorTile> = {}): FloorTile => ({
  id: 'sample', name: 'ตัวอย่าง', group: 'tile',
  build: (k) => k.finish([k.box([1, 0.01, 1], [0, 0.005, 0], 'cream')]),
  ...over,
});

describe('floor registry', () => {
  it('has unique ids and Thai names, and known groups', () => {
    expect(new Set(FLOOR_TILES.map((t) => t.id)).size).toBe(FLOOR_TILES.length);
    expect(new Set(FLOOR_TILES.map((t) => t.name)).size).toBe(FLOOR_TILES.length);
    const groups = FLOOR_GROUPS.map((g) => g.id);
    for (const t of FLOOR_TILES) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/);
      expect(t.name.trim()).not.toBe('');
      expect(groups).toContain(t.group);
    }
    for (const g of FLOOR_GROUPS) expect(g.name.trim()).not.toBe('');
  });
  it('looks tiles up by id', () => {
    expect(getFloorTile('lawn')?.name).toBe('สนามหญ้า');
    expect(getFloorTile('nope')).toBeUndefined();
    expect(isFloorTile('brick-red')).toBe(true);
    expect(isFloorTile('nope')).toBe(false);
  });
  it('starts with the four first tiles, then the three sculpted batches: 34 tiles, every id unique', () => {
    const ids = FLOOR_TILES.map((t) => t.id);
    expect(ids.slice(0, 4)).toEqual(['wood-light', 'brick-red', 'lawn', 'water-shallow']);
    expect(ids).toHaveLength(34);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('validateFloorTile', () => {
  for (const t of FLOOR_TILES) {
    it(`accepts ${t.id}`, () => expect(validateFloorTile(t, kit)).toEqual([]));
  }
  it('rejects a tile 0.016 high (the tolerance is float noise, not a free millimetre)', () => {
    const t = tile({ build: (k) => k.finish([k.box([1, 0.016, 1], [0, 0.008, 0], 'cream')]) });
    expect(validateFloorTile(t, kit).join('|')).toContain('top is');
  });
  it('accepts a minimal tile', () => expect(validateFloorTile(tile(), kit)).toEqual([]));
  it('rejects a tile wider than its cell', () => {
    const t = tile({ build: (k) => k.finish([k.box([1.2, 0.01, 1], [0, 0.005, 0], 'cream')]) });
    expect(validateFloorTile(t, kit).join('|')).toContain('footprint');
  });
  it('rejects a tile taller than 0.015 and accepts exactly 0.015', () => {
    expect(validateFloorTile(tile({ build: (k) => k.finish([k.box([1, 0.015, 1], [0, 0.0075, 0], 'cream')]) }), kit)).toEqual([]);
    const t = tile({ build: (k) => k.finish([k.box([1, 0.02, 1], [0, 0.01, 0], 'cream')]) });
    expect(validateFloorTile(t, kit).join('|')).toContain('top is');
  });
  it('rejects a tile over 160 triangles', () => {
    const t = tile({
      build: (k) => k.finish(Array.from({ length: 14 }, (_, i) => k.box([0.1, 0.02, 0.1], [-0.4 + i * 0.05, 0.01, 0], 'cream'))),
    });
    expect(validateFloorTile(t, kit).join('|')).toContain('triangles');
  });
  it('rejects a glowing tile', () => {
    const t = tile({ build: (k) => k.finish([k.box([1, 0.02, 1], [0, 0.01, 0], 'lampWarm', { glow: true })]) });
    expect(validateFloorTile(t, kit).join('|')).toContain('glow');
  });
  it('rejects a tile of more than 2 meshes', () => {
    const t = tile({ build: () => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.1), kit.materials.body)); return g; } });
    expect(validateFloorTile(t, kit).join('|')).toContain('meshes');
  });
  it('rejects a mesh with its own material', () => {
    const t = tile({ build: () => new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1).translate(0, 0.01, 0), new THREE.MeshBasicMaterial()) });
    expect(validateFloorTile(t, kit).join('|')).toContain('material');
  });
  it('rejects an unknown group, names the tile, and reports a throwing build', () => {
    const errs = validateFloorTile(tile({ id: 'boom', group: 'x' as never, build: () => { throw new Error('bad'); } }), kit);
    expect(errs.join('|')).toContain('floor tile "boom"');
    expect(errs.join('|')).toContain('bad');
    expect(errs.join('|')).toContain('group');
  });
  it('water-shallow marks its surface as pond water', () => {
    const g = getFloorTile('water-shallow')!.build(kit);
    let kind = -1;
    g.traverse((o) => { if ((o as THREE.Mesh).isMesh) kind = (o as THREE.Mesh).geometry.attributes.anim.getX(0); });
    expect(kind).toBeGreaterThan(0);
  });
});
