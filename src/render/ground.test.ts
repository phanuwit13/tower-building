import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { GroundId } from '../game/types';
import { PALETTE, type PaletteColor } from '../models/palette';
import { createGround, GROUND_COLORS, PAVEMENT_COLOR } from './ground';
import type { Stage } from './stage';

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

/** The map slab and the surround plane of a ground on a bare scene. */
function groundOn() {
  const stage = { scene: new THREE.Scene() } as unknown as Stage;
  const ground = createGround(stage);
  const meshes = stage.scene.children.filter((c): c is THREE.Mesh<THREE.BufferGeometry, THREE.MeshLambertMaterial> => c instanceof THREE.Mesh);
  const map = meshes.find((m) => m.geometry instanceof THREE.BoxGeometry)!;
  const surround = meshes.find((m) => m.geometry instanceof THREE.PlaneGeometry)!;
  // the surround's shader patch: compile it against three's Lambert shader to read its uniforms and code
  const shader = { uniforms: {} as Record<string, { value: unknown }>, vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader };
  surround.material.onBeforeCompile(shader as never, null as never);
  return { ground, map: map.material.color, surround: surround.material.color, shader };
}

/** sRGB hex with every channel scaled by k (as the ground darkens wet and surround colours). */
const scaled = (hex: number, k: number): number => {
  const ch = (shift: number) => Math.round(((hex >> shift) & 255) * k) << shift;
  return ch(16) | ch(8) | ch(0);
};
const luma = (hex: number): number => 0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255);
const GROUNDS = Object.keys(GROUND_COLORS) as GroundId[];

describe('createGround', () => {
  it('outdoors (no indoor flag) keeps exactly the old colours for every ground, wet and dry', () => {
    const { ground, map, surround, shader } = groundOn();
    for (const g of GROUNDS) for (const wet of [false, true]) {
      ground.setGround(g, wet);
      const floor = wet ? scaled(GROUND_COLORS[g], 0.85) : GROUND_COLORS[g];
      expect(map.getHex(), `${g} wet ${wet}`).toBe(floor);
      expect(surround.getHex(), `${g} wet ${wet}`).toBe(scaled(floor, 0.78));
      expect(shader.uniforms.uPaving.value, `${g} wet ${wet}`).toBe(0);
      ground.setGround(g, wet, false);
      expect(map.getHex()).toBe(floor);
      expect(surround.getHex()).toBe(scaled(floor, 0.78));
    }
    // pinned: the grass map as it has always been
    ground.setGround('grass', false);
    expect(surround.getHex()).toBe(0x619e40);
  });

  it('indoors the surround is the pavement whatever the ground, with slab joints', () => {
    const { ground, surround, shader } = groundOn();
    for (const g of GROUNDS) {
      ground.setGround(g, false, true);
      expect(surround.getHex(), g).toBe(PAVEMENT_COLOR);
      expect(shader.uniforms.uPaving.value, g).toBe(1);
    }
    expect(shader.fragmentShader).toContain('uPaving');
    ground.setGround('grass', false, false); // back outdoors: no joints
    expect(shader.uniforms.uPaving.value).toBe(0);
  });

  it('indoors rain darkens the pavement but never the floor inside', () => {
    const { ground, map, surround } = groundOn();
    for (const g of GROUNDS) {
      ground.setGround(g, true, true);
      expect(map.getHex(), g).toBe(GROUND_COLORS[g]);
      expect(surround.getHex(), g).toBe(scaled(PAVEMENT_COLOR, 0.85));
      expect(luma(surround.getHex())).toBeLessThan(luma(PAVEMENT_COLOR));
    }
  });

  it('the pavement is a light warm grey of its own, clear of every ground and palette colour', () => {
    const [l, a, b] = lab(PAVEMENT_COLOR);
    expect(l).toBeGreaterThan(70); // light
    expect(Math.hypot(a, b)).toBeLessThan(12); // a grey
    expect(b).toBeGreaterThan(0); // warm, not blue
    for (const [g, hex] of Object.entries(GROUND_COLORS)) expect(deltaE(PAVEMENT_COLOR, hex), g).toBeGreaterThanOrEqual(MIN_DE);
    for (const n of (Object.keys(PALETTE) as PaletteColor[]).filter((c) => !SKIP.includes(c))) {
      expect(deltaE(PAVEMENT_COLOR, parseInt(PALETTE[n].slice(1), 16)), n).toBeGreaterThanOrEqual(MIN_DE);
    }
  });
});
