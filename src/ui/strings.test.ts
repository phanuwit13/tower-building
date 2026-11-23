import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { T } from './strings';

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
    expect(T.confirmRestart).toContain('เริ่มเมืองใหม่ไหม?');
  });
});
