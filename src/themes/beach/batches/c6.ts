import type { ItemModel } from '../../../models/contract';
import { item as beach_hotel } from '../items/beach-hotel';
import { item as pirate_play_ship } from '../items/pirate-play-ship';
import { item as float_raft } from '../items/float-raft';
import { item as bonfire } from '../items/bonfire';
import { item as flamingo_float } from '../items/flamingo-float';
import { item as jet_ski } from '../items/jet-ski';
import { item as seagull_post } from '../items/seagull-post';
import { item as coconut_pile } from '../items/coconut-pile';
import { item as mini_umbrella } from '../items/mini-umbrella';

/**
 * Beach batch c6 (the Batch column of docs/game/items-beach.md):
 * beach-hotel, pirate-play-ship, float-raft, bonfire, flamingo-float, jet-ski, seagull-post, coconut-pile, mini-umbrella.
 * Owned by the c6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-6` on the dev server. Check: `npx vitest run src/themes/beach/batches/c6.test.ts`.
 */
export const items: readonly ItemModel[] = [beach_hotel, pirate_play_ship, float_raft, bonfire, flamingo_float, jet_ski, seagull_post, coconut_pile, mini_umbrella];
