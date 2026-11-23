import type { ThemeDef } from '../types';
import { items as a1 } from './batches/a1';
import { items as a2 } from './batches/a2';
import { items as a3 } from './batches/a3';
import { items as a4 } from './batches/a4';
import { items as a5 } from './batches/a5';
import { items as a6 } from './batches/a6';
import { info } from './info';

/**
 * The Amusement park theme (สวนสนุก). Order = rows of docs/game/items-amusement.md: the doc lists
 * the batches one after another and each batch lists its items in doc order (its test checks).
 * Not in THEMES yet: it is registered once every batch is built.
 */
export const amusement: ThemeDef = { ...info, items: [...a1, ...a2, ...a3, ...a4, ...a5, ...a6] };
