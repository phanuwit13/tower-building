import { buildOccupancy, canPlace, clampPosition, rotatedFootprint } from '../game/grid';
import type { Catalog, GameState, Rotation } from '../game/types';
import type { GhostState } from './controller';

/**
 * Where the current item lands when the player points at tile (tx, tz): the footprint's centre
 * tile sits on it (rotated footprint), clamped inside the map, plus whether it can be placed there.
 * Pure: shared by tapTile (locking) and the mouse hover preview.
 */
export function placementAtTile(
  game: GameState, catalog: Catalog, rotation: Rotation, tx: number, tz: number,
): GhostState {
  const fp = catalog.items[game.current].footprint;
  const { w, d } = rotatedFootprint(fp, rotation);
  const p = clampPosition(fp, rotation, tx - Math.floor((w - 1) / 2), tz - Math.floor((d - 1) / 2));
  return { x: p.x, z: p.z, rotation, valid: canPlace(buildOccupancy(game.placements, catalog), fp, rotation, p.x, p.z) };
}
