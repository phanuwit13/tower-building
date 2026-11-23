import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim } from '../../../models/parts';

// A friendly round robot (1×1): a white ball body on two orange feet, a dark screen face on +x with
// teal glowing eyes and a smile, little yellow ear discs, orange arms and a blinking red antenna.
const BODY_Y = 0.2;
const BODY_R = 0.16;
const SCALE_Y = 0.92;

/** หุ่นยนต์ผู้ช่วย: a friendly round robot with a screen face and a blinking antenna. */
export const item: ItemModel = {
  id: 'helper-robot',
  name: 'หุ่นยนต์ผู้ช่วย',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const faceX = BODY_R * 0.93;
    const face = aim([1, 0, 0]);
    const top = BODY_Y + BODY_R * SCALE_Y;
    const parts: Part[] = [
      kit.box([0.14, 0.06, 0.1], [0.02, 0.03, 0.1], 'orange'),
      kit.box([0.14, 0.06, 0.1], [0.02, 0.03, -0.1], 'orange'),
      kit.sphere(BODY_R, [0, BODY_Y, 0], 'white', { scale: [1, SCALE_Y, 1] }),
      kit.cylinder(BODY_R + 0.005, BODY_R + 0.005, 0.03, [0, BODY_Y - 0.06, 0], 'teal', { segments: 12 }),
      // screen face
      kit.cylinder(0.115, 0.115, 0.04, [faceX, BODY_Y + 0.02, 0], 'charcoal', { segments: 12, rotate: face }),
      kit.cylinder(0.03, 0.03, 0.03, [faceX + 0.025, BODY_Y + 0.06, 0.05], 'teal', { segments: 8, rotate: face, glow: 'teal', light: 'window' }),
      kit.cylinder(0.03, 0.03, 0.03, [faceX + 0.025, BODY_Y + 0.06, -0.05], 'teal', { segments: 8, rotate: face, glow: 'teal', light: 'window' }),
      kit.box([0.03, 0.018, 0.016], [faceX + 0.025, BODY_Y - 0.02, 0.045], 'lime', { glow: 'lime', light: 'window' }),
      kit.box([0.03, 0.018, 0.016], [faceX + 0.025, BODY_Y - 0.032, 0.0], 'lime', { glow: 'lime', light: 'window' }),
      kit.box([0.03, 0.018, 0.016], [faceX + 0.025, BODY_Y - 0.02, -0.045], 'lime', { glow: 'lime', light: 'window' }),
      // ears and arms
      kit.cylinder(0.04, 0.04, 0.04, [0, BODY_Y + 0.03, 0.165], 'sunYellow', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.04, 0.04, 0.04, [0, BODY_Y + 0.03, -0.165], 'sunYellow', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.045, [0.03, BODY_Y - 0.06, 0.2], 'orange', { detail: 0 }),
      kit.sphere(0.045, [0.03, BODY_Y - 0.06, -0.2], 'orange', { detail: 0 }),
      // antenna with a blinking bulb
      kit.cylinder(0.013, 0.013, 0.12, [0, top + 0.05, 0], 'stoneDark', { segments: 6 }),
      kit.sphere(0.035, [0, top + 0.13, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
    ];
    return kit.finish(parts);
  },
};
