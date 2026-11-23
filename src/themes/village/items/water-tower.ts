import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A village water tank: a round teal tank with white bands and a stone-grey lid on a railed deck, held up by
// four concrete legs with cross beams; a ladder runs up the +x side and a pipe comes down the -x side.
const LEG = { half: 0.62, w: 0.13, h: 1.5 };
const DECK = { half: 0.8, y: 1.5, h: 0.08 };
const DECK_TOP = DECK.y + DECK.h;
const TANK = { r: 0.6, h: 1.0 };
const TANK_TOP = DECK_TOP + TANK.h;
const LADDER = { x: 0.88, hw: 0.12 };

/** แท็งก์น้ำประปาหมู่บ้าน: a tall village water tank on four legs with a ladder and pipes. */
export const item: ItemModel = {
  id: 'water-tower',
  name: 'แท็งก์น้ำประปาหมู่บ้าน',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(
          kit.box([0.22, 0.08, 0.22], [sx * LEG.half, 0.04, sz * LEG.half], 'stoneDark'),
          kit.box([LEG.w, LEG.h - 0.08, LEG.w], [sx * LEG.half, 0.08 + (LEG.h - 0.08) / 2, sz * LEG.half], 'stone'),
        );
      }
    }
    // cross beams in two storeys
    for (const y of [0.55, 1.05]) {
      for (const s of [-1, 1]) {
        parts.push(
          kit.box([2 * LEG.half, 0.08, 0.08], [0, y, s * LEG.half], 'stone'),
          kit.box([0.08, 0.08, 2 * LEG.half], [s * LEG.half, y, 0], 'stone'),
        );
      }
    }
    parts.push(
      kit.box([2 * DECK.half, DECK.h, 2 * DECK.half], [0, DECK.y + DECK.h / 2, 0], 'stoneDark'),
      kit.cylinder(TANK.r, TANK.r, TANK.h, [0, DECK_TOP + TANK.h / 2, 0], 'teal', { segments: 16 }),
      kit.cylinder(TANK.r + 0.015, TANK.r + 0.015, 0.07, [0, DECK_TOP + 0.12, 0], 'white', { segments: 16 }),
      kit.cylinder(TANK.r + 0.015, TANK.r + 0.015, 0.07, [0, TANK_TOP - 0.12, 0], 'white', { segments: 16 }),
      kit.cylinder(TANK.r + 0.015, TANK.r + 0.015, 0.1, [0, DECK_TOP + TANK.h / 2, 0], 'sunYellow', { segments: 16 }),
      kit.dome(TANK.r, [0, TANK_TOP, 0], 'stone', { segments: 12, scale: [1, 0.5, 1] }),
      kit.cylinder(0.05, 0.05, 0.1, [0, TANK_TOP + 0.3, 0], 'stoneDark', { segments: 8 }),
    );
    // deck railing (open on +x where the ladder arrives)
    const rail = DECK.half - 0.03;
    const railY = DECK_TOP + 0.22;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.04, 0.22, 0.04], [sx * rail, DECK_TOP + 0.11, sz * rail], 'white'));
    }
    parts.push(kit.box([0.04, 0.04, 2 * rail], [-rail, railY, 0], 'white'));
    for (const sz of [-1, 1]) parts.push(kit.box([2 * rail, 0.04, 0.04], [0, railY, sz * rail], 'white'));
    for (const sz of [-1, 1]) parts.push(kit.box([0.16, 0.04, 0.04], [rail, railY, sz * rail * 0.9], 'white'));
    // ladder up the +x side
    const top = DECK_TOP + 0.55;
    for (const z of [-LADDER.hw, LADDER.hw]) parts.push(kit.cylinder(0.02, 0.02, top, [LADDER.x, top / 2, z], 'chrome', { segments: 4 }));
    for (let y = 0.2; y < top - 0.05; y += 0.2) parts.push(kit.box([0.03, 0.03, 2 * LADDER.hw], [LADDER.x, y, 0], 'chrome'));
    // brackets tie the ladder to the deck edge
    for (const z of [-LADDER.hw, LADDER.hw]) parts.push(kit.box([0.1, 0.04, 0.04], [0.83, DECK.y + 0.04, z], 'chrome'));
    // pipe: out of the tank, down the -x side, along the ground to a tap with a red wheel
    const px = -0.82;
    parts.push(
      kit.cylinder(0.045, 0.045, 0.2, [-0.72, 1.9, 0], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.045, 0.045, 1.85, [px, 0.045 + 1.85 / 2, 0], 'chrome', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.88, [px, 0.045, 0.44], 'chrome', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.065, 0.065, 0.1, [px, 0.065, 0.88], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.075, 0.075, 0.03, [px, 0.16, 0.88], 'red', { segments: 8 }),
      kit.cylinder(0.02, 0.02, 0.1, [px, 0.12, 0.88], 'stoneDark', { segments: 4 }),
    );
    return kit.finish(parts);
  },
};
