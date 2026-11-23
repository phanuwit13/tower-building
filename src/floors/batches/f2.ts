import type { FloorTile } from '../types';
import { tile as terrazzo } from '../tiles/terrazzo';
import { tile as asphalt } from '../tiles/asphalt';
import { tile as brickHerringbone } from '../tiles/brick-herringbone';
import { tile as gravel } from '../tiles/gravel';
import { tile as cobblestone } from '../tiles/cobblestone';
import { tile as flagstone } from '../tiles/flagstone';
import { tile as steppingStones } from '../tiles/stepping-stones';
import { tile as paverInterlock } from '../tiles/paver-interlock';
import { tile as grassPaver } from '../tiles/grass-paver';
import { tile as dirt } from '../tiles/dirt';

/**
 * Floor tiles batch f2: terrazzo, asphalt, the stone and brick floors, and dirt.
 * Review: `?gallery=floors` on the dev server. Check: `npx vitest run src/floors`.
 */
export const tiles: readonly FloorTile[] = [
  terrazzo, asphalt, brickHerringbone, gravel, cobblestone, flagstone, steppingStones, paverInterlock, grassPaver, dirt,
];
