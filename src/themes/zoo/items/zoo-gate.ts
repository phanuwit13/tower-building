import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW } from '../../../models/parts';

// A 2x3 entrance arch: two rock-and-wood towers (z = +/-TOWER_Z) joined by a wooden beam, an open path between them
// (the visitors walk along x). A giraffe head crowns the +z tower, a lion head the -z tower; both look towards +x.
const TOWER_Z = 1.12;
const TOWER = { rock: { x: 1.5, z: 0.66, h: 0.3 }, post: { x: 0.9, z: 0.5, h: 0.75 } };
const POST_TOP = TOWER.rock.h + TOWER.post.h; // 1.05
const BEAM = { x: 0.5, h: 0.26, y: 0.86 }; // y = centre; the opening under it is 0.73 high
const PATH = { x: 1.7, h: 0.025 };
const FLAG = { poleX: -0.1, w: 0.4, h: 0.24, top: 1.52, strips: 4, wave: 0.18 };
/** Flags on the beam: [z, [top, middle, bottom] stripe colours]. */
const FLAGS: Array<[number, PaletteColor[]]> = [[0.5, ['red', 'white', 'red']], [-0.5, ['blue', 'sunYellow', 'blue']]];
const HEAD_Y = POST_TOP + 0.04; // the animal heads start on the tower cap

/** ประตูทางเข้าสวนสัตว์: rock-and-wood towers with a giraffe and a lion on top, flags waving on the beam. */
export const item: ItemModel = {
  id: 'zoo-gate',
  name: 'ประตูทางเข้าสวนสัตว์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([PATH.x, PATH.h, 2 * TOWER_Z - TOWER.rock.z + 0.04], [0, PATH.h / 2, 0], 'sand')];
    for (const s of [-1, 1]) {
      const z = s * TOWER_Z;
      parts.push(
        kit.box([TOWER.rock.x, TOWER.rock.h, TOWER.rock.z], [0, TOWER.rock.h / 2, z], 'stone'),
        // boulders on the rock base, in front and behind
        kit.sphere(0.15, [0.66, 0.15 * 0.7 * ICO_LOW, z + 0.18], 'stoneDark', { detail: 0, scale: [1.1, 0.7, 1] }),
        kit.sphere(0.12, [0.68, 0.12 * 0.7 * ICO_LOW, z - 0.2], 'stone', { detail: 0, scale: [1.1, 0.7, 1] }),
        kit.sphere(0.13, [-0.66, 0.13 * 0.7 * ICO_LOW, z + 0.12 * s], 'stoneDark', { detail: 0, scale: [1.1, 0.7, 1] }),
        // wooden post with two dark bands and a cap
        kit.box([TOWER.post.x, TOWER.post.h, TOWER.post.z], [0, TOWER.rock.h + TOWER.post.h / 2, z], 'wood'),
        kit.box([TOWER.post.x + 0.04, 0.06, TOWER.post.z + 0.04], [0, TOWER.rock.h + 0.2, z], 'woodDark'),
        kit.box([TOWER.post.x + 0.04, 0.06, TOWER.post.z + 0.04], [0, TOWER.rock.h + 0.55, z], 'woodDark'),
        kit.box([TOWER.post.x + 0.1, 0.05, TOWER.post.z + 0.1], [0, POST_TOP + 0.025, z], 'woodDark'),
      );
    }
    // beam across the gate with a green sign board facing +x and three bright dots on it
    parts.push(
      kit.box([BEAM.x, BEAM.h, 2 * TOWER_Z], [0, BEAM.y, 0], 'woodDark'),
      kit.box([0.04, 0.2, 1.2], [BEAM.x / 2 + 0.02, BEAM.y, 0], 'leaf'),
      kit.sphere(0.06, [BEAM.x / 2 + 0.06, BEAM.y, -0.35], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [BEAM.x / 2 + 0.06, BEAM.y, 0], 'pink', { detail: 0 }),
      kit.sphere(0.06, [BEAM.x / 2 + 0.06, BEAM.y, 0.35], 'orange', { detail: 0 }),
    );

    // --- giraffe head on the +z tower ---
    const gz = TOWER_Z;
    parts.push(
      kit.cylinder(0.09, 0.11, 0.48, [0, HEAD_Y + 0.24, gz], 'sunYellow', { segments: 8 }),
      kit.sphere(0.14, [0.04, HEAD_Y + 0.56, gz], 'sunYellow', { scale: [1.1, 0.95, 0.95] }),
      kit.sphere(0.085, [0.2, HEAD_Y + 0.51, gz], 'sand', { detail: 0, scale: [1.3, 0.85, 1] }),
      kit.sphere(0.022, [0.29, HEAD_Y + 0.53, gz + 0.03], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [0.29, HEAD_Y + 0.53, gz - 0.03], 'charcoal', { detail: 0 }),
      kit.sphere(0.04, [0.13, HEAD_Y + 0.62, gz + 0.1], 'white', { detail: 0 }),
      kit.sphere(0.04, [0.13, HEAD_Y + 0.62, gz - 0.1], 'white', { detail: 0 }),
      kit.sphere(0.022, [0.165, HEAD_Y + 0.62, gz + 0.1], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [0.165, HEAD_Y + 0.62, gz - 0.1], 'charcoal', { detail: 0 }),
      kit.sphere(0.06, [0.0, HEAD_Y + 0.62, gz + 0.16], 'sunYellow', { detail: 0, scale: [0.7, 0.9, 1.3] }),
      kit.sphere(0.06, [0.0, HEAD_Y + 0.62, gz - 0.16], 'sunYellow', { detail: 0, scale: [0.7, 0.9, 1.3] }),
      // horns (ossicones)
      kit.cylinder(0.018, 0.022, 0.1, [0.03, HEAD_Y + 0.74, gz + 0.05], 'woodDark', { segments: 6 }),
      kit.cylinder(0.018, 0.022, 0.1, [0.03, HEAD_Y + 0.74, gz - 0.05], 'woodDark', { segments: 6 }),
      kit.sphere(0.03, [0.03, HEAD_Y + 0.8, gz + 0.05], 'orange', { detail: 0 }),
      kit.sphere(0.03, [0.03, HEAD_Y + 0.8, gz - 0.05], 'orange', { detail: 0 }),
      // neck spots
      kit.sphere(0.035, [0.07, HEAD_Y + 0.22, gz + 0.04], 'orange', { detail: 0 }),
      kit.sphere(0.035, [0.08, HEAD_Y + 0.38, gz - 0.03], 'orange', { detail: 0 }),
      kit.sphere(0.03, [-0.02, HEAD_Y + 0.12, gz - 0.09], 'orange', { detail: 0 }),
    );

    // --- lion head on the -z tower: a big orange mane with a friendly yellow face ---
    const lz = -TOWER_Z;
    const ly = HEAD_Y + 0.26;
    parts.push(
      kit.sphere(0.27, [0, ly, lz], 'orange', { scale: [0.8, 1, 1] }),
      kit.sphere(0.17, [0.12, ly - 0.01, lz], 'sunYellow', { scale: [0.9, 1, 1] }),
      kit.sphere(0.09, [0.25, ly - 0.06, lz], 'sand', { detail: 0, scale: [1, 0.8, 1.2] }),
      kit.sphere(0.035, [0.33, ly - 0.03, lz], 'charcoal', { detail: 0 }),
      kit.sphere(0.04, [0.26, ly + 0.06, lz + 0.075], 'white', { detail: 0 }),
      kit.sphere(0.04, [0.26, ly + 0.06, lz - 0.075], 'white', { detail: 0 }),
      kit.sphere(0.022, [0.295, ly + 0.06, lz + 0.075], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [0.295, ly + 0.06, lz - 0.075], 'charcoal', { detail: 0 }),
      kit.sphere(0.07, [0.08, ly + 0.2, lz + 0.14], 'sunYellow', { detail: 0 }),
      kit.sphere(0.07, [0.08, ly + 0.2, lz - 0.14], 'sunYellow', { detail: 0 }),
      kit.sphere(0.035, [0.12, ly + 0.2, lz + 0.14], 'pink', { detail: 0 }),
      kit.sphere(0.035, [0.12, ly + 0.2, lz - 0.14], 'pink', { detail: 0 }),
    );

    // --- two flags on poles standing on the beam; 3 stripes x 4 strips each, all waving about the pole ---
    const strip = FLAG.w / FLAG.strips;
    const stripeH = FLAG.h / 3;
    const poleBase = BEAM.y + BEAM.h / 2;
    for (const [z, colors] of FLAGS) {
      parts.push(
        kit.cylinder(0.02, 0.025, FLAG.top + 0.08 - poleBase, [FLAG.poleX, (poleBase + FLAG.top + 0.08) / 2, z], 'white', { segments: 6 }),
        kit.sphere(0.04, [FLAG.poleX, FLAG.top + 0.1, z], 'sunYellow', { detail: 0 }),
      );
      const wave: MotionOpts = { kind: 'wave', pivot: [FLAG.poleX, FLAG.top, z], axis: [1, 0, 0], amount: FLAG.wave };
      colors.forEach((color, row) => {
        for (let k = 0; k < FLAG.strips; k++) {
          parts.push(kit.box([strip, stripeH, 0.02], [FLAG.poleX + 0.03 + strip * (k + 0.5), FLAG.top - stripeH * (row + 0.5), z], color, { motion: wave }));
        }
      });
    }
    return kit.finish(parts);
  },
};
