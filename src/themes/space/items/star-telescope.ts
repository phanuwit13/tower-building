import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { aim, rod } from '../../../models/parts';

// A big telescope on a tripod (1x2, long side along z), the tube pointing up and out towards +z.
const HEAD: Vec3 = [0, 0.72, -0.05];
const DIR: Vec3 = [0, 0.8, 0.6]; // the way the tube points (unit length)
const FEET: Vec3[] = [[0.36, 0.04, 0.72], [-0.36, 0.04, 0.72], [0, 0.04, -0.72]];
const at = (s: number, o: Vec3 = [0, 0, 0]): Vec3 => [HEAD[0] + DIR[0] * s + o[0], HEAD[1] + DIR[1] * s + o[1], HEAD[2] + DIR[2] * s + o[2]];

/** กล้องดูดาว: a big telescope on a tripod pointing up. */
export const item: ItemModel = {
  id: 'star-telescope',
  name: 'กล้องดูดาว',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const f of FEET) {
      parts.push(
        kit.cylinder(0.08, 0.09, 0.04, [f[0], 0.02, f[2]], 'stoneDark', { segments: 8 }),
        rod(kit, f, [HEAD[0], HEAD[1] - 0.05, HEAD[2]], 0.035, 'red', { segments: 6 }),
      );
    }
    parts.push(
      kit.cylinder(0.12, 0.12, 0.08, [HEAD[0], HEAD[1] - 0.06, HEAD[2]], 'charcoal', { segments: 8 }),
      kit.sphere(0.11, HEAD, 'orange', { detail: 0 }),
      // the tube: white with a blue band, an orange lens ring, a sky-blue lens, a rear eyepiece
      kit.cylinder(0.14, 0.13, 1.1, at(0.25), 'white', { segments: 12, rotate: aim(DIR) }),
      kit.cylinder(0.145, 0.145, 0.16, at(0.1), 'blue', { segments: 12, rotate: aim(DIR) }),
      kit.cylinder(0.16, 0.16, 0.07, at(0.78), 'orange', { segments: 12, rotate: aim(DIR) }),
      kit.cylinder(0.11, 0.11, 0.02, at(0.82), 'skyBlue', { segments: 12, rotate: aim(DIR) }),
      kit.cylinder(0.05, 0.05, 0.18, at(-0.38), 'charcoal', { segments: 8, rotate: aim(DIR) }),
      // finder scope riding on top of the tube
      kit.cylinder(0.04, 0.04, 0.4, at(0.35, [0, 0.114, -0.152]), 'sunYellow', { segments: 8, rotate: aim(DIR) }),
    );
    return kit.finish(parts);
  },
};
