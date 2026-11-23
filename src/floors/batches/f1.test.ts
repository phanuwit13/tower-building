import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateFloorTile } from '../validate';
import { tiles } from './f1';

const kit = getStyleKit();

const EXPECTED: Array<[string, string, string]> = [
  ['wood-dark', 'พื้นไม้เข้ม', 'wood'],
  ['parquet-herringbone', 'ไม้ปาร์เก้ก้างปลา', 'wood'],
  ['deck-boards', 'ไม้ระแนงระเบียง', 'wood'],
  ['parquet-square', 'ไม้ปาร์เก้ตาราง', 'wood'],
  ['concrete', 'ปูนเรียบ', 'tile'],
  ['concrete-slabs', 'แผ่นปูนสี่เหลี่ยม', 'tile'],
  ['tile-white', 'กระเบื้องขาว', 'tile'],
  ['tile-checker', 'กระเบื้องหมากรุก', 'tile'],
  ['tile-hex', 'กระเบื้องหกเหลี่ยม', 'tile'],
  ['tile-blue', 'กระเบื้องลายฟ้าขาว', 'tile'],
];

describe('floor tiles batch f1', () => {
  it('has the ten tiles with their Thai names and groups, in order', () => {
    expect(tiles.map((t) => [t.id, t.name, t.group])).toEqual(EXPECTED);
  });
  for (const t of tiles) {
    it(`${t.id} passes validateFloorTile`, () => expect(validateFloorTile(t, kit)).toEqual([]));
  }
});
