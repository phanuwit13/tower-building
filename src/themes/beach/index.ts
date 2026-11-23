import type { ThemeDef } from '../types';
import { items as c1 } from './batches/c1';
import { items as c2 } from './batches/c2';
import { items as c3 } from './batches/c3';
import { items as c4 } from './batches/c4';
import { items as c5 } from './batches/c5';
import { items as c6 } from './batches/c6';
import { items as c7 } from './batches/c7';
import { info } from './info';

/**
 * The Beach theme (ชายหาดทะเล). Order = rows of docs/game/items-beach.md: the doc lists the batches one
 * after another and each batch lists its items in doc order (its test checks).
 */
export const beach: ThemeDef = { ...info, items: [...c1, ...c2, ...c3, ...c4, ...c5, ...c6, ...c7] };
