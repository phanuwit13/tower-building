import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A square sandpit with tall timber sides, a plank ledge and a seat board in each corner (much
// chunkier than the swing set's low rim), heaped with sand and full of toys: a sand castle at the
// back, a ride-on digger, a bucket of sand and a spade stuck in a sand heap.
const PIT = 1.92; // outer size
const BOARD = { w: 0.13, h: 0.18 }; // the timber sides
const CAP = { w: 0.17, h: 0.035 }; // plank ledge along the top of the sides
const SEAT = 0.32; // square seat board on each corner
const SAND_Y = 0.1; // sand level
const CASTLE = { x: -0.3, z: -0.28, keep: 0.3, keepH: 0.14, tower: 0.07, towerH: 0.22 };
const DIGGER = { x: -0.14, z: 0.42 };
const BUCKET = { x: 0.44, z: 0.36, rTop: 0.085, rBottom: 0.065, h: 0.15 };
const HEAP = { x: 0.4, z: -0.4, r: 0.26, squash: 0.36 }; // squashed ball half sunk in the sand (its base stays above y = 0)
const SPADE = { lean: 0.32, handle: 0.28 };

/** A round rod from a to b. */
function rod(kit: StyleKit, a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 6): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(r, r, len, mid, color, { segments, rotate: [Math.atan2(d[2], d[1]), 0, -Math.asin(d[0] / len)] });
}

/** บ่อทราย: a chunky wooden sandpit with corner seats, a sand castle, a ride-on digger, a bucket and a spade. */
export const item: ItemModel = {
  id: 'sandpit',
  name: 'บ่อทราย',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const edge = (PIT - BOARD.w) / 2; // centre line of each side
    const inner = PIT - 2 * BOARD.w + 0.02; // sand reaches just into the boards
    const capY = BOARD.h + CAP.h / 2;
    const parts: Part[] = [kit.box([inner, SAND_Y, inner], [0, SAND_Y / 2, 0], 'sand')];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([BOARD.w, BOARD.h, PIT], [s * edge, BOARD.h / 2, 0], 'woodDark'),
        kit.box([PIT - 2 * BOARD.w, BOARD.h, BOARD.w], [0, BOARD.h / 2, s * edge], 'woodDark'),
        kit.box([CAP.w, CAP.h, PIT + 0.02], [s * edge, capY, 0], 'wood'),
        kit.box([PIT + 0.02, CAP.h, CAP.w], [0, capY, s * edge], 'wood'),
      );
      for (const sz of [-1, 1]) {
        const c = PIT / 2 - SEAT / 2 + 0.01;
        parts.push(kit.box([SEAT, CAP.h, SEAT], [s * c, capY + CAP.h, sz * c], 'wood'));
      }
    }

    // sand castle: a keep with four round towers, battlements and a tall middle tower with a flag
    const { x: cx, z: cz } = CASTLE;
    const k = CASTLE.keep / 2;
    parts.push(kit.box([CASTLE.keep, CASTLE.keepH, CASTLE.keep], [cx, SAND_Y + CASTLE.keepH / 2, cz], 'sand'));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.cylinder(CASTLE.tower - 0.012, CASTLE.tower, CASTLE.towerH,
          [cx + sx * k, SAND_Y + CASTLE.towerH / 2, cz + sz * k], 'sand', { segments: 8 }));
      }
      parts.push(
        kit.box([0.05, 0.05, 0.05], [cx + sx * k, SAND_Y + CASTLE.keepH + 0.02, cz], 'sand'),
        kit.box([0.05, 0.05, 0.05], [cx, SAND_Y + CASTLE.keepH + 0.02, cz + sx * k], 'sand'),
      );
    }
    const midTop = SAND_Y + CASTLE.keepH + 0.16;
    parts.push(
      kit.cylinder(0.075, 0.09, 0.16, [cx, SAND_Y + CASTLE.keepH + 0.08, cz], 'sand', { segments: 8 }),
      kit.cylinder(0.015, 0.015, 0.16, [cx, midTop + 0.08, cz], 'woodDark', { segments: 4 }),
      kit.box([0.11, 0.065, 0.02], [cx + 0.065, midTop + 0.125, cz], 'red'),
    );

    // ride-on digger toy, facing +x: yellow body on four wheels, red seat, arm and scoop in front
    const { x: dx, z: dz } = DIGGER;
    const wheelY = SAND_Y + 0.045; // wheels sink a little into the sand
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.cylinder(0.055, 0.055, 0.045, [dx + sx * 0.1, wheelY, dz + sz * 0.115], 'charcoal', { rotate: [Math.PI / 2, 0, 0], segments: 8 }));
      }
    }
    const bodyTop = wheelY + 0.065;
    parts.push(
      kit.box([0.34, 0.09, 0.19], [dx, bodyTop - 0.045, dz], 'sunYellow'),
      kit.box([0.12, 0.04, 0.15], [dx - 0.07, bodyTop + 0.02, dz], 'red'), // seat
      kit.box([0.035, 0.11, 0.15], [dx - 0.14, bodyTop + 0.075, dz], 'red'), // backrest
      kit.cylinder(0.018, 0.018, 0.09, [dx + 0.06, bodyTop + 0.045, dz], 'charcoal', { segments: 4 }), // steering post
      kit.box([0.03, 0.03, 0.13], [dx + 0.06, bodyTop + 0.09, dz], 'charcoal'), // handlebar
      rod(kit, [dx + 0.15, bodyTop - 0.01, dz], [dx + 0.3, bodyTop + 0.13, dz], 0.028, 'sunYellow', 4), // boom
      rod(kit, [dx + 0.3, bodyTop + 0.13, dz], [dx + 0.36, SAND_Y + 0.08, dz], 0.024, 'sunYellow', 4), // stick
      kit.sphere(0.035, [dx + 0.3, bodyTop + 0.13, dz], 'charcoal', { detail: 0 }), // elbow
      kit.wedge([0.1, 0.08, 0.13], [dx + 0.39, SAND_Y + 0.04, dz], 'stoneDark', { apex: -0.5 }), // scoop
    );

    // bucket full of sand, with a yellow handle
    const { x: bx, z: bz } = BUCKET;
    const rim = SAND_Y + BUCKET.h;
    parts.push(
      kit.cylinder(BUCKET.rTop, BUCKET.rBottom, BUCKET.h, [bx, SAND_Y + BUCKET.h / 2, bz], 'blue', { segments: 10 }),
      kit.sphere(BUCKET.rTop - 0.01, [bx, rim, bz], 'sand', { scale: [1, 0.45, 1], detail: 0 }),
      kit.torus(BUCKET.rTop, 0.015, [bx, rim, bz], 'sunYellow', { arc: Math.PI, tubularSegments: 6, radialSegments: 4, rotate: [0, 0.6, 0] }),
    );

    // a sand heap with a spade stuck in it: the blade faces the default camera (+x+z) and the
    // spade leans sideways in the blade's own plane, towards +x-z, so the camera sees it side on
    const turn = Math.PI / 4;
    const tilt: Vec3 = [0, turn, -SPADE.lean]; // lean about the blade's own z, then turn
    const up: Vec3 = [Math.sin(SPADE.lean) * Math.cos(turn), Math.cos(SPADE.lean), -Math.sin(SPADE.lean) * Math.sin(turn)];
    const blade: Vec3 = [HEAP.x, SAND_Y + 0.13, HEAP.z]; // lower half buried in the heap
    const along = (t: number): Vec3 => [blade[0] + up[0] * t, blade[1] + up[1] * t, blade[2] + up[2] * t];
    parts.push(
      kit.sphere(HEAP.r, [HEAP.x, SAND_Y, HEAP.z], 'sand', { scale: [1, HEAP.squash, 1] }),
      kit.box([0.14, 0.16, 0.025], blade, 'red', { rotate: tilt }),
      rod(kit, along(0.07), along(0.07 + SPADE.handle), 0.024, 'sunYellow', 6),
      kit.box([0.11, 0.035, 0.035], along(0.07 + SPADE.handle), 'sunYellow', { rotate: tilt }), // T grip
    );
    return kit.finish(parts);
  },
};
