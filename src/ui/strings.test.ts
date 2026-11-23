import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { builtLabel, T } from './strings';

describe('boot fallback text', () => {
  it('public/boot-check.js carries exactly T.noWebGL', () => {
    const js = readFileSync('public/boot-check.js', 'utf8');
    expect(js).toContain(`'${T.noWebGL}'`);
  });
  it('tells the child to reload', () => {
    expect(T.noWebGL).toBe('เครื่องนี้เปิดเกม 3 มิติไม่ได้ ลองกดโหลดหน้าใหม่ หรือเปิดด้วย Chrome หรือ Safari รุ่นใหม่');
  });
});

describe('floor strings', () => {
  it('the floor drawer labels, verbatim', () => {
    expect(T.floor.open).toBe('พื้น');
    expect(T.floor.eraser).toBe('ยางลบ');
    expect(T.floor.done).toBe('เสร็จ');
    expect(T.floor.paint).toBe('🖌 ปูพื้น');
    expect(T.floor.camera).toBe('✋ ขยับกล้อง');
  });
  it('the restart confirm says the floor is cleared too', () => {
    expect(T.confirmRestart).toContain('พื้น');
  });
});

describe('one city per theme', () => {
  it('the 🏠 button and the theme select badge, verbatim', () => {
    expect(T.home).toBe('🏠 เปลี่ยนธีม');
    expect(builtLabel(32)).toBe('สร้างแล้ว 32 ชิ้น');
    expect(T.cityDone).toBe('เมืองเสร็จแล้ว');
    expect(T.floorsOnly).toBe('ปูพื้นไว้แล้ว');
  });
  it('เริ่มใหม่ says only this city starts again; the other themes\' cities stay', () => {
    expect(T.confirmRestart).toContain('เริ่มเมืองนี้ใหม่ไหม?');
    expect(T.confirmRestart).toContain('ธีมอื่น');
  });
  it('เคลียร์ says every city goes', () => {
    expect(T.confirmClear).toContain('ทุกเมือง');
    expect(T.confirmClearOk).toContain('ทุกเมือง');
  });
});
