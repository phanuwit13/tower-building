import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A friendly round robot (1×1), chunky: a bright yellow ball body on two blue feet, a big dark screen
// face on +x with teal glowing eyes and a lime smile, orange arms and a blinking red antenna. Top ≈ 0.51.
const BODY_Y = 0.24;
const BODY_R = 0.19;
const SCALE_Y = 0.9;

/** หุ่นยนต์ผู้ช่วย: a friendly round robot with a screen face and a blinking antenna. */
export const item: ItemModel = {
  id: 'helper-robot',
  name: 'หุ่นยนต์ผู้ช่วย',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const face = aim([1, 0, 0]);
    const top = BODY_Y + BODY_R * SCALE_Y;
    const fx = 0.15; // screen centre: back at 0.11 (inside the ball), front at 0.19
    const ex = 0.195; // eyes and smile sit on the screen
    const parts: Part[] = [
      kit.box([0.17, 0.07, 0.13], [0.03, 0.035, 0.11], 'blue'),
      kit.box([0.17, 0.07, 0.13], [0.03, 0.035, -0.11], 'blue'),
      kit.sphere(BODY_R, [0, BODY_Y, 0], 'sunYellow', { scale: [1, SCALE_Y, 1] }),
      kit.cylinder(BODY_R + 0.005, BODY_R + 0.005, 0.04, [0, BODY_Y - 0.09, 0], 'teal', { segments: 12 }),
      // big screen face
      kit.cylinder(0.13, 0.13, 0.08, [fx, BODY_Y + 0.01, 0], 'charcoal', { segments: 12, rotate: face }),
      kit.cylinder(0.04, 0.04, 0.03, [ex + 0.01, BODY_Y + 0.05, 0.055], 'teal', { segments: 8, rotate: face, glow: 'teal', light: 'window' }),
      kit.cylinder(0.04, 0.04, 0.03, [ex + 0.01, BODY_Y + 0.05, -0.055], 'teal', { segments: 8, rotate: face, glow: 'teal', light: 'window' }),
      kit.box([0.03, 0.02, 0.03], [ex + 0.01, BODY_Y - 0.035, 0.065], 'lime', { glow: 'lime', light: 'window' }),
      kit.box([0.03, 0.02, 0.09], [ex + 0.01, BODY_Y - 0.055, 0], 'lime', { glow: 'lime', light: 'window' }),
      kit.box([0.03, 0.02, 0.03], [ex + 0.01, BODY_Y - 0.035, -0.065], 'lime', { glow: 'lime', light: 'window' }),
      // arms: short sleeves and round hands
      kit.cylinder(0.04, 0.04, 0.1, [0, BODY_Y - 0.01, 0.22], 'orange', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.04, 0.04, 0.1, [0, BODY_Y - 0.01, -0.22], 'orange', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.055, [0.02, BODY_Y - 0.03, 0.29], 'orange', { detail: 0 }),
      kit.sphere(0.055, [0.02, BODY_Y - 0.03, -0.29], 'orange', { detail: 0 }),
      // antenna with a blinking bulb
      kit.cylinder(0.014, 0.014, 0.08, [0, top + 0.03, 0], 'stoneDark', { segments: 6 }),
      kit.sphere(0.035, [0, top + 0.08, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
    ];
    return kit.finish(parts);
  },
};
