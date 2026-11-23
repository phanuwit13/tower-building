import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// The whole chair is one rigid body rocking back and forth (about z, so the front, +x, tips down and up) around
// the middle of its rockers, on the floor. Each rocker is two curved arcs (torus segments of radius ARC_R) that
// meet at that point. Both arcs leave it already rising at START_SLOPE rad, steeper than the rock itself, so
// neither side can sink through the floor however far the chair rocks.
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, 0, 0], axis: [0, 0, 1], amount: 0.08 };
const START_SLOPE = 0.14;
const ARC_R = 0.9; // radius of the rocker curve
const ARC_LEN = 0.47; // length of each arc along the curve
const TUBE = 0.025;
const LIFT = 0.0254; // tube radius plus 0.0006, so the arcs hover just above the floor and a tiny point touches it
const SEAT_Y = 0.31;

/** เก้าอี้โยก: a wooden rocking chair with a striped blanket; it rocks gently on its rockers. */
export const item: ItemModel = {
  id: 'rocking-chair',
  name: 'เก้าอี้โยก',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const m = { motion: ROCK };
    const parts: Part[] = [];
    // right arc: ring centre above the pivot, the arc starting at the bottom of the ring tilted by START_SLOPE
    const phi = START_SLOPE - Math.PI / 2;
    const cx = -ARC_R * Math.sin(START_SLOPE);
    const cy = ARC_R * Math.cos(START_SLOPE) + LIFT;
    for (const z of [-0.3, 0.3]) {
      const arc = { radialSegments: 6, tubularSegments: 6, arc: ARC_LEN / ARC_R };
      parts.push(
        kit.torus(ARC_R, TUBE, [cx, cy, z], 'woodDark', { ...arc, rotate: [0, 0, phi], ...m }),
        kit.torus(ARC_R, TUBE, [-cx, cy, z], 'woodDark', { ...arc, rotate: [0, 0, -phi], scale: [-1, 1, 1], ...m }),
        // a tiny point at the pivot is the one part that touches the floor, so the rock can never dip below y = 0
        kit.cone(0.02, 0.012, [0, 0.006, z], 'woodDark', { segments: 6, scale: [1, -1, 1], ...m }),
      );
      for (const x of [-0.2, 0.2]) parts.push(kit.box([0.05, 0.25, 0.05], [x, 0.195, z], 'wood', m));
      parts.push(kit.box([0.34, 0.03, 0.05], [0.04, 0.46, z], 'wood', m)); // armrest
      parts.push(kit.box([0.04, 0.12, 0.04], [0.19, 0.4, z], 'wood', m)); // arm post
      parts.push(kit.box([0.04, 0.42, 0.04], [-0.26, 0.46, z * 0.9], 'wood', { rotate: [0, 0, 0.15], ...m })); // back post
    }
    parts.push(
      kit.box([0.48, 0.05, 0.6], [0, SEAT_Y - 0.025, 0], 'wood', m),
      // slatted back, leaning with the posts
      kit.box([0.03, 0.08, 0.5], [-0.255, 0.42, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.03, 0.08, 0.5], [-0.28, 0.53, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.03, 0.08, 0.5], [-0.305, 0.64, 0], 'wood', { rotate: [0, 0, 0.15], ...m }),
      // striped blanket over the seat and down the back
      kit.box([0.34, 0.03, 0.46], [0.07, SEAT_Y + 0.015, 0], 'red', m),
      kit.box([0.06, 0.032, 0.46], [0.1, SEAT_Y + 0.016, 0], 'cream', m),
      kit.box([0.06, 0.032, 0.46], [-0.02, SEAT_Y + 0.016, 0], 'cream', m),
      kit.box([0.03, 0.28, 0.46], [-0.225, 0.47, 0], 'red', { rotate: [0, 0, 0.15], ...m }),
      kit.box([0.032, 0.05, 0.46], [-0.235, 0.52, 0], 'cream', { rotate: [0, 0, 0.15], ...m }),
    );
    return kit.finish(parts);
  },
};
