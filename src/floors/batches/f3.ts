import type { FloorTile } from '../types';
import { tile as mud } from '../tiles/mud';
import { tile as sand } from '../tiles/sand';
import { tile as lawnFlowers } from '../tiles/lawn-flowers';
import { tile as tilledSoil } from '../tiles/tilled-soil';
import { tile as fallenLeaves } from '../tiles/fallen-leaves';
import { tile as rubberPlay } from '../tiles/rubber-play';
import { tile as carpetRed } from '../tiles/carpet-red';
import { tile as snow } from '../tiles/snow';
import { tile as hopscotch } from '../tiles/hopscotch';
import { tile as rainbowPath } from '../tiles/rainbow-path';

/**
 * Floor tiles batch f3: mud, sand, flowers, tilled soil, leaves (earth) and rubber, red carpet,
 * snow, hopscotch, rainbow (special). Review: `?gallery=floors`. Check: `npx vitest run src/floors`.
 */
export const tiles: readonly FloorTile[] = [mud, sand, lawnFlowers, tilledSoil, fallenLeaves, rubberPlay, carpetRed, snow, hopscotch, rainbowPath];
