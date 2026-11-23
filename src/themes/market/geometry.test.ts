import { describeGeometrySnapshot } from '../geometry.test-helper';
import { market } from './index';

/** Every market item's built geometry against geometry.snapshot.json. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/market/geometry.test.ts`. */
describeGeometrySnapshot(market, new URL('./geometry.snapshot.json', import.meta.url));
