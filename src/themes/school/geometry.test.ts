import { describeGeometrySnapshot } from '../geometry.test-helper';
import { school } from './index';

/**
 * Every School item's built geometry against geometry.snapshot.json (see describeGeometrySnapshot),
 * so a refactor of the shared part helpers can't silently change an approved look. Rewrite on
 * purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/school/geometry.test.ts`.
 */
describeGeometrySnapshot(school, new URL('./geometry.snapshot.json', import.meta.url));
