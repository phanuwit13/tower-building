import type { ThemeDef } from '../types';
import { items as m1 } from './batches/m1';
import { items as m2 } from './batches/m2';
import { items as m3 } from './batches/m3';
import { items as m4 } from './batches/m4';
import { items as m5 } from './batches/m5';
import { items as m6 } from './batches/m6';
import { items as m7 } from './batches/m7';
import { items as m8 } from './batches/m8';
import { info } from './info';

/**
 * The Shopping district theme (ย่านการค้า). Order = rows of docs/game/items-market.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const market: ThemeDef = { ...info, items: [...m1, ...m2, ...m3, ...m4, ...m5, ...m6, ...m7, ...m8] };
