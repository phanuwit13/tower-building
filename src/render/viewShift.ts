import type * as THREE from 'three';

/** The view moves up by half the drawer's height, but never by more than this share of the canvas. */
export const MAX_SHIFT_SHARE = 0.4;

/** Pure: how many pixels to lift the view for a drawer `drawerPx` tall over a canvas `canvasPx` tall. */
export function viewShiftPx(drawerPx: number, canvasPx: number): number {
  if (!(drawerPx > 0) || !(canvasPx > 0)) return 0;
  return Math.round(Math.min(drawerPx / 2, canvasPx * MAX_SHIFT_SHARE));
}

/**
 * Slide the rendered view up by `shiftPx` (the same camera, the same pose: only the window onto the
 * image moves), so the map's bottom cells clear a bottom drawer. 0 restores the normal view. The
 * projection matrix carries the offset, so a pointer ray through the canvas still hits the right cell.
 */
export function applyViewShift(camera: THREE.PerspectiveCamera, width: number, height: number, shiftPx: number): void {
  if (shiftPx > 0 && width > 0 && height > 0) camera.setViewOffset(width, height, 0, shiftPx, width, height);
  else if (camera.view?.enabled) camera.clearViewOffset();
}
