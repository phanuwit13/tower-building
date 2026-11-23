import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

/** A round window (porthole) at `c`, facing the unit direction `n`: a frame ring and a glass disc that glows at night. */
function porthole(kit: StyleKit, c: Vec3, n: Vec3, r: number, frame: PaletteColor, glow: PaletteColor): Part[] {
  const len = Math.hypot(n[0], n[1], n[2]);
  const u: Vec3 = [n[0] / len, n[1] / len, n[2] / len];
  const rotate = aim(u);
  const at = (d: number): Vec3 => [c[0] + u[0] * d, c[1] + u[1] * d, c[2] + u[2] * d];
  return [
    kit.cylinder(r + 0.03, r + 0.03, 0.03, at(0), frame, { segments: 10, rotate }),
    kit.cylinder(r, r, 0.03, at(0.012), 'skyBlue', { segments: 10, rotate, glow, light: 'window' }),
  ];
}

// Two linked white domes (2×3, long side along z). Each dome stands on a drum with a colour band and
// round windows; a short orange tube joins them. Windows glow warm / teal at night.
const R = 0.8;
const ZS = 0.74; // the domes are squashed along z so a link tube shows between them (x still spans 1.66)
const DRUM_H = 0.36;
const DOME_Y = 1.0; // dome height above the drum
const CZ = 0.86; // dome centres at z = ±CZ (footprint edge: CZ + ZS·(R + 0.03) = 1.47)
const SEG = 16;
const WALL = R * Math.cos(Math.PI / SEG); // the drum's flat faces sit slightly inside R

/** A point on the squashed shell at angle `a`, radius `rad`, with the outward normal. */
function onShell(a: number, rad: number, z: number, y: number): { at: Vec3; n: Vec3 } {
  const nz = Math.sin(a) / ZS;
  const len = Math.hypot(Math.cos(a), nz);
  return { at: [Math.cos(a) * rad, y, z + Math.sin(a) * rad * ZS], n: [Math.cos(a) / len, 0, nz / len] };
}

function habitat(kit: StyleKit, z: number, band: PaletteColor, accent: PaletteColor, flip: number): Part[] {
  const sc: Vec3 = [1, 1, ZS];
  const parts: Part[] = [
    kit.cylinder(R + 0.03, R + 0.03, 0.06, [0, 0.03, z], 'stoneDark', { segments: SEG, scale: sc }),
    kit.cylinder(R, R, DRUM_H - 0.06, [0, 0.06 + (DRUM_H - 0.06) / 2, z], 'white', { segments: SEG, scale: sc }),
    kit.cylinder(R + 0.02, R + 0.02, 0.07, [0, DRUM_H - 0.035, z], band, { segments: SEG, scale: sc }),
    kit.dome(R - 0.02, [0, DRUM_H, z], 'white', { segments: SEG, scale: [1, DOME_Y / R, ZS] }),
    // accent ring and a lit skylight on top
    kit.cylinder(0.2, 0.2, 0.05, [0, DRUM_H + DOME_Y - 0.03, z], accent, { segments: 10 }),
    kit.dome(0.09, [0, DRUM_H + DOME_Y - 0.01, z], 'teal', { segments: 8, glow: 'teal', light: 'window' }),
  ];
  // five round windows on the drum, on the visible +x / ±z side
  for (let i = 0; i < 5; i++) {
    const a = (-0.2 + i * 0.4) * Math.PI + (flip ? 0.1 : 0);
    const { at, n } = onShell(a, WALL, z, DRUM_H - 0.17);
    parts.push(...porthole(kit, at, n, 0.07, 'teal', i % 2 ? 'teal' : 'windowWarm'));
  }
  // round windows higher up on the dome shell, tilted outwards
  for (let i = 0; i < 3; i++) {
    const a = (-0.25 + i * 0.25) * Math.PI;
    const tilt = 0.55;
    const { at, n } = onShell(a, (R - 0.02) * Math.cos(tilt) * 0.97, z, DRUM_H + DOME_Y * Math.sin(tilt) * 0.97);
    const m: Vec3 = [n[0] * Math.cos(tilt), Math.sin(tilt), n[2] * Math.cos(tilt)];
    parts.push(...porthole(kit, at, m, 0.06, accent, i === 1 ? 'teal' : 'windowWarm'));
  }
  return parts;
}

/** โดมที่พัก: two linked white domes with round windows, lit at night. */
export const item: ItemModel = {
  id: 'habitat-dome',
  name: 'โดมที่พัก',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      ...habitat(kit, CZ, 'orange', 'orange', 0),
      ...habitat(kit, -CZ, 'teal', 'teal', 1),
      // the orange link tube between the domes (along z), reaching into both drums, with two rings
      kit.cylinder(0.17, 0.17, 0.8, [0, 0.2, 0], 'orange', { segments: 10, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.2, 0.2, 0.06, [0, 0.2, 0.3], 'white', { segments: 10, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.2, 0.2, 0.06, [0, 0.2, -0.3], 'white', { segments: 10, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.5, 0.04, 0.5], [0, 0.02, 0], 'stoneDark'),
    ];
    return kit.finish(parts);
  },
};
