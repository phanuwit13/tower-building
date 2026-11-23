import { describeGeometrySnapshot } from '../geometry.test-helper';
import { cafe } from './index';

/** Every cafe item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/cafe/geometry.test.ts`. */
describeGeometrySnapshot(cafe, new URL('./geometry.snapshot.json', import.meta.url));
