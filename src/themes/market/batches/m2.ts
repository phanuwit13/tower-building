import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m2 (the Batch column of docs/game/items-market.md):
 * fresh-market, cinema, flower-shop, toy-store, newsstand, atm-kiosk, mailbox, fire-hydrant, a-frame-sign.
 * Owned by the m2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-2` on the dev server. Check: `npx vitest run src/themes/market/batches/m2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
