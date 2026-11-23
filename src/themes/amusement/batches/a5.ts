import type { ItemModel } from '../../../models/contract';
import { item as showStage } from '../items/show-stage';
import { item as trainStation } from '../items/train-station';
import { item as splashPad } from '../items/splash-pad';
import { item as spiralSlide } from '../items/spiral-slide';
import { item as clawMachines } from '../items/claw-machines';
import { item as queueRails } from '../items/queue-rails';
import { item as miniTrain } from '../items/mini-train';
import { item as waterJet } from '../items/water-jet';
import { item as balloonPost } from '../items/balloon-post';

/**
 * Amusement batch a5 (the Batch column of docs/game/items-amusement.md):
 * show-stage, train-station, splash-pad, spiral-slide, claw-machines, queue-rails, mini-train, water-jet, balloon-post.
 * Owned by the a5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-5` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a5.test.ts`.
 */
export const items: readonly ItemModel[] = [showStage, trainStation, splashPad, spiralSlide, clawMachines, queueRails, miniTrain, waterJet, balloonPost];
