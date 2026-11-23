import { describeGeometrySnapshot } from '../geometry.test-helper';
import { park } from './index';

/** Every park item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/park/geometry.test.ts`. */
describeGeometrySnapshot(park, new URL('./geometry.snapshot.json', import.meta.url));
