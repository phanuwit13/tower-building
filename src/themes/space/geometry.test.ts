import { describeGeometrySnapshot } from '../geometry.test-helper';
import { space } from './index';

/** Every space item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/space/geometry.test.ts`. */
describeGeometrySnapshot(space, new URL('./geometry.snapshot.json', import.meta.url));
