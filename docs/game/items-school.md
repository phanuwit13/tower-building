# School theme: item list

The full list of School items (50), built from `DEFAULT_MIX` in `src/themes/mix.ts`:
**16 × 1×1, 14 × 1×2, 12 × 2×2, 8 × 2×3** (no 3×2 or 2×1; rotation-normalised the counts are exactly the mix).
The mix was tuned by simulation on the 20 × 20 map (`src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/school/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first. The "Exists" column marks the six approved style-lock items, which are already built; do not rebuild them.

| # | id | Thai name | Footprint | Category | Exists | Description (what it looks like, key parts) |
|---|---|---|---|---|---|---|
| 1 | `tree` | ต้นไม้ | 1×1 | nature | yes | round cartoon tree: brown trunk, crown of overlapping green spheres |
| 2 | `street-lamp` | เสาไฟ | 1×1 | decoration | yes | navy lamp post about 1.7 tall with a warm glowing globe on top |
| 3 | `flagpole` | เสาธง | 1×1 | decoration | yes | tall white pole 2.5 with the Thai flag at full mast on a small stone base |
| 4 | `trash-bins` | ถังขยะแยกประเภท | 1×1 | facility | no | three small bins side by side (green, yellow, blue) with flip lids on a stone pad |
| 5 | `drinking-fountain` | ตู้น้ำดื่ม | 1×1 | facility | no | drinking fountain: stone pillar 0.9 tall, round basin on top, two chrome spouts |
| 6 | `bell-stand` | ระฆังโรงเรียน | 1×1 | decoration | no | two plain wooden posts with a crossbeam holding a brass school bell and a short pull rope |
| 7 | `flower-planter` | กระถางดอกไม้ | 1×1 | nature | no | big terracotta pot with a mound of pink, yellow and purple flowers and green leaves |
| 8 | `banana-tree` | ต้นกล้วย | 1×1 | nature | no | short thick trunk with four long drooping green leaves and a small yellow banana bunch |
| 9 | `coconut-palm` | ต้นมะพร้าว | 1×1 | nature | no | slim curved trunk with a star of long fronds and three brown coconuts under the crown |
| 10 | `school-cat` | แมวโรงเรียน | 1×1 | animal | no | chunky orange cat sitting on a small cushion, round head, triangle ears, curled tail |
| 11 | `bicycle` | จักรยาน | 1×1 | vehicle | no | child bicycle parked on its stand: two wheels, red frame, handlebars, a basket in front |
| 12 | `ball-basket` | ตะกร้าลูกบอล | 1×1 | play | no | wooden crate on a stone pad filled with a football, a basketball and a volleyball |
| 13 | `ice-cream-cart` | รถเข็นไอศกรีม | 1×1 | food | no | ice-cream tricycle: pink and white freezer box on three wheels, striped umbrella, a big cone on the front |
| 14 | `umbrella-table` | โต๊ะร่ม | 1×1 | seating | no | round wooden table with two stools and a blue and white parasol over it |
| 15 | `globe-stand` | ลูกโลก | 1×1 | decoration | no | big blue and green globe tilted in a wooden ring frame on a round base |
| 16 | `signpost` | ป้ายบอกทาง | 1×1 | decoration | no | wooden post with three arrow boards pointing different ways, each a different colour |
| 17 | `bench` | ม้านั่ง | 1×2 | seating | yes | wooden slat bench with charcoal frame, seat 0.31 high with a backrest |
| 18 | `bike-rack` | ที่จอดจักรยาน | 1×2 | facility | no | low steel rack: a row of six bare blue loops set in a stone strip (no bicycles) |
| 19 | `seesaw` | กระดานหก | 1×2 | play | no | long yellow plank on a central blue pivot, a handle bar and a seat at each end |
| 20 | `slide` | สไลเดอร์ | 1×2 | play | no | short red slide: blue ladder and small platform at one end, curved ramp to the ground |
| 21 | `noodle-stall` | ร้านก๋วยเตี๋ยว | 1×2 | food | no | canteen stall: wooden counter, red-striped awning, steaming pot and a stack of bowls |
| 22 | `fruit-cart` | รถเข็นผลไม้ | 1×2 | food | no | flat wooden handcart with two big wheels and a green canopy, trays of oranges and watermelon slices |
| 23 | `vegetable-garden` | แปลงผัก | 1×2 | nature | no | raised soil bed in a wood frame with rows of green cabbages and orange carrots |
| 24 | `stone-table` | โต๊ะหินนั่งเล่น | 1×2 | seating | no | long grey stone table with two stone bench seats, a chess board pattern on top |
| 25 | `tuk-tuk` | ตุ๊กตุ๊ก | 1×2 | vehicle | no | three-wheeled yellow and green tuk-tuk with a canopy, round headlight and open sides |
| 26 | `chicken-coop` | เล้าไก่ | 1×2 | animal | no | small wooden coop with a red roof and ramp, two white hens and a feeder (school farm project) |
| 27 | `handwash-trough` | รางล้างมือ | 1×2 | facility | no | long steel trough on legs with four chrome taps and a bar of pink soap on a dish |
| 28 | `tyre-hop` | ยางกระโดด | 1×2 | play | no | six half-buried tyres in a zig-zag row, painted red, blue, yellow and green |
| 29 | `hopscotch` | ตารางกระโดดขาเดียว | 1×2 | play | no | flat concrete strip painted with numbered-looking squares in a one-two-one pattern, red, yellow and blue, with a small stone marker |
| 30 | `mural-wall` | กำแพงภาพวาด | 1×2 | decoration | no | low cream wall about 0.9 tall with a cheerful painted scene: sun, hills, a rainbow and child figures, capped with a stone coping |
| 31 | `swing-set` | ชิงช้า | 2×2 | play | yes | A-frame swing set with two seats over a sandpit base |
| 32 | `football-pitch` | สนามฟุตบอลเล็ก | 2×2 | play | no | mini pitch: green turf with white lines and centre circle, a white goal with net at each end |
| 33 | `basketball-court` | สนามบาสเกตบอล | 2×2 | play | no | orange court slab with white lines and a hoop on a pole with backboard at one end |
| 34 | `pavilion` | ศาลาพักร้อน | 2×2 | building | no | plain open rest sala: four wooden posts, a bench rail on two sides and a simple single-pitch red roof (no tiers, no ornaments) |
| 35 | `flower-garden` | สวนดอกไม้ | 2×2 | nature | no | stone-edged round flowerbed with concentric rings of pink, yellow and purple flowers |
| 36 | `fish-pond` | บ่อบัว | 2×2 | nature | no | stone-rimmed pond of sky-blue water with green lily pads and a few plain white and pink water-lily flowers |
| 37 | `merry-go-round` | ม้าหมุน | 2×2 | ride | no | round platform with a central post, four colourful handles and seats, a small cone top |
| 38 | `jungle-gym` | โครงปีนเล่น | 2×2 | play | no | cubic climbing frame of teal bars with a net side, a rope ladder and a small yellow roof platform |
| 39 | `sandpit` | บ่อทราย | 2×2 | play | no | square wooden-edged sandpit with a bucket, a spade, a sand castle and a small ride-on digger toy |
| 40 | `bus-stop` | ศาลาที่พักผู้โดยสาร | 2×2 | facility | no | bus stop shelter: blue roof on steel posts, a back panel, a bench, and a round route sign on a pole |
| 41 | `garden-shed` | โรงเก็บเครื่องมือ | 2×2 | building | no | small green timber shed with a red door, a window, a pitched roof and a wheelbarrow and watering can beside it |
| 42 | `water-tower` | ถังเก็บน้ำ | 2×2 | facility | no | round blue water tank on four tall steel legs with a ladder and a conical lid |
| 43 | `classroom` | อาคารเรียน | 2×3 | building | yes | two-bay classroom building with gable roof, windows on all sides and a clock tower on the front |
| 44 | `library` | ห้องสมุด | 2×3 | building | no | single storey library: cream walls with a blue roof, tall windows, and a book-shaped sign over the door |
| 45 | `canteen` | โรงอาหาร | 2×3 | food | no | open-sided canteen hall: tall red roof on posts, long tables with stools, a serving counter at the back |
| 46 | `school-bus` | รถรับส่งนักเรียน | 2×3 | vehicle | no | long yellow school bus, rounded roof, row of windows, wheels, a black stripe, door on +x |
| 47 | `assembly-hall` | หอประชุม | 2×3 | building | no | wide hall with a tall curved roof, a front porch with four columns and a stage-curtain window in red |
| 48 | `science-lab` | ห้องวิทยาศาสตร์ | 2×3 | building | no | mint-walled building with a flat roof, big windows and a giant flask and atom-ring sign on the roof front |
| 49 | `greenhouse` | โรงเรือนปลูกผัก | 2×3 | nature | no | glass-walled greenhouse with a pitched glass roof, a door at the front and rows of green plants visible inside |
| 50 | `swimming-pool` | สระว่ายน้ำ | 2×3 | facility | no | rectangular sky-blue pool in a stone surround with a small ladder, two lane ropes and a ring buoy |

## Counts

| Footprint | Count | Existing | New |
|---|---|---|---|
| 1×1 | 16 | 3 | 13 |
| 1×2 | 14 | 1 | 13 |
| 2×2 | 12 | 1 | 11 |
| 2×3 | 8 | 1 | 7 |
| **Total** | **50** | **6** | **44** |

| Category | Count |
|---|---|
| building | 6 |
| nature | 8 |
| seating | 3 |
| food | 4 |
| play | 10 |
| ride | 1 |
| animal | 2 |
| vehicle | 3 |
| decoration | 6 |
| facility | 7 |
