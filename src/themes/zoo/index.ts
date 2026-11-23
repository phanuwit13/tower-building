import type { ThemeDef } from '../types';
import { items as z1 } from './batches/z1';
import { items as z2 } from './batches/z2';
import { items as z3 } from './batches/z3';
import { items as z4 } from './batches/z4';
import { items as z5 } from './batches/z5';
import { items as z6 } from './batches/z6';
import { items as z7 } from './batches/z7';
import { info } from './info';

/**
 * The Zoo theme (สวนสัตว์). Order = rows of docs/game/items-zoo.md: the doc lists the batches one
 * after another and each batch lists its items in doc order (its test checks).
 * Not in THEMES (src/themes/registry.ts) until all batches are built.
 */
export const zoo: ThemeDef = { ...info, items: [...z1, ...z2, ...z3, ...z4, ...z5, ...z6, ...z7] };
