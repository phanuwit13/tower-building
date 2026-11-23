import type { ThemeDef } from '../types';
import { items as p1 } from './batches/p1';
import { items as p2 } from './batches/p2';
import { items as p3 } from './batches/p3';
import { items as p4 } from './batches/p4';
import { items as p5 } from './batches/p5';
import { items as p6 } from './batches/p6';
import { items as p7 } from './batches/p7';
import { info } from './info';

/**
 * The Park theme (สวนสาธารณะ). Order = rows of docs/game/items-park.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const park: ThemeDef = { ...info, items: [...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7] };
