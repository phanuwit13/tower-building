import type { FloorTile } from '../types';
import { tile as woodDark } from '../tiles/wood-dark';
import { tile as parquetHerringbone } from '../tiles/parquet-herringbone';
import { tile as deckBoards } from '../tiles/deck-boards';
import { tile as parquetSquare } from '../tiles/parquet-square';
import { tile as concrete } from '../tiles/concrete';
import { tile as concreteSlabs } from '../tiles/concrete-slabs';
import { tile as tileWhite } from '../tiles/tile-white';
import { tile as tileChecker } from '../tiles/tile-checker';
import { tile as tileHex } from '../tiles/tile-hex';
import { tile as tileBlue } from '../tiles/tile-blue';

/**
 * Floor tiles batch f1: four woods and six concrete / ceramic floors.
 * Review: `?gallery=floors` on the dev server. Check: `npx vitest run src/floors`.
 */
export const tiles: readonly FloorTile[] = [
  woodDark, parquetHerringbone, deckBoards, parquetSquare, concrete, concreteSlabs, tileWhite, tileChecker, tileHex, tileBlue,
];
