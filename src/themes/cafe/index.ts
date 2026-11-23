import type { ThemeDef } from '../types';
import { items as k1 } from './batches/k1';
import { items as k2 } from './batches/k2';
import { items as k3 } from './batches/k3';
import { items as k4 } from './batches/k4';
import { items as k5 } from './batches/k5';
import { items as k6 } from './batches/k6';
import { items as k7 } from './batches/k7';
import { info } from './info';

/**
 * The Café theme (ร้านคาเฟ่). Order = rows of docs/game/items-cafe.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const cafe: ThemeDef = { ...info, items: [...k1, ...k2, ...k3, ...k4, ...k5, ...k6, ...k7] };
