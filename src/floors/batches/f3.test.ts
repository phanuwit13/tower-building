import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateFloorTile } from '../validate';
import { tiles } from './f3';

const kit = getStyleKit();

const EXPECTED = [
  ['mud', 'ดินโคลน', 'earth'], ['sand', 'ทราย', 'earth'], ['lawn-flowers', 'หญ้ามีดอกไม้', 'earth'],
  ['tilled-soil', 'แปลงดินยกร่อง', 'earth'], ['fallen-leaves', 'ใบไม้ร่วง', 'earth'],
  ['rubber-play', 'พื้นยางสนามเด็กเล่น', 'special'], ['carpet-red', 'พรมแดง', 'special'], ['snow', 'หิมะ', 'special'],
  ['hopscotch', 'ตั้งเตแปะ', 'special'], ['rainbow-path', 'ทางสีรุ้ง', 'special'],
] as const;

describe('floor tiles batch f3', () => {
  it('has its ten tiles with their ids, Thai names and groups', () => {
    expect(tiles.map((t) => [t.id, t.name, t.group])).toEqual(EXPECTED.map((e) => [...e]));
  });
  for (const t of tiles) {
    it(`${t.id} passes validateFloorTile`, () => expect(validateFloorTile(t, kit)).toEqual([]));
  }
});
