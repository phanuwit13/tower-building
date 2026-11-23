import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateFloorTile } from '../validate';
import * as THREE from 'three';
import { tiles } from './f2';

const kit = getStyleKit();

const EXPECTED: Array<[string, string, string]> = [
  ['terrazzo', 'หินขัด', 'tile'],
  ['asphalt', 'ยางมะตอย', 'tile'],
  ['brick-herringbone', 'อิฐก้างปลา', 'stone'],
  ['gravel', 'กรวด', 'stone'],
  ['cobblestone', 'หินก้อนกลม', 'stone'],
  ['flagstone', 'หินแผ่นธรรมชาติ', 'stone'],
  ['stepping-stones', 'หินทางเดินบนหญ้า', 'stone'],
  ['paver-interlock', 'บล็อกตัวหนอน', 'stone'],
  ['grass-paver', 'บล็อกหญ้า', 'stone'],
  ['dirt', 'ดิน', 'earth'],
];

describe('floor tiles batch f2', () => {
  it('has the ten tiles with their ids, Thai names and groups', () => {
    expect(tiles.map((t) => [t.id, t.name, t.group])).toEqual(EXPECTED);
  });
  for (const t of tiles) {
    it(`${t.id} passes validateFloorTile`, () => expect(validateFloorTile(t, kit)).toEqual([]));
  }

  // Joints must show across cells: no raised piece may touch the cell edge.
  const raisedExtent = (id: string): number => {
    const obj = tiles.find((t) => t.id === id)!.build(kit);
    let ext = 0;
    obj.traverse((o) => {
      const pos = (o as THREE.Mesh).isMesh ? (o as THREE.Mesh).geometry.attributes.position : null;
      if (!pos) return;
      for (let i = 0; i < pos.count; i++) {
        if (pos.getY(i) > 0.0085) ext = Math.max(ext, Math.abs(pos.getX(i)), Math.abs(pos.getZ(i)));
      }
    });
    return ext;
  };
  for (const id of ['brick-herringbone', 'paver-interlock']) {
    it(`${id}: no brick or paver reaches the cell edge`, () => expect(raisedExtent(id)).toBeLessThan(0.5 - 0.005));
  }
  it('flagstone: every slab stays under 0.015', () => {
    const top = new THREE.Box3().setFromObject(tiles.find((t) => t.id === 'flagstone')!.build(kit)).max.y;
    expect(top).toBeLessThanOrEqual(0.015);
  });
});
