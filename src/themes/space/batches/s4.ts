import type { ItemModel } from '../../../models/contract';
import { item as roverGarage } from '../items/rover-garage';
import { item as cargoLander } from '../items/cargo-lander';
import { item as moonRover } from '../items/moon-rover';
import { item as moonBuggy } from '../items/moon-buggy';
import { item as hoverSled } from '../items/hover-sled';
import { item as dronePad } from '../items/drone-pad';
import { item as cargoRobot } from '../items/cargo-robot';
import { item as roverCharger } from '../items/rover-charger';
import { item as robotDog } from '../items/robot-dog';

/**
 * Space batch s4 (the Batch column of docs/game/items-space.md):
 * rover-garage, cargo-lander, moon-rover, moon-buggy, hover-sled, drone-pad, cargo-robot, rover-charger, robot-dog.
 * Owned by the s4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-4` on the dev server. Check: `npx vitest run src/themes/space/batches/s4.test.ts`.
 */
export const items: readonly ItemModel[] = [roverGarage, cargoLander, moonRover, moonBuggy, hoverSled, dronePad, cargoRobot, roverCharger, robotDog];
