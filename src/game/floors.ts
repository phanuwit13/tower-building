import { GRID_SIZE } from './types';

/** Inclusive cell rectangle; corners may be given in any order. */
export interface FloorRect { x0: number; z0: number; x1: number; z1: number }

export function emptyFloors(): (string | null)[] {
  return new Array<string | null>(GRID_SIZE * GRID_SIZE).fill(null);
}

const clampCell = (n: number): number => Math.min(GRID_SIZE - 1, Math.max(0, Math.trunc(n)));

/** Order the corners (min first) and clamp to the map. */
export function normaliseRect(r: FloorRect): FloorRect {
  const xa = clampCell(r.x0), xb = clampCell(r.x1), za = clampCell(r.z0), zb = clampCell(r.z1);
  return { x0: Math.min(xa, xb), z0: Math.min(za, zb), x1: Math.max(xa, xb), z1: Math.max(za, zb) };
}

/** Cell indices (z * GRID_SIZE + x) covered by the rectangle. */
export function rectCells(r: FloorRect): number[] {
  const n = normaliseRect(r);
  const cells: number[] = [];
  for (let z = n.z0; z <= n.z1; z++) for (let x = n.x0; x <= n.x1; x++) cells.push(z * GRID_SIZE + x);
  return cells;
}

/** New floors array with the rectangle set to tileId (null erases). */
export function paintRect(floors: readonly (string | null)[], r: FloorRect, tileId: string | null): (string | null)[] {
  const next = [...floors];
  for (const i of rectCells(r)) next[i] = tileId;
  return next;
}
