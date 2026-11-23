import { describeGeometrySnapshot } from '../geometry.test-helper';
import { beach } from './index';

/** Every beach item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/beach/geometry.test.ts`. */
describeGeometrySnapshot(beach, new URL('./geometry.snapshot.json', import.meta.url));
