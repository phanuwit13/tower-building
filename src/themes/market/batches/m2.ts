import type { ItemModel } from '../../../models/contract';
import { item as freshMarket } from '../items/fresh-market';
import { item as cinema } from '../items/cinema';
import { item as flowerShop } from '../items/flower-shop';
import { item as toyStore } from '../items/toy-store';
import { item as newsstand } from '../items/newsstand';
import { item as atmKiosk } from '../items/atm-kiosk';
import { item as mailbox } from '../items/mailbox';
import { item as fireHydrant } from '../items/fire-hydrant';
import { item as aFrameSign } from '../items/a-frame-sign';

/**
 * Market batch m2 (the Batch column of docs/game/items-market.md):
 * fresh-market, cinema, flower-shop, toy-store, newsstand, atm-kiosk, mailbox, fire-hydrant, a-frame-sign.
 * Owned by the m2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-2` on the dev server. Check: `npx vitest run src/themes/market/batches/m2.test.ts`.
 */
export const items: readonly ItemModel[] = [
  freshMarket,
  cinema,
  flowerShop,
  toyStore,
  newsstand,
  atmKiosk,
  mailbox,
  fireHydrant,
  aFrameSign,
];
