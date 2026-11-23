import type { ThemeDef } from '../types';
import { items as v1 } from './batches/v1';
import { items as v2 } from './batches/v2';
import { items as v3 } from './batches/v3';
import { items as v4 } from './batches/v4';
import { items as v5 } from './batches/v5';
import { items as v6 } from './batches/v6';
import { items as v7 } from './batches/v7';
import { info } from './info';

/**
 * The Village theme (หมู่บ้าน). Order = rows of docs/game/items-village.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const village: ThemeDef = { ...info, items: [...v1, ...v2, ...v3, ...v4, ...v5, ...v6, ...v7] };
