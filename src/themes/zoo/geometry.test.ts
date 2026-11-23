import { describeGeometrySnapshot } from '../geometry.test-helper';
import { zoo } from './index';

/** Every zoo item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/zoo/geometry.test.ts`. */
describeGeometrySnapshot(zoo, new URL('./geometry.snapshot.json', import.meta.url));
