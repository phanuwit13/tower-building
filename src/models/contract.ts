import type * as THREE from 'three';
import type { ItemSpec } from '../game/types';
import type { StyleKit } from './kit';

export type Category =
  | 'building' | 'nature' | 'seating' | 'food' | 'play'
  | 'ride' | 'animal' | 'vehicle' | 'decoration' | 'facility';

export const CATEGORIES: readonly Category[] = [
  'building', 'nature', 'seating', 'food', 'play', 'ride', 'animal', 'vehicle', 'decoration', 'facility',
];

export interface ItemModel extends ItemSpec {
  name: string;
  category: Category;
  build(kit: StyleKit): THREE.Object3D;
}
