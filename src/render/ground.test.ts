import { describe, expect, it } from 'vitest';
import { PALETTE, type PaletteColor } from '../models/palette';
import { GROUND_COLORS } from './ground';

/** sRGB hex -> CIE L*a*b* (D65). */
function lab(hex: number): [number, number, number] {
  const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const r = lin((hex >> 16) & 255), g = lin((hex >> 8) & 255), b = lin(hex & 255);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
const deltaE = (a: number, b: number): number => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]) as [number, number, number]);

/** Minimum CIE76 colour distance between a palette colour and any ground, so parts never vanish into the map. */
const MIN_DE = 12;
/** Glow colours are pale by design and only meant for lit parts; they are excluded. */
const SKIP: PaletteColor[] = ['lampWarm', 'windowWarm'];

describe('palette vs ground colours', () => {
  const names = (Object.keys(PALETTE) as PaletteColor[]).filter((n) => !SKIP.includes(n));
  for (const name of names) {
    it(`${name} stands clear of every ground (CIE76 dE >= ${MIN_DE})`, () => {
      const hex = parseInt(PALETTE[name].slice(1), 16);
      for (const [ground, g] of Object.entries(GROUND_COLORS)) {
        expect(deltaE(hex, g), `${name} vs ${ground}`).toBeGreaterThanOrEqual(MIN_DE);
      }
    });
  }
  it('includes the structural colours', () => {
    for (const n of ['stone', 'stoneDark', 'wood', 'woodDark', 'sand', 'white', 'cream', 'lime', 'bark']) expect(names).toContain(n);
  });
});
