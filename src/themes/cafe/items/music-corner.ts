import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A low stage with a rug, a guitar, a cajón drum, a speaker, a mic stand and a line of string lights.
const STAGE = { w: 1.9, h: 0.1, d: 2.9 };
const TOP = STAGE.h; // stage top
const LIGHTS = { x: -0.9, z: 1.3, topY: 1.42, sag: 0.22, count: 12 };

/** มุมดนตรี: a stage with a guitar, a cajón, a speaker and chasing string lights. */
export const item: ItemModel = {
  id: 'music-corner',
  name: 'มุมดนตรี',
  category: 'decoration',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([STAGE.w, STAGE.h, STAGE.d], [0, STAGE.h / 2, 0], 'woodDark'),
      kit.box([1.3, 0.02, 2.3], [0.1, TOP + 0.01, 0], 'mint'),
      kit.box([1.3, 0.025, 0.5], [0.1, TOP + 0.0125, 0.2], 'purple'),
      kit.box([1.3, 0.03, 0.12], [0.1, TOP + 0.015, -0.7], 'pink'),
    ];
    // guitar (stood on its end, face to +x)
    const gx = 0.4;
    const gz = 1.0;
    parts.push(
      kit.cylinder(0.17, 0.17, 0.07, [gx, TOP + 0.17, gz], 'orange', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.12, 0.12, 0.07, [gx, TOP + 0.4, gz], 'orange', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.055, 0.055, 0.02, [gx + 0.04, TOP + 0.2, gz], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.045, 0.6, 0.05], [gx, TOP + 0.75, gz], 'woodDark'),
      kit.box([0.06, 0.14, 0.07], [gx, TOP + 1.12, gz], 'wood'),
      kit.sphere(0.025, [gx + 0.04, TOP + 1.12, gz - 0.02], 'sunYellow', { detail: 0 }),
      kit.sphere(0.025, [gx + 0.04, TOP + 1.12, gz + 0.02], 'sunYellow', { detail: 0 }),
    );
    // cajón drum
    parts.push(
      kit.box([0.42, 0.46, 0.42], [0.1, TOP + 0.23, 0.2], 'wood'),
      kit.box([0.44, 0.03, 0.44], [0.1, TOP + 0.475, 0.2], 'terracotta'),
      kit.box([0.02, 0.07, 0.44], [0.31, TOP + 0.34, 0.2], 'sunYellow'),
      kit.cylinder(0.08, 0.08, 0.02, [0.315, TOP + 0.2, 0.2], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    );
    // speaker
    parts.push(
      kit.box([0.42, 0.85, 0.42], [-0.55, TOP + 0.425, -0.85], 'charcoal'),
      kit.cylinder(0.14, 0.14, 0.03, [-0.335, TOP + 0.28, -0.85], 'stoneDark', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.05, 0.05, 0.04, [-0.33, TOP + 0.28, -0.85], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.065, 0.065, 0.03, [-0.335, TOP + 0.65, -0.85], 'stone', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.2, 0.04, 0.2], [-0.55, TOP + 0.87, -0.85], 'red'),
    );
    // mic stand
    parts.push(
      kit.cylinder(0.12, 0.12, 0.03, [0.5, TOP + 0.015, -0.35], 'charcoal', { segments: 10 }),
      kit.cylinder(0.018, 0.018, 0.95, [0.5, TOP + 0.5, -0.35], 'chrome', { segments: 6 }),
      kit.sphere(0.055, [0.5, TOP + 1.0, -0.35], 'stoneDark'),
      kit.sphere(0.04, [0.5, TOP + 0.96, -0.35], 'red', { detail: 0 }),
    );
    // string-light poles, wire and chase bulbs (the bulbs stay still)
    for (const z of [-LIGHTS.z - 0.05, LIGHTS.z + 0.05]) {
      parts.push(kit.cylinder(0.035, 0.035, LIGHTS.topY - TOP + 0.03, [LIGHTS.x, (TOP + LIGHTS.topY + 0.03) / 2, z], 'woodDark', { segments: 8 }));
    }
    const COLORS = ['lampWarm', 'sunYellow', 'pink', 'lampWarm'] as const;
    const bulbAt = (i: number): [number, number, number] => {
      const t = i / (LIGHTS.count - 1);
      return [LIGHTS.x, LIGHTS.topY - LIGHTS.sag * (1 - (2 * t - 1) ** 2), -LIGHTS.z + 2 * LIGHTS.z * t];
    };
    parts.push(rod(kit, [LIGHTS.x, LIGHTS.topY, -LIGHTS.z - 0.05], bulbAt(0), 0.015, 'charcoal', { segments: 4 }));
    parts.push(rod(kit, bulbAt(LIGHTS.count - 1), [LIGHTS.x, LIGHTS.topY, LIGHTS.z + 0.05], 0.015, 'charcoal', { segments: 4 }));
    for (let i = 0; i < LIGHTS.count; i++) {
      if (i > 0) parts.push(rod(kit, bulbAt(i - 1), bulbAt(i), 0.015, 'charcoal', { segments: 4 }));
      parts.push(kit.sphere(0.055, bulbAt(i), COLORS[i % COLORS.length], {
        detail: 0, glow: true, light: 'chase', chase: { index: i, count: LIGHTS.count },
      }));
    }
    return kit.finish(parts);
  },
};
