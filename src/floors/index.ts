import { FLOOR_GROUPS } from './types';
import type { FloorTile } from './types';
import { tile as woodLight } from './tiles/wood-light';
import { tile as brickRed } from './tiles/brick-red';
import { tile as lawn } from './tiles/lawn';
import { tile as waterShallow } from './tiles/water-shallow';
import { tiles as f1 } from './batches/f1';
import { tiles as f2 } from './batches/f2';
import { tiles as f3 } from './batches/f3';

export { FLOOR_GROUPS };
export type { FloorGroup, FloorTile } from './types';

/** Every floor tile, in drawer order within its group (the drawer shows one group at a time). */
export const FLOOR_TILES: readonly FloorTile[] = [woodLight, brickRed, lawn, waterShallow, ...f1, ...f2, ...f3];

const byId = new Map(FLOOR_TILES.map((t) => [t.id, t]));

export const getFloorTile = (id: string): FloorTile | undefined => byId.get(id);
export const isFloorTile = (id: string): boolean => byId.has(id);
