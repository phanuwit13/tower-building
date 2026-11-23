# Café theme (ร้านคาเฟ่): item list

The full list of café items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`CAFE_MIX`, the zoo and beach mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/cafe/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/cafe/batches/kN.ts`, k = kafe).

## The room (owner chose "ก", 2026-11-24)
The café is a room seen from above: the 20 × 20 map is its floor. The room itself is built in, not items:
- **Low walls round the whole map**, just outside the grid (they never take a cell): a solid base about knee high, glass panes above it in window frames, a **glass door** on the +x side (the side the camera sees) with an awning, a step and a mat outside.
- **A pavement outside** (the land round the map), whatever floor the player picks inside.
- **Rain falls only outside** the walls; the floor inside stays dry.
- The default floor is **wood**; floor tiles work as on every map.
- **A bright, warm night** (`nightGlow`), like a lit café seen in the evening.

Items are furniture and things *inside* the café: no buildings, no roofs over the whole item, no outdoor street furniture.

**Indoors there is no wind**: no sway or wave. Animation key: **window** (lit displays, fridges), **breathe** (lamps, candles, stove), **water** (`pond`: aquarium, fish bowl), **swing** (rocking chair, hanging chairs, pendulum), **spin** (roaster arm, toy train), **blink** (jukebox), **chase** (string lights).

## Content rules
A friendly family café for kids. No people; no alcohol, no bar imagery (drinks are coffee, tea, juice, smoothies, milk); signs and menus are pictures and colour blocks, never text; pets are friendly cartoons; no religious or royal imagery (no shrine, no spirit house); no copyrighted characters or real brands.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `barista-counter` | บาร์ชงกาแฟ | 2×3 | food | k1 | breathe | long wooden counter with an espresso machine, grinder, cups; three pendant lamps on a rail held by two posts |
| 2 | `cake-display` | ตู้เค้กโชว์ | 2×3 | food | k1 | window | long glass display on a wooden base, three shelves of cakes and tarts, lit inside |
| 3 | `round-table-four` | โต๊ะกลมสี่ที่นั่ง | 2×2 | seating | k1 | — | round table with four chairs, two cups and a small vase |
| 4 | `cashier-counter` | เคาน์เตอร์คิดเงิน | 2×2 | facility | k1 | — | short counter with a cash register, a bell, a tip jar and a picture menu stand |
| 5 | `table-for-two` | โต๊ะสองที่นั่ง | 1×2 | seating | k1 | — | small square table with two chairs facing each other, a cake and a cup |
| 6 | `cushion-bench` | ม้านั่งยาวมีเบาะ | 1×2 | seating | k1 | — | long wooden bench with colourful cushions |
| 7 | `coffee-cart` | รถเข็นกาแฟ | 1×2 | food | k1 | — | wooden cart with a small espresso machine and a striped canopy |
| 8 | `stool` | เก้าอี้สตูล | 1×1 | seating | k1 | — | round wooden stool with a cushion |
| 9 | `potted-plant` | ต้นไม้กระถาง | 1×1 | nature | k1 | — | monstera with big split leaves in a white pot |
| 10 | `sofa-lounge` | มุมโซฟาตัวแอล | 2×3 | seating | k2 | breathe | L-shaped sofa, coffee table, round rug and a floor lamp |
| 11 | `book-nook` | มุมหนังสือ | 2×3 | decoration | k2 | — | tall bookshelf with a reading bench, cushions and a small ladder |
| 12 | `armchairs-pair` | อาร์มแชร์คู่ | 2×2 | seating | k2 | breathe | two armchairs, a side table and a table lamp |
| 13 | `board-game-table` | โต๊ะบอร์ดเกม | 2×2 | play | k2 | — | table with a game board, dice and two stools, a box shelf beside |
| 14 | `bookshelf` | ชั้นหนังสือ | 1×2 | decoration | k2 | — | tall shelf of colourful books with a plant on top |
| 15 | `loveseat` | โซฟาสองที่นั่ง | 1×2 | seating | k2 | — | small sofa with two cushions |
| 16 | `floor-lamp` | โคมไฟตั้งพื้น | 1×1 | decoration | k2 | breathe | tall lamp with a fabric shade |
| 17 | `rocking-chair` | เก้าอี้โยก | 1×1 | seating | k2 | swing | wooden rocking chair with a blanket; rocks gently |
| 18 | `vase-table` | โต๊ะดอกไม้ | 1×1 | decoration | k2 | — | small round table with a vase of flowers |
| 19 | `kids-corner` | มุมเด็กเล่น | 2×3 | play | k3 | — | soft play mat, a small slide, a ball pit and soft blocks |
| 20 | `kids-drawing-table` | โต๊ะระบายสีเด็ก | 2×2 | play | k3 | — | low table, four small chairs, crayons and drawings |
| 21 | `hanging-chairs` | เก้าอี้รังนกแขวน | 2×2 | seating | k3 | swing | two rattan egg chairs hanging from stands; they swing gently |
| 22 | `bean-bags` | บีนแบ็กคู่ | 1×2 | seating | k3 | — | two big round bean bags on a rug |
| 23 | `toy-train` | รถไฟของเล่น | 1×2 | play | k3 | spin | round toy track on a low table, a little train going round |
| 24 | `dessert-cart` | รถเข็นขนมหวาน | 1×2 | food | k3 | — | pastel cart with macarons, cupcakes and jars of candy |
| 25 | `high-chair` | เก้าอี้เด็กเล็ก | 1×1 | seating | k3 | — | tall baby chair with a tray |
| 26 | `gumball-machine` | ตู้ลูกอมหยอดเหรียญ | 1×1 | play | k3 | — | red stand with a glass globe of colourful gumballs |
| 27 | `birthday-cake` | เค้กวันเกิด | 1×1 | food | k3 | breathe | big cake on a stand with candles that glow |
| 28 | `open-kitchen` | ครัวเปิด | 2×3 | food | k4 | breathe | steel counter with a stove, pots, a hood and shelves of plates; the burners glow |
| 29 | `bread-shelf` | ชั้นขนมปัง | 2×2 | food | k4 | — | wooden shelves with baskets of bread, croissants and baguettes |
| 30 | `smoothie-bar` | บาร์น้ำปั่น | 2×2 | food | k4 | — | counter with blenders, cups and a pile of fruit |
| 31 | `donut-shelf` | ชั้นโดนัท | 1×2 | food | k4 | — | tiered rack of colourful donuts |
| 32 | `tea-party-table` | โต๊ะน้ำชา | 1×2 | food | k4 | — | table with a teapot, cups and a three-tier cake stand |
| 33 | `condiment-station` | จุดเติมน้ำตาลและหลอด | 1×2 | facility | k4 | — | small counter with sugar, milk jugs, napkins and straws |
| 34 | `coffee-sacks` | กระสอบเมล็ดกาแฟ | 1×1 | decoration | k4 | — | stacked burlap sacks with coffee beans spilling out |
| 35 | `water-dispenser` | ตู้กดน้ำดื่ม | 1×1 | facility | k4 | — | water dispenser with a blue bottle and glasses |
| 36 | `hand-sink` | อ่างล้างมือ | 1×1 | facility | k4 | — | small sink with a soap pump and a towel |
| 37 | `aquarium-wall` | ตู้ปลาใหญ่ | 2×3 | animal | k5 | water, window | long fish tank on a cabinet with fish, plants and bubbles, lit inside |
| 38 | `booth-seats` | ที่นั่งบูธ | 2×3 | seating | k5 | — | two booth benches facing each other, a table between and a plant divider |
| 39 | `drinks-fridge` | ตู้แช่เครื่องดื่ม | 2×2 | food | k5 | window | glass-door fridge with juice, milk and water bottles, lit inside |
| 40 | `ice-cream-freezer` | ตู้ไอศกรีมตัก | 2×2 | food | k5 | window | scoop freezer with colourful tubs and a cone stack |
| 41 | `high-table-stools` | โต๊ะสูงกับเก้าอี้บาร์ | 1×2 | seating | k5 | — | high narrow table with two tall stools |
| 42 | `bin-trio` | ถังขยะแยกประเภท | 1×2 | facility | k5 | — | three bins in three colours with picture lids |
| 43 | `fish-bowl` | โหลปลาทอง | 1×1 | animal | k5 | water | goldfish bowl on a little stand |
| 44 | `menu-easel` | ป้ายเมนูขาตั้ง | 1×1 | decoration | k5 | — | A-frame board with cup, cake and juice pictures (no text) |
| 45 | `music-corner` | มุมดนตรี | 2×3 | decoration | k6 | chase | low stage with a guitar, a cajón drum, a speaker and string lights |
| 46 | `coffee-roaster` | เครื่องคั่วกาแฟ | 2×2 | facility | k6 | spin | copper drum roaster with a round cooling tray; the stirring arm turns |
| 47 | `flower-wall` | มุมถ่ายรูปกำแพงดอกไม้ | 2×2 | decoration | k6 | — | free-standing flower wall arch with a bench in front |
| 48 | `piano` | เปียโน | 1×2 | decoration | k6 | — | upright piano with a stool |
| 49 | `bicycle-display` | จักรยานวินเทจ | 1×2 | decoration | k6 | — | vintage bicycle with a flower basket on a stand |
| 50 | `jukebox` | ตู้เพลง | 1×1 | decoration | k6 | blink | rounded jukebox with coloured lights |
| 51 | `grandfather-clock` | นาฬิกาตั้งพื้น | 1×1 | decoration | k6 | swing | tall wooden clock; the pendulum swings |
| 52 | `coat-rack` | ราวแขวนเสื้อ | 1×1 | facility | k6 | — | coat stand with a hat, a scarf and an umbrella |
| 53 | `long-table` | โต๊ะยาวสำหรับครอบครัว | 2×3 | seating | k7 | — | long table with six chairs and a row of small plants |
| 54 | `cat-tower` | คอนโดแมว | 2×2 | animal | k7 | — | cat tree with platforms, a scratching post and two cats |
| 55 | `restrooms` | ห้องน้ำ | 2×2 | facility | k7 | — | small block with two doors with picture signs (no text) |
| 56 | `plant-ladder` | ชั้นบันไดต้นไม้ | 1×2 | nature | k7 | — | ladder shelf with small pots and hanging vines |
| 57 | `planter-box` | กระบะต้นไม้ยาว | 1×2 | nature | k7 | — | long wooden planter with herbs and flowers |
| 58 | `cactus-trio` | กระบองเพชรสามกระถาง | 1×1 | nature | k7 | — | three small cacti in colourful pots |
| 59 | `cat-basket` | แมวนอนในตะกร้า | 1×1 | animal | k7 | — | basket with a curled-up sleeping cat |
| 60 | `dog-bed` | สุนัขบนเบาะ | 1×1 | animal | k7 | — | round pet bed with a friendly little dog |
