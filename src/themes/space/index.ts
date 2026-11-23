import type { ThemeDef } from '../types';
import { items as s1 } from './batches/s1';
import { items as s2 } from './batches/s2';
import { items as s3 } from './batches/s3';
import { items as s4 } from './batches/s4';
import { items as s5 } from './batches/s5';
import { items as s6 } from './batches/s6';
import { items as s7 } from './batches/s7';
import { info } from './info';

/**
 * The Space theme (อวกาศ). Order = rows of docs/game/items-space.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const space: ThemeDef = { ...info, items: [...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7] };
