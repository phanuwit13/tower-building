import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../models/kit';
import { fingerprint, printDiffs } from './geometry.test-helper';

const kit = getStyleKit();
const crate = (h = 0.5, glow = false) => kit.finish([
  kit.box([0.6, h, 0.6], [0, h / 2, 0], 'wood'),
  ...(glow ? [kit.sphere(0.1, [0, h + 0.1, 0], 'lampWarm', { glow: true })] : []),
]);

describe('geometry fingerprint', () => {
  it('prints each mesh: triangles, bounding box and the sums of positions and colours', () => {
    const [body, lamp] = fingerprint(crate(0.5, true));
    expect(body.tris).toBe(12);
    expect(body.min.map((v) => +v.toFixed(5))).toEqual([-0.3, 0, -0.3]);
    expect(body.max.map((v) => +v.toFixed(5))).toEqual([0.3, 0.5, 0.3]);
    expect(body.glowColor).toBe(0);
    expect(lamp.glowColor).toBeGreaterThan(0);
  });
  it('the same build prints the same; any change in shape, size or mesh count shows', () => {
    expect(printDiffs(fingerprint(crate()), fingerprint(crate()))).toEqual([]);
    expect(printDiffs(fingerprint(crate()), fingerprint(crate(0.52))).join()).toMatch(/mesh 0: .*max/);
    expect(printDiffs(fingerprint(crate()), fingerprint(crate(0.5, true))).join()).toMatch(/1 mesh.*2/);
    const more = fingerprint(crate());
    more[0] = { ...more[0], tris: 14 };
    expect(printDiffs(fingerprint(crate()), more).join()).toMatch(/tris 12 -> 14/);
  });
  it('allows float noise below the tolerance', () => {
    const a = fingerprint(crate());
    const b = a.map((p) => ({ ...p, pos: p.pos + 1e-4 }));
    expect(printDiffs(a, b)).toEqual([]);
    expect(printDiffs(a, b.map((p) => ({ ...p, pos: p.pos + 1e-2 }))).join()).toMatch(/pos/);
  });
});
