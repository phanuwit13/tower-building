import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const BASE = 0.04;

/** ลานออกกำลังกาย: bright outdoor exercise machines on a teal rubber floor. */
export const item: ItemModel = {
  id: 'outdoor-gym',
  name: 'ลานออกกำลังกาย',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE, 2.96], [0, BASE / 2, 0], 'teal'),
      kit.box([1.7, 0.02, 2.7], [0, BASE + 0.0, 0], 'mint'),
    ];
    // 1. pull-up bars (z = -1.05): two posts, a high and a low bar
    const pz = -1.05;
    for (const x of [-0.6, 0.6]) parts.push(kit.cylinder(0.04, 0.04, 1.15, [x, BASE + 0.575, pz], 'orange', { segments: 8 }));
    parts.push(
      kit.cylinder(0.03, 0.03, 1.28, [0, BASE + 1.15, pz], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.03, 0.03, 1.28, [0, BASE + 0.8, pz], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    );

    // 2. air walker (z = -0.35): a post with two swinging-style foot pedals (still)
    const az = -0.35;
    parts.push(
      kit.box([0.6, 0.06, 0.3], [0, BASE + 0.03, az], 'sunYellow'),
      kit.cylinder(0.04, 0.045, 0.95, [0, BASE + 0.5, az], 'chrome', { segments: 8 }),
      kit.box([0.12, 0.06, 0.2], [0, BASE + 1.0, az], 'sunYellow'),
    );
    for (const [x, dir] of [[0.22, 1], [-0.22, -1]] as const) {
      parts.push(
        kit.box([0.18, 0.04, 0.14], [x, BASE + 0.22 + (dir > 0 ? 0.0 : 0.1), az + 0.0], 'pink'),
        rod(kit, [x * 0.9, BASE + 0.25 + (dir > 0 ? 0 : 0.1), az], [dir * 0.03, BASE + 0.95, az], 0.018, 'chrome', { segments: 6 }),
      );
    }

    // 3. chest press (z = 0.4): seat, back rest, two push arms
    const cz = 0.4;
    parts.push(
      kit.box([0.5, 0.05, 0.4], [-0.05, BASE + 0.025, cz], 'red'),
      kit.box([0.26, 0.07, 0.3], [0.05, BASE + 0.36, cz], 'blue'),
      kit.box([0.07, 0.45, 0.3], [-0.12, BASE + 0.65, cz], 'blue', { rotate: [0, 0, 0.12] }),
      kit.box([0.06, 0.34, 0.06], [-0.05, BASE + 0.2, cz], 'chrome'),
      kit.box([0.06, 0.07, 0.4], [-0.16, BASE + 0.55, cz], 'chrome'),
    );
    for (const z of [cz - 0.17, cz + 0.17]) {
      parts.push(
        rod(kit, [-0.16, BASE + 0.55, z], [0.3, BASE + 0.62, z], 0.022, 'chrome', { segments: 6 }),
        kit.sphere(0.04, [0.31, BASE + 0.62, z], 'sunYellow', { detail: 0 }),
      );
    }

    // 4. waist twister (z = 1.15): a post with a turntable disc and a handle ring
    const tz = 1.15;
    parts.push(
      kit.cylinder(0.3, 0.3, 0.05, [0, BASE + 0.025, tz], 'lime', { segments: 12 }),
      kit.cylinder(0.04, 0.04, 0.95, [0, BASE + 0.5, tz], 'chrome', { segments: 8 }),
      kit.cylinder(0.2, 0.2, 0.04, [0, BASE + 0.32, tz], 'orange', { segments: 12 }),
      kit.cylinder(0.025, 0.025, 0.5, [0, BASE + 0.95, tz], 'orange', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      kit.sphere(0.045, [0, BASE + 0.97, tz], 'sunYellow', { detail: 0 }),
    );
    // a bench along the +x side (z = -0.35..0.4 gap)
    parts.push(
      kit.box([0.2, 0.05, 0.5], [0.75, BASE + 0.245, 0.9], 'wood')  /* seat top at the shared 0.31 */,
      kit.box([0.04, 0.22, 0.4], [0.75, BASE + 0.11, 0.9], 'charcoal'),
    );
    return kit.finish(parts);
  },
};
