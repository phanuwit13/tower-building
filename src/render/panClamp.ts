import { GRID_SIZE } from '../game/types';

/** Keep the orbit target (what the camera looks at on the ground) inside the map, so panning can't leave it. */
export function clampPanTarget(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.min(Math.max(x, 0), GRID_SIZE),
    z: Math.min(Math.max(z, 0), GRID_SIZE),
  };
}
