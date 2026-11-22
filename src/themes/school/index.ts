import type { ThemeDef } from '../types';
import { item as assemblyHall } from './items/assembly-hall';
import { item as ballBasket } from './items/ball-basket';
import { item as bananaTree } from './items/banana-tree';
import { item as basketballCourt } from './items/basketball-court';
import { item as bellStand } from './items/bell-stand';
import { item as bench } from './items/bench';
import { item as bicycle } from './items/bicycle';
import { item as bikeRack } from './items/bike-rack';
import { item as busStop } from './items/bus-stop';
import { item as canteen } from './items/canteen';
import { item as chickenCoop } from './items/chicken-coop';
import { item as classroom } from './items/classroom';
import { item as coconutPalm } from './items/coconut-palm';
import { item as drinkingFountain } from './items/drinking-fountain';
import { item as fishPond } from './items/fish-pond';
import { item as flagpole } from './items/flagpole';
import { item as flowerGarden } from './items/flower-garden';
import { item as flowerPlanter } from './items/flower-planter';
import { item as footballPitch } from './items/football-pitch';
import { item as fruitCart } from './items/fruit-cart';
import { item as gardenShed } from './items/garden-shed';
import { item as globeStand } from './items/globe-stand';
import { item as greenhouse } from './items/greenhouse';
import { item as handwashTrough } from './items/handwash-trough';
import { item as hopscotch } from './items/hopscotch';
import { item as iceCreamCart } from './items/ice-cream-cart';
import { item as jungleGym } from './items/jungle-gym';
import { item as library } from './items/library';
import { item as merryGoRound } from './items/merry-go-round';
import { item as muralWall } from './items/mural-wall';
import { item as noodleStall } from './items/noodle-stall';
import { item as pavilion } from './items/pavilion';
import { item as sandpit } from './items/sandpit';
import { item as schoolBus } from './items/school-bus';
import { item as schoolCat } from './items/school-cat';
import { item as scienceLab } from './items/science-lab';
import { item as seesaw } from './items/seesaw';
import { item as signpost } from './items/signpost';
import { item as slide } from './items/slide';
import { item as stoneTable } from './items/stone-table';
import { item as streetLamp } from './items/street-lamp';
import { item as swimmingPool } from './items/swimming-pool';
import { item as swingSet } from './items/swing-set';
import { item as trashBins } from './items/trash-bins';
import { item as tree } from './items/tree';
import { item as tukTuk } from './items/tuk-tuk';
import { item as tyreHop } from './items/tyre-hop';
import { item as umbrellaTable } from './items/umbrella-table';
import { item as vegetableGarden } from './items/vegetable-garden';
import { item as waterTower } from './items/water-tower';

/** Order = rows of docs/game/items-school.md. */
export const school: ThemeDef = {
  id: 'school',
  name: 'โรงเรียน',
  emoji: '🏫',
  defaultGround: 'grass',
  items: [
    tree,
    streetLamp,
    flagpole,
    trashBins,
    drinkingFountain,
    bellStand,
    flowerPlanter,
    bananaTree,
    coconutPalm,
    schoolCat,
    bicycle,
    ballBasket,
    iceCreamCart,
    umbrellaTable,
    globeStand,
    signpost,
    bench,
    bikeRack,
    seesaw,
    slide,
    noodleStall,
    fruitCart,
    vegetableGarden,
    stoneTable,
    tukTuk,
    chickenCoop,
    handwashTrough,
    tyreHop,
    hopscotch,
    muralWall,
    swingSet,
    footballPitch,
    basketballCourt,
    pavilion,
    flowerGarden,
    fishPond,
    merryGoRound,
    jungleGym,
    sandpit,
    busStop,
    gardenShed,
    waterTower,
    classroom,
    library,
    canteen,
    schoolBus,
    assemblyHall,
    scienceLab,
    greenhouse,
    swimmingPool,
  ],
};
