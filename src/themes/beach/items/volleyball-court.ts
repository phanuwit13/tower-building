import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A sand court, long side along z, edged by a rope rectangle; the net crosses the middle (along x) on two posts.
const SAND = { w: 1.96, d: 2.96, h: 0.03 };
const LINE = { w: 0.05, h: 0.012, x: 0.85, z: 1.35 }; // rope lines; x / z = half size of the rectangle
const POST = { x: 0.9, w: 0.07, h: 0.85 };
const NET = { y0: 0.45, y1: 0.78, cols: 13, rows: 3, strand: 0.016 };
const BALL = { r: 0.1, x: 0.45, z: 0.8 };

/** สนามวอลเลย์บอลชายหาด: sand court with rope lines, a net on two posts and a ball. */
export const item: ItemModel = {
  id: 'volleyball-court',
  name: 'สนามวอลเลย์บอลชายหาด',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const top = SAND.h;
    const parts: Part[] = [kit.box([SAND.w, SAND.h, SAND.d], [0, SAND.h / 2, 0], 'sand')];
    for (const s of [1, -1]) {
      parts.push(
        kit.box([LINE.w, LINE.h, LINE.z * 2 + LINE.w], [s * LINE.x, top + LINE.h / 2, 0], 'white'),
        kit.box([LINE.x * 2 - LINE.w, LINE.h, LINE.w], [0, top + LINE.h / 2, s * LINE.z], 'white'),
      );
    }
    // posts, a white top tape and a grid of net strands
    for (const s of [1, -1]) {
      parts.push(kit.box([POST.w, POST.h, POST.w], [s * POST.x, top + POST.h / 2, 0], 'wood'));
    }
    const netW = POST.x * 2 - POST.w;
    const netH = NET.y1 - NET.y0;
    parts.push(kit.box([netW, 0.05, 0.03], [0, top + NET.y1 + 0.025, 0], 'white'));
    for (let i = 0; i <= NET.rows; i++) {
      parts.push(kit.box([netW, NET.strand, NET.strand], [0, top + NET.y0 + (netH * i) / NET.rows, 0], 'stoneDark'));
    }
    for (let i = 0; i < NET.cols; i++) {
      parts.push(kit.box([NET.strand, netH, NET.strand], [-netW / 2 + NET.strand / 2 + ((netW - NET.strand) * i) / (NET.cols - 1), top + (NET.y0 + NET.y1) / 2, 0], 'stoneDark'));
    }
    // the ball: white with a blue band
    parts.push(
      kit.sphere(BALL.r, [BALL.x, top + BALL.r, BALL.z], 'white'),
      kit.torus(BALL.r + 0.004, 0.018, [BALL.x, top + BALL.r, BALL.z], 'blue', { radialSegments: 4, tubularSegments: 12, rotate: [0, 0.6, 0] }),
      kit.torus(BALL.r + 0.004, 0.018, [BALL.x, top + BALL.r, BALL.z], 'sunYellow', { radialSegments: 4, tubularSegments: 12, rotate: [0, -0.6, 0.0] }),
    );
    return kit.finish(parts);
  },
};
