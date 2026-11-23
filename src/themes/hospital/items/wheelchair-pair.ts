import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wheel } from '../../../models/parts';

// Two empty wheelchairs side by side along z, both facing +x.
const SEAT_Y = 0.31;
const R = 0.17; // big wheel radius
const TUBE = 0.02;

function chair(kit: StyleKit, z: number, seat: PaletteColor): Part[] {
  const p: Part[] = [
    // seat, back, armrests
    kit.box([0.34, 0.04, 0.38], [0, SEAT_Y - 0.02, z], seat),
    kit.box([0.04, 0.3, 0.38], [-0.19, SEAT_Y + 0.15, z], seat),
    kit.box([0.04, 0.03, 0.04], [-0.15, SEAT_Y + 0.37, z], 'white'),
    // frame under the seat, push handles
    kit.box([0.32, 0.03, 0.04], [0, 0.27, z - 0.15], 'chrome'),
    kit.box([0.32, 0.03, 0.04], [0, 0.27, z + 0.15], 'chrome'),
    kit.box([0.05, 0.03, 0.4], [-0.21, SEAT_Y + 0.33, z], 'chrome'),
  ];
  for (const dz of [-0.2, 0.2]) {
    p.push(
      kit.box([0.3, 0.025, 0.045], [-0.01, SEAT_Y + 0.12, z + dz], 'chrome'),
      kit.box([0.025, 0.12, 0.025], [0.1, SEAT_Y + 0.06, z + dz], 'chrome'),
      kit.box([0.025, 0.12, 0.025], [-0.12, SEAT_Y + 0.06, z + dz], 'chrome'),
      kit.box([0.04, 0.025, 0.025], [-0.23, SEAT_Y + 0.33, z + dz * 0.95], 'chrome'),
      // footrest hanger and plate, front
      kit.box([0.025, 0.2, 0.025], [0.2, 0.2, z + dz * 0.6], 'chrome'),
      // big rear wheels with a hub in the middle
      ...wheel(kit, { at: [-0.1, R + TUBE, z + dz * 1.28], radius: R, tube: TUBE, axis: 'z', color: 'charcoal', hubColor: 'chrome', spokeColor: 'chrome', spokes: 2 }),
      // front casters
      kit.cylinder(0.04, 0.04, 0.03, [0.22, 0.04, z + dz * 1.2], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
    );
  }
  p.push(kit.box([0.12, 0.025, 0.28], [0.27, 0.12, z], 'stoneDark', { rotate: [0, 0, -0.35] }));
  return p;
}

/** รถเข็นผู้ป่วยคู่: two empty wheelchairs side by side. */
export const item: ItemModel = {
  id: 'wheelchair-pair',
  name: 'รถเข็นผู้ป่วยคู่',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => kit.finish([...chair(kit, -0.5, 'mint'), ...chair(kit, 0.5, 'skyBlue')]),
};
