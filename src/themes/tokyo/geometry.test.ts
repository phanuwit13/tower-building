import { describeGeometrySnapshot } from '../geometry.test-helper';
import { tokyo } from './index';

/** Every tokyo item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/tokyo/geometry.test.ts`. */
describeGeometrySnapshot(tokyo, new URL('./geometry.snapshot.json', import.meta.url));
