import { describeGeometrySnapshot } from '../geometry.test-helper';
import { amusement } from './index';

/** Every amusement item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/amusement/geometry.test.ts`. */
describeGeometrySnapshot(amusement, new URL('./geometry.snapshot.json', import.meta.url));
