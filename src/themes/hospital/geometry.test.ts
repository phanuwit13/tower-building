import { describeGeometrySnapshot } from '../geometry.test-helper';
import { hospital } from './index';

/** Every hospital item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/hospital/geometry.test.ts`. */
describeGeometrySnapshot(hospital, new URL('./geometry.snapshot.json', import.meta.url));
