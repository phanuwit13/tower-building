import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

// A big desk-style globe: round wooden base, turned stem, a wooden ring standing in the y-z plane
// (so it faces the front, +x) and the globe inside it, its axis tilted in the ring's plane.
const BASE = { rBottom: 0.3, rTop: 0.26, h: 0.07 };
const PLATE = { r: 0.17, h: 0.04 }; // the smaller disc on the base
const GLOBE = { r: 0.3, y: 0.8 };
const RING = { r: 0.37, tube: 0.028 };
const TILT = 0.41; // axis tilt (radians, ~23°), towards +z
const STEM = { r: 0.04, knobR: 0.065, knobY: 0.3 };
const PIN = { r: 0.018, cap: 0.034 }; // axle from each pole to the ring, with a brass cap on the ring
const POLE_CAP = { r: 0.09, squash: 0.35 }; // white ice caps
/**
 * Land as [latitude, longitude, size, colour]: longitude 0 faces the front (+x) and π/2 faces +z, so
 * about π/4 faces the default camera. Each patch is an ellipsoid as curved as the globe at its
 * top (height = width² / globe radius): it hugs the sea and sinks under it at its edges.
 */
const LAND: Array<[number, number, number, PaletteColor]> = [
  [0.5, 0.55, 0.15, 'leaf'], // big continent facing the camera, upper half
  [-0.22, 1.25, 0.11, 'lime'], // lower left
  [0.12, -0.55, 0.12, 'leaf'], // right edge
  [0.3, 2.2, 0.14, 'leaf'], // back left
  [-0.3, 3.4, 0.12, 'lime'], // back
  [0.1, 4.55, 0.12, 'leaf'], // back right
];
const LAND_LONG = 1.25; // patches are this much longer along their own z
const LAND_LIFT = 0.016; // how far a patch's top stands proud of the sea

/** Unit vector at (lat, lon) in the globe's own frame (y = its axis; lon 0 = +x, π/2 = +z), then tilted with it about x. */
function onGlobe(lat: number, lon: number): Vec3 {
  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lon);
  // turn about x by TILT: the axis (0, 1, 0) goes to (0, cos TILT, sin TILT)
  return [x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT)];
}

/** ลูกโลก: a big blue and green globe, tilted in a wooden ring on a round base. */
export const item: ItemModel = {
  id: 'globe-stand',
  name: 'ลูกโลก',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const at = (n: Vec3, dist: number): Vec3 => [n[0] * dist, GLOBE.y + n[1] * dist, n[2] * dist];
    const ringBottom = GLOBE.y - RING.r;
    const stemBottom = BASE.h + PLATE.h;
    const parts: Part[] = [
      kit.cylinder(BASE.rTop, BASE.rBottom, BASE.h, [0, BASE.h / 2, 0], 'woodDark', { segments: 12 }),
      kit.cylinder(PLATE.r, PLATE.r, PLATE.h, [0, BASE.h + PLATE.h / 2, 0], 'wood', { segments: 12 }),
      kit.cylinder(STEM.r, STEM.r * 1.3, ringBottom - stemBottom, [0, (ringBottom + stemBottom) / 2, 0], 'wood', { segments: 8 }),
      kit.sphere(STEM.knobR, [0, STEM.knobY, 0], 'woodDark', { detail: 0, scale: [1, 0.8, 1] }),
      kit.torus(RING.r, RING.tube, [0, GLOBE.y, 0], 'wood', { rotate: [0, Math.PI / 2, 0], radialSegments: 5, tubularSegments: 12 }),
      kit.sphere(GLOBE.r, [0, GLOBE.y, 0], 'blue', { detail: 1 }),
    ];
    for (const [lat, lon, size, color] of LAND) {
      const n = onGlobe(lat, lon);
      const h = (size * LAND_LONG) ** 2 / GLOBE.r; // half-height that matches the globe's curve along the long side
      parts.push(kit.dome(size, at(n, GLOBE.r + LAND_LIFT - h), color, { segments: 8, scale: [1, h / size, LAND_LONG], rotate: aim(n, 'y') }));
    }
    for (const s of [-1, 1]) {
      const n = onGlobe((s * Math.PI) / 2, 0); // north (+1) and south (-1) poles
      const pinLen = RING.r - GLOBE.r;
      parts.push(
        kit.sphere(POLE_CAP.r, at(n, GLOBE.r - POLE_CAP.r * POLE_CAP.squash * 0.4), 'white', { detail: 0, scale: [1, POLE_CAP.squash, 1], rotate: aim(n, 'y') }),
        kit.cylinder(PIN.r, PIN.r, pinLen, at(n, GLOBE.r + pinLen / 2), 'sunYellow', { segments: 4, rotate: aim(n, 'y') }),
        kit.sphere(PIN.cap, at(n, RING.r), 'sunYellow', { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
