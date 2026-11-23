import itemsMarkdown from '../../../../docs/game/items-school.md?raw';
import type { ItemModel } from '../../../models/contract';
import type { StyleKit } from '../../../models/kit';
import { itemDoc, validateBatch as validateAgainstDoc } from '../../batchHelper';

/** docs/game/items-school.md, parsed. */
export const SCHOOL_DOC = itemDoc('docs/game/items-school.md', itemsMarkdown);

/** Check one batch of School items against docs/game/items-school.md (see validateBatch in src/themes/batchHelper.ts). */
export function validateBatch(items: readonly ItemModel[], kit: StyleKit, assigned: readonly string[]): string[] {
  return validateAgainstDoc(items, kit, assigned, SCHOOL_DOC);
}
