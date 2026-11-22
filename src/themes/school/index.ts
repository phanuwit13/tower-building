import type { ThemeDef } from '../types';
import { item as bench } from './items/bench';
import { item as classroom } from './items/classroom';
import { item as flagpole } from './items/flagpole';
import { item as streetLamp } from './items/street-lamp';
import { item as swingSet } from './items/swing-set';
import { item as tree } from './items/tree';

export const school: ThemeDef = {
  id: 'school',
  name: 'โรงเรียน',
  emoji: '🏫',
  defaultGround: 'grass',
  items: [tree, bench, streetLamp, flagpole, swingSet, classroom],
};
