import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A wooden pier (2×3, long side along z) running out over a patch of sea from a strip of sand at the -z end.
const WATER = { w: 1.96, h: 0.06, z0: -0.95, z1: 1.48 }; // sea patch: z from z0 to z1
const SAND = { h: 0.05, z0: -1.48, z1: -0.95 };
const DECK = { x: 0.1, w: 0.62, y: 0.42, t: 0.05, z0: -1.4, z1: 1.2 };
const PLANKS = 13;
const POST_ROWS = [-1.1, -0.45, 0.2, 0.85, 1.15]; // z of each pair of posts
const POST_DX = 0.27;
const POST_R = 0.045;

/** ท่าเรือไม้: a wooden pier on posts over the sea, with a ladder and a mooring post. */
export const item: ItemModel = {
  id: 'pier',
  name: 'ท่าเรือไม้',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([WATER.w, WATER.h, WATER.z1 - WATER.z0], [0, WATER.h / 2, (WATER.z0 + WATER.z1) / 2], 'navy', { motion: { kind: 'water', water: 'pond' } }),
      kit.box([WATER.w, SAND.h, SAND.z1 - SAND.z0], [0, SAND.h / 2, (SAND.z0 + SAND.z1) / 2], 'sand'),
    ];
    // deck: planks across, alternating shades, on two long beams
    const len = DECK.z1 - DECK.z0;
    const step = len / PLANKS;
    for (let i = 0; i < PLANKS; i++) {
      parts.push(kit.box([DECK.w, DECK.t, step - 0.02], [DECK.x, DECK.y, DECK.z0 + step * (i + 0.5)], i % 2 === 0 ? 'wood' : 'woodDark'));
    }
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.07, 0.06, len], [DECK.x + s * (POST_DX - 0.03), DECK.y - DECK.t / 2 - 0.03, (DECK.z0 + DECK.z1) / 2], 'bark'));
    }
    // posts stand in the sea (the first row on the sand)
    for (const z of POST_ROWS) {
      for (const s of [-1, 1]) {
        const base = z < SAND.z1 ? SAND.h - 0.01 : 0;
        const top = DECK.y - DECK.t / 2;
        parts.push(kit.cylinder(POST_R, POST_R, top - base, [DECK.x + s * POST_DX, base + (top - base) / 2, z], 'woodDark', { segments: 8 }));
      }
    }
    // ladder on the +x side, near the end: two rails and rungs down into the water
    const LZ = 0.7;
    const LX = DECK.x + DECK.w / 2 + 0.04;
    for (const dz of [-0.11, 0.11]) parts.push(rod(kit, [LX, DECK.y + 0.14, LZ + dz], [LX, 0.03, LZ + dz], 0.015, 'stone', { segments: 4 }));
    for (let r = 0; r < 4; r++) parts.push(kit.box([0.03, 0.03, 0.24], [LX, 0.12 + r * 0.075, LZ], 'stone'));
    // mooring post with a rope ring at the far end
    parts.push(kit.cylinder(0.06, 0.07, 0.2, [DECK.x + 0.18, DECK.y + DECK.t / 2 + 0.1, 1.1], 'woodDark', { segments: 8 }));
    parts.push(kit.torus(0.07, 0.016, [DECK.x + 0.18, DECK.y + DECK.t / 2 + 0.15, 1.1], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 12 }));
    // a little bollard cap and a lantern-free rail post pair at the sand end
    for (const s of [-1, 1]) parts.push(kit.box([0.06, 0.18, 0.06], [DECK.x + s * (DECK.w / 2 - 0.03), DECK.y + DECK.t / 2 + 0.09, -1.3], 'wood'));
    return kit.finish(parts);
  },
};
