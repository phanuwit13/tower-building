import type { ThemeDef } from '../types';
import { items as h1 } from './batches/h1';
import { items as h2 } from './batches/h2';
import { items as h3 } from './batches/h3';
import { items as h4 } from './batches/h4';
import { items as h5 } from './batches/h5';
import { items as h6 } from './batches/h6';
import { items as h7 } from './batches/h7';
import { info } from './info';

/**
 * The Hospital theme (โรงพยาบาล). Order = rows of docs/game/items-hospital.md: the doc lists the
 * batches one after another and each batch lists its items in doc order (its test checks).
 */
export const hospital: ThemeDef = { ...info, items: [...h1, ...h2, ...h3, ...h4, ...h5, ...h6, ...h7] };
