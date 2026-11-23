import type * as THREE from 'three';
import type { StyleKit } from '../models/kit';

export type FloorGroup = 'wood' | 'tile' | 'stone' | 'earth' | 'special';

/** Groups in drawer order, with their Thai names. */
export const FLOOR_GROUPS: readonly { id: FloorGroup; name: string }[] = [
  { id: 'wood', name: 'ไม้' },
  { id: 'tile', name: 'ปูน-กระเบื้อง' },
  { id: 'stone', name: 'หิน-อิฐ' },
  { id: 'earth', name: 'ดิน-หญ้า' },
  { id: 'special', name: 'พิเศษ' },
];

/**
 * A floor tile: one map cell of ground covering, shared by every theme. Built like an item
 * (`build(kit)`, kit materials only) but the footprint is always 1 x 1, centred on the cell, and
 * it lies on the ground: tops at most 0.03 high, relief at most 0.05 (see validateFloorTile).
 */
export interface FloorTile {
  id: string;
  name: string;
  group: FloorGroup;
  /**
   * How many looks the tile has (default 1). Each cell shows the look its position picks
   * (cellVariant), so a wide area of a loose surface such as sand never repeats one pattern.
   */
  variants?: number;
  /** Draws look `variant` (0 when left out: the thumbnail, the preview). Every look obeys the tile rules. */
  build(kit: StyleKit, variant?: number): THREE.Object3D;
}
