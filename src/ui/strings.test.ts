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
