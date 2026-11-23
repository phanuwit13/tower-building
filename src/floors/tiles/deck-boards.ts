import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the shadowed gaps between boards
const BOARD_H = 0.007; // top at 0.015, the most a tile may rise
const BOARD_W = 0.17; // five boards across the cell, 0.03 apart
const BOARD_X = [-0.4, -0.2, 0, 0.2, 0.4];
/** Where each board is butted end to end (z). Staggered, and a board still runs to the cell edge on both sides. */
const JOINT_Z = [-0.2, 0.15, 0, 0.25, -0.1];
const JOINT = 0.02;

/** ไม้ระแนงระเบียง: outdoor deck boards laid along z with wide gaps and staggered end joints. */
export const tile: FloorTile = {
  id: 'deck-boards',
  name: 'ไม้ระแนงระเบียง',
  group: 'wood',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'bark')];
    BOARD_X.forEach((x, i) => {
      const color = i % 2 === 0 ? 'wood' : 'sand';
      const j = JOINT_Z[i];
      const lenA = j - JOINT / 2 + 0.5; // from the cell edge z = -0.5 to the joint
      const lenB = 0.5 - (j + JOINT / 2);
      parts.push(kit.box([BOARD_W, BOARD_H, lenA], [x, BASE_H + BOARD_H / 2, -0.5 + lenA / 2], color));
      parts.push(kit.box([BOARD_W, BOARD_H, lenB], [x, BASE_H + BOARD_H / 2, 0.5 - lenB / 2], color));
    });
    return kit.finish(parts);
  },
};
