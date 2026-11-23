import { describeGeometrySnapshot } from '../geometry.test-helper';
import { village } from './index';

/** Every village item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/village/geometry.test.ts`. */
describeGeometrySnapshot(village, new URL('./geometry.snapshot.json', import.meta.url));
