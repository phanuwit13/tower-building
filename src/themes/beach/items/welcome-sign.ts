import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// An arched wooden gate-sign across z on two posts, facing +x: a mint half-disc board in a wooden arch,
// a sun with rays in the middle and shells along the bottom. Shapes only, no text. Decorated on both faces.
const POST = { z: 0.72, w: 0.12, h: 0.55 };
const ARCH = { r: 0.78, squash: 0.8, y: POST.h, tube: 0.05 }; // the board's half-disc, centred over the posts
const BOARD_T = 0.06;
const SUN = { y: 0.88, r: 0.15, rays: 8, rayLen: 0.12 };
const SHELLS: Array<[number, PaletteColor]> = [[-0.5, 'pink'], [-0.17, 'white'], [0.17, 'orange'], [0.5, 'pink']];

/** ป้ายต้อนรับ: arched wooden sign on two posts decorated with shells and a sun (no text). */
export const item: ItemModel = {
  id: 'welcome-sign',
  name: 'ป้ายต้อนรับ',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const s of [1, -1]) {
      parts.push(
        kit.box([0.3, 0.05, POST.w + 0.14], [0, 0.025, s * POST.z], 'stone'), // footing
        kit.box([POST.w, POST.h, POST.w], [0, 0.05 + POST.h / 2 - 0.05, s * POST.z], 'woodDark'),
      );
    }
    parts.push(
      kit.box([0.1, 0.12, POST.z * 2 + POST.w], [0, POST.h - 0.06, 0], 'wood'), // bottom crossbar
      kit.dome(ARCH.r, [0, POST.h, 0], 'mint', { segments: 12, scale: [BOARD_T / ARCH.r, ARCH.squash, 1] }),
      kit.torus(ARCH.r, ARCH.tube, [0, POST.h, 0], 'wood', { arc: Math.PI, radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0], scale: [1, ARCH.squash, 1] }),
    );
    for (const s of [1, -1]) {
      const x = s * (BOARD_T / 2 + 0.015);
      parts.push(kit.sphere(SUN.r, [x, SUN.y, 0], 'sunYellow', { detail: 1, scale: [0.25, 1, 1] }));
      for (let k = 0; k < SUN.rays; k++) {
        const a = (k / SUN.rays) * Math.PI * 2;
        const d = SUN.r + SUN.rayLen / 2 + 0.03;
        parts.push(kit.box([0.025, SUN.rayLen, 0.04], [x, SUN.y + Math.cos(a) * d, Math.sin(a) * d], 'orange', { rotate: [-a, 0, 0] }));
      }
      for (const [z, color] of SHELLS) {
        // a little shell: a cone lying on its side pointing out, with a ball at its base
        parts.push(kit.cone(0.08, 0.14, [s * (BOARD_T / 2 + 0.07), POST.h + 0.1, z], color, { segments: 8, rotate: [0, 0, -s * Math.PI / 2] }));
      }
    }
    return kit.finish(parts);
  },
};
