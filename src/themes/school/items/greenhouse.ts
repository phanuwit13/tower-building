import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wallPanel } from '../../../models/parts';

// A white-framed glasshouse, long side along z, door in the middle of the front (+x). The glass is
// pale `glassBlue` panes in the walls and the gable ends; the pitched roof is drawn as its white
// glazing bars only, so the camera (which looks down steeply) sees the rows of plants inside.
const W = 1.5; // frame width (x)
const L = 2.66; // frame length (z)
const BASE = { h: 0.06, lip: 0.05 }; // stone floor slab
const WALL_TOP = 0.74;
const BAYS = 7; // along z; the middle bay of the front wall is the door
const END_BAYS = 3; // across each end wall
const BAR = 0.045; // square white bars: posts, rails, rafters
const RAIL_Y = [BASE.h + 0.04, WALL_TOP - BAR / 2]; // sill and eave rails
const PANE = 0.02; // thickness of a glass pane, centred on the wall line
const PITCH = 0.62;
const RISE = (W / 2) * Math.tan(PITCH);
const EAVE = 0.05; // rafters reach this far past the walls (flat)
const PURLIN_AT = [0.5]; // bars along z on each slope, as a share of the way from eave to ridge
const DOOR = { w: 0.33, h: 0.56 }; // fills the middle bay between its posts

// plants: a row of lettuces and cabbages in the back bed, tomato plants in the front bed
const BED = { w: 0.42, h: 0.14, len: 2.3, soil: 0.02 };
const BED_X = [-0.38, 0.3];
const PLANT_Z = [-0.95, -0.57, -0.19, 0.19, 0.57, 0.95];
const GREENS: PaletteColor[] = ['lime', 'leaf'];
const TOMATO = { r: 0.12, stretch: 1.45, fruit: 0.04 };
const TOMATO_FRUIT: Vec3[] = [[0.1, 0.02, 0.05], [0.06, -0.08, -0.08]]; // offsets from a bush's centre; every other plant has only the first
const BULB = { r: 0.07, y: 0.9 }; // one warm bulb hanging from the ridge over the middle (glows at night)
const SUNFLOWER = { z: [-1.14, 1.14], stem: 0.6, head: 0.11, tip: 0.8 }; // one at each end of the front bed; `tip`: the head tilts up this much from facing +x

/** โรงเรือนปลูกผัก: the school greenhouse, a white glasshouse with beds of vegetables inside. */
export const item: ItemModel = {
  id: 'greenhouse',
  name: 'โรงเรือนปลูกผัก',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([W + 2 * BASE.lip, BASE.h, L + 2 * BASE.lip], [0, BASE.h / 2, 0], 'stone')];
    const postH = WALL_TOP - BASE.h;
    const post = (x: number, z: number) => kit.box([BAR, postH, BAR], [x, BASE.h + postH / 2, z], 'white');
    const bayZ = (k: number) => -L / 2 + (k * L) / BAYS;
    const endX = (k: number) => -W / 2 + (k * W) / END_BAYS;
    const doorZ = (bayZ(3) + bayZ(4)) / 2; // the middle bay
    const doorHalf = (L / BAYS) / 2;
    const paneH = postH - 0.04;
    const paneY = BASE.h + 0.02 + paneH / 2;

    // posts, glass panes and rails on the long walls
    for (const s of [1, -1]) {
      const x = s * W / 2;
      for (let k = 0; k <= BAYS; k++) parts.push(post(x, bayZ(k)));
      for (let k = 0; k < BAYS; k++) {
        if (s > 0 && k === 3) continue; // the door
        parts.push(kit.box([PANE, paneH, L / BAYS - BAR], [x, paneY, (bayZ(k) + bayZ(k + 1)) / 2], 'glassBlue'));
      }
      RAIL_Y.forEach((y, i) => {
        const top = i === RAIL_Y.length - 1;
        if (s < 0 || top) parts.push(kit.box([BAR, BAR, L], [x, y, 0], 'white'));
        else { // the front wall's sill rail stops at the door
          const len = L / 2 - doorHalf;
          for (const d of [1, -1]) parts.push(kit.box([BAR, BAR, len], [x, y, d * (doorHalf + len / 2)], 'white'));
        }
      });
    }
    // end walls: inner posts, panes, rails, and the glass gable triangle
    for (const s of [1, -1]) {
      const z = s * L / 2;
      for (let k = 1; k < END_BAYS; k++) parts.push(post(endX(k), z));
      for (let k = 0; k < END_BAYS; k++) parts.push(kit.box([W / END_BAYS - BAR, paneH, PANE], [(endX(k) + endX(k + 1)) / 2, paneY, z], 'glassBlue'));
      for (const y of RAIL_Y) parts.push(kit.box([W, BAR, BAR], [0, y, z], 'white'));
      parts.push(kit.wedge([W, RISE, PANE], [0, WALL_TOP + RISE / 2, z], 'glassBlue'));
    }

    // the door: a white frame round a glass panel, with a yellow handle
    parts.push(
      ...wallPanel(kit, { at: [W / 2, BASE.h + DOOR.h / 2, doorZ], facing: 'x+', w: DOOR.w, h: DOOR.h, depth: 0.02, color: 'white' }),
      ...wallPanel(kit, { at: [W / 2, BASE.h + DOOR.h / 2 + 0.02, doorZ], facing: 'x+', w: DOOR.w - 0.08, h: DOOR.h - 0.12, depth: 0.03, color: 'glassBlue' }),
      kit.sphere(0.025, [W / 2 + 0.04, BASE.h + DOOR.h * 0.45, doorZ + DOOR.w / 2 - 0.05], 'sunYellow', { detail: 0 }),
      kit.box([BAR, BAR, 2 * doorHalf], [W / 2, BASE.h + DOOR.h + BAR / 2, doorZ], 'white'), // header over the door
    );

    // the roof's glazing bars: ridge, a rafter over every post, and purlins along each slope
    const reach = W / 2 + EAVE;
    const rafterLen = reach / Math.cos(PITCH);
    const ridgeY = WALL_TOP + RISE;
    /** A point on the slope on side s, `u` of the way from the ridge to the eave, lifted half a bar off the slope line. */
    const onSlope = (s: number, u: number): Vec3 => [
      s * (u * reach + (BAR / 2) * Math.sin(PITCH)),
      ridgeY - u * reach * Math.tan(PITCH) + (BAR / 2) * Math.cos(PITCH),
      0,
    ];
    parts.push(kit.box([BAR * 1.4, BAR * 1.4, L + 2 * EAVE], [0, ridgeY + BAR * 0.4, 0], 'white'));
    for (const s of [1, -1]) {
      const mid = onSlope(s, 0.5);
      for (let k = 0; k <= BAYS; k++) parts.push(kit.box([rafterLen, BAR, BAR], [mid[0], mid[1], bayZ(k)], 'white', { rotate: [0, 0, -s * PITCH] }));
      for (const u of PURLIN_AT) {
        const p = onSlope(s, 1 - u);
        parts.push(kit.box([BAR, BAR, L], [p[0], p[1] + BAR, 0], 'white', { rotate: [0, 0, -s * PITCH] })); // on top of the rafters
      }
    }

    // raised beds of plants
    BED_X.forEach((bx, b) => {
      parts.push(
        kit.box([BED.w, BED.h, BED.len], [bx, BASE.h + BED.h / 2, 0], 'wood'),
        kit.box([BED.w - 0.06, BED.soil, BED.len - 0.06], [bx, BASE.h + BED.h + BED.soil / 2, 0], 'bark'),
      );
      const soilTop = BASE.h + BED.h;
      PLANT_Z.forEach((z, i) => {
        if (b === 0) { // lettuces and cabbages: round, squashed
          const r = 0.15;
          parts.push(kit.sphere(r, [bx, soilTop + r * 0.7 * 0.85, z], GREENS[i % 2], { detail: 0, scale: [1, 0.7, 1] }));
        } else { // tomato plants: a tall bush with two red tomatoes
          const cy = soilTop + TOMATO.r * TOMATO.stretch * 0.85;
          parts.push(kit.sphere(TOMATO.r, [bx, cy, z], 'leafDark', { detail: 0, scale: [1, TOMATO.stretch, 1] }));
          for (const [dx, dy, dz] of TOMATO_FRUIT.slice(0, i % 2 === 0 ? 2 : 1)) {
            parts.push(kit.sphere(TOMATO.fruit, [bx + dx, cy + dy, z + dz], 'red', { detail: 0 }));
          }
        }
      });
    });
    // two sunflowers at the ends of the front bed, facing +x
    const fx = BED_X[1];
    for (const z of SUNFLOWER.z) {
      const top = BASE.h + BED.h + SUNFLOWER.stem;
      parts.push(
        kit.cylinder(0.02, 0.025, SUNFLOWER.stem, [fx, BASE.h + BED.h + SUNFLOWER.stem / 2, z], 'leaf', { segments: 5 }),
        // flat discs whose axis points +x and a little up, so the faces look at the camera
        kit.cylinder(SUNFLOWER.head, SUNFLOWER.head, 0.03, [fx + 0.03, top, z], 'sunYellow', { rotate: [0, 0, SUNFLOWER.tip - Math.PI / 2], segments: 10 }),
        kit.cylinder(SUNFLOWER.head * 0.5, SUNFLOWER.head * 0.5, 0.04, [fx + 0.03, top, z], 'bark', { rotate: [0, 0, SUNFLOWER.tip - Math.PI / 2], segments: 8 }),
      );
    }
    // the bulb on its cord from the ridge bar, hanging over the aisle between the beds
    parts.push(
      kit.cylinder(0.015, 0.015, ridgeY - BULB.y, [0, (ridgeY + BULB.y) / 2, 0], 'charcoal', { segments: 4 }),
      kit.sphere(BULB.r, [0, BULB.y - BULB.r * 0.8, 0], 'lampWarm', { detail: 0, glow: true }),
    );
    return kit.finish(parts);
  },
};
