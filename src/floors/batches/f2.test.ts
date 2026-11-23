import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateFloorTile } from '../validate';
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
});
