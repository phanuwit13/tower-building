import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wallPanel } from '../../../models/parts';

// A raised wooden stage (2x3, long side along z) with a navy backdrop on the -x side, red curtains and a
// valance, steps at the +z end, and a charcoal truss over the front edge carrying four spotlights that breathe.
const DECK = { x: 1.9, z: 2.5, h: 0.24 }; // the stage floor, centred
const TRIM = 0.05; // yellow band round the deck's front
const BACK = { x: -0.86, t: 0.1, h: 1.1 }; // backdrop wall: centre x, thickness, height above the deck
const CURTAIN = { x: -0.66, w: 0.3, d: 0.5, h: 1.0 }; // each side curtain
const VALANCE = { h: 0.2, y: 1.2 }; // across the top of the backdrop (y above the deck)
const POST = { r: 0.05, h: 1.6, x: 0.86, z: 1.12 }; // truss posts, standing on the deck at the front corners
const TRUSS = { top: 1.76, bottom: 1.52, cells: 9 }; // two chords along z with zig-zag bars between
const SPOT_Z = [-0.8, -0.27, 0.27, 0.8];
const STEP = { w: 0.7, x: 0.3 }; // two steps down off the +z end

/** เวทีโชว์: a raised stage with curtains, a top truss and spotlights that breathe. */
export const item: ItemModel = {
  id: 'show-stage',
  name: 'เวทีโชว์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const deckTop = DECK.h;
    const parts: Part[] = [
      kit.box([DECK.x, DECK.h, DECK.z], [0, DECK.h / 2, 0], 'wood'),
      kit.box([DECK.x + 0.04, TRIM, DECK.z + 0.04], [0, DECK.h - TRIM / 2 - 0.02, 0], 'sunYellow'),
      kit.box([DECK.x - 0.1, 0.02, DECK.z - 0.1], [0, deckTop + 0.01, 0], 'woodDark'),
      // steps at the +z end
      kit.box([STEP.w, 0.08, 0.24], [STEP.x, 0.04, DECK.z / 2 + 0.12], 'stone'),
      kit.box([STEP.w, 0.16, 0.12], [STEP.x, 0.08, DECK.z / 2 + 0.06], 'stone'),
      // backdrop, stars, valance and curtains
      kit.box([BACK.t, BACK.h, DECK.z - 0.1], [BACK.x, deckTop + BACK.h / 2, 0], 'navy'),
      kit.box([0.22, VALANCE.h, DECK.z - 0.1], [BACK.x + 0.12, deckTop + VALANCE.y, 0], 'red'),
      kit.box([0.24, 0.05, DECK.z - 0.1], [BACK.x + 0.12, deckTop + VALANCE.y - VALANCE.h / 2 - 0.02, 0], 'redDark'),
    ];
    for (const z of [-0.5, 0, 0.5]) {
      parts.push(...wallPanel(kit, { at: [BACK.x + BACK.t / 2, deckTop + 0.55, z], facing: 'x+', w: 0.2, h: 0.2, depth: 0.02, color: 'sunYellow' }));
    }
    for (const s of [1, -1]) {
      parts.push(
        kit.box([CURTAIN.w, CURTAIN.h, CURTAIN.d], [CURTAIN.x, deckTop + CURTAIN.h / 2, s * (DECK.z / 2 - CURTAIN.d / 2 - 0.05)], 'red'),
        kit.box([CURTAIN.w + 0.02, CURTAIN.h * 0.5, 0.06], [CURTAIN.x, deckTop + CURTAIN.h * 0.3, s * (DECK.z / 2 - CURTAIN.d - 0.05 + 0.03)], 'redDark'), // fold
        kit.cylinder(POST.r, POST.r, POST.h, [POST.x, deckTop + POST.h / 2, s * POST.z], 'charcoal', { segments: 8 }),
        kit.cylinder(POST.r, POST.r, POST.h, [-POST.x, deckTop + POST.h / 2, s * POST.z], 'charcoal', { segments: 8 }),
        // cross tie from front to back truss end
        kit.box([2 * POST.x, 0.07, 0.07], [0, TRUSS.top + 0.02, s * POST.z], 'charcoal'),
      );
    }
    // the front truss: two chords along z and a zig-zag of bars between them
    for (const y of [TRUSS.top, TRUSS.bottom]) parts.push(kit.box([0.07, 0.07, 2 * POST.z + 0.1], [POST.x, y + 0.02, 0], 'charcoal'));
    const cell = (2 * POST.z) / TRUSS.cells;
    for (let i = 0; i < TRUSS.cells; i++) {
      const z0 = -POST.z + i * cell;
      const up = i % 2 === 0;
      parts.push(rod(kit, [POST.x, up ? TRUSS.bottom + 0.02 : TRUSS.top + 0.02, z0], [POST.x, up ? TRUSS.top + 0.02 : TRUSS.bottom + 0.02, z0 + cell], 0.015, 'chrome', { segments: 4 }));
    }
    // spotlights hanging under the truss, glowing and breathing
    for (const z of SPOT_Z) {
      parts.push(
        kit.cylinder(0.075, 0.05, 0.12, [POST.x, TRUSS.bottom - 0.08, z], 'charcoal', { segments: 8 }),
        kit.sphere(0.055, [POST.x, TRUSS.bottom - 0.17, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      );
    }
    return kit.finish(parts);
  },
};
