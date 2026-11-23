import type { ThemeDef } from '../types';
import { items as t1 } from './batches/t1';
import { items as t2 } from './batches/t2';
import { items as t3 } from './batches/t3';
import { items as t4 } from './batches/t4';
import { items as t5 } from './batches/t5';
import { items as t6 } from './batches/t6';
import { items as t7 } from './batches/t7';
import { info } from './info';

/**
 * The Tokyo theme (เมืองโตเกียว). Order = rows of docs/game/items-tokyo.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const tokyo: ThemeDef = { ...info, items: [...t1, ...t2, ...t3, ...t4, ...t5, ...t6, ...t7] };
