import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

const BASE = { s: 0.9, h: 0.04 };
const POST = { x: 0.22, y0: 0.04, h: 0.74 };

/** สถานีชาร์จรถ: a charging post with a lit screen and a cable lying on the pad. */
export const item: ItemModel = {
  id: 'rover-charger',
  name: 'สถานีชาร์จรถ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const px = -0.1; // post centre x; its +x face is the front
    const faceX = px + POST.x / 2;
    const parts: Part[] = [
      kit.box([BASE.s, BASE.h, BASE.s], [0, BASE.h / 2, 0], 'stone'),
      kit.box([0.5, 0.01, 0.5], [0.12, BASE.h + 0.005, 0], 'sunYellow'), // the parking square
      kit.box([POST.x, POST.h, 0.42], [px, POST.y0 + POST.h / 2, 0], 'white'),
      kit.box([POST.x + 0.04, 0.12, 0.46], [px, POST.y0 + POST.h - 0.06, 0], 'teal'), // cap, tilted look
      kit.box([POST.x + 0.04, 0.08, 0.46], [px, POST.y0 + 0.04, 0], 'orange'),
      // the lit screen, tipped back a little so the camera sees it
      kit.box([0.03, 0.3, 0.3], [faceX + 0.01, 0.5, 0], 'skyBlue', { glow: 'windowWarm', light: 'window', rotate: [0, 0, 0.0] }),
      // a lightning bolt (boxes) on the screen
      kit.box([0.01, 0.1, 0.05], [faceX + 0.03, 0.54, 0.02], 'sunYellow', { rotate: [0.4, 0, 0] }),
      kit.box([0.01, 0.1, 0.05], [faceX + 0.03, 0.46, -0.02], 'sunYellow', { rotate: [0.4, 0, 0] }),
      // holster for the plug on the +x face
      kit.box([0.08, 0.1, 0.12], [faceX + 0.04, 0.24, 0.0], 'charcoal'),
    ];
    // the cable: a drooping chain of rods from the post's side down to a plug on the pad
    const pts: Vec3[] = [[faceX, 0.28, 0.14], [faceX + 0.1, 0.16, 0.2], [faceX + 0.2, 0.09, 0.28], [faceX + 0.3, 0.07, 0.34]];
    for (let i = 0; i < pts.length - 1; i++) parts.push(rod(kit, pts[i], pts[i + 1], 0.022, 'charcoal', { segments: 4 }));
    parts.push(kit.box([0.1, 0.07, 0.07], [faceX + 0.36, BASE.h + 0.035, 0.36], 'orange'));
    return kit.finish(parts);
  },
};
