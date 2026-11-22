# School theme: item list

The full list of School items (40), built from `DEFAULT_MIX` in `src/themes/mix.ts`:
**16 × 1×1, 12 × 1×2, 8 × 2×2, 4 × 2×3** (no 3×2 or 2×1; rotation-normalised the counts are exactly the mix).
The mix was tuned by simulation (`src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/school/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first. The "Exists" column marks the six approved style-lock items, which are already built; do not rebuild them.

| # | id | Thai name | Footprint | Category | Exists | Description (what it looks like, key parts) |
|---|---|---|---|---|---|---|
| 1 | `tree` | ต้นไม้ | 1×1 | nature | yes | round cartoon tree: brown trunk, crown of overlapping green spheres |
| 2 | `street-lamp` | เสาไฟ | 1×1 | decoration | yes | navy lamp post about 1.7 tall with a warm glowing globe on top |
| 3 | `flagpole` | เสาธง | 1×1 | decoration | yes | tall white pole 2.5 with the Thai flag at full mast on a small stone base |
| 4 | `trash-bins` | ถังขยะแยกประเภท | 1×1 | facility | no | three small bins side by side (green, yellow, blue) with flip lids on a stone pad |
| 5 | `drinking-fountain` | ตู้น้ำดื่ม | 1×1 | facility | no | drinking fountain: stone pillar 0.9 tall, round basin on top, two chrome spouts |
| 6 | `bell-stand` | ระฆังโรงเรียน | 1×1 | decoration | no | two wooden posts with a crossbeam holding a gold bell and a small striker rope |
| 7 | `flower-planter` | กระถางดอกไม้ | 1×1 | nature | no | big terracotta pot with a mound of pink, yellow and purple flowers and green leaves |
| 8 | `banana-tree` | ต้นกล้วย | 1×1 | nature | no | short thick trunk with four long drooping green leaves and a small yellow banana bunch |
| 9 | `coconut-palm` | ต้นมะพร้าว | 1×1 | nature | no | slim curved trunk with a star of long fronds and three brown coconuts under the crown |
| 10 | `school-cat` | แมวโรงเรียน | 1×1 | animal | no | chunky orange cat sitting on a small cushion, round head, triangle ears, curled tail |
| 11 | `bicycle` | จักรยาน | 1×1 | vehicle | no | child bicycle parked on its stand: two wheels, red frame, handlebars, a basket in front |
| 12 | `ball-basket` | ตะกร้าลูกบอล | 1×1 | play | no | wooden crate on a stone pad filled with a football, a basketball and a volleyball |
| 13 | `ice-cream-cart` | รถเข็นไอศกรีม | 1×1 | food | no | pink and white pushcart with a striped umbrella, two wheels and a big cone on the front |
| 14 | `umbrella-table` | โต๊ะร่ม | 1×1 | seating | no | round wooden table with two stools and a blue and white parasol over it |
| 15 | `globe-stand` | ลูกโลก | 1×1 | decoration | no | big blue and green globe tilted in a wooden ring frame on a round base |
| 16 | `signpost` | ป้ายบอกทาง | 1×1 | decoration | no | wooden post with three arrow boards pointing different ways, each a different colour |
| 17 | `bench` | ม้านั่ง | 1×2 | seating | yes | wooden slat bench with charcoal frame, seat 0.31 high with a backrest |
| 18 | `bike-rack` | ที่จอดจักรยาน | 1×2 | vehicle | no | low steel rack with a row of loops and two small parked bicycles in different colours |
| 19 | `seesaw` | กระดานหก | 1×2 | play | no | long yellow plank on a central blue pivot, a handle bar and a seat at each end |
| 20 | `slide` | สไลเดอร์ | 1×2 | play | no | short red slide: blue ladder and small platform at one end, curved ramp to the ground |
| 21 | `noodle-stall` | ร้านก๋วยเตี๋ยว | 1×2 | food | no | canteen stall: wooden counter, red-striped awning, steaming pot and a stack of bowls |
| 22 | `fruit-cart` | รถเข็นผลไม้ | 1×2 | food | no | wooden pushcart with a green canopy, trays of oranges, watermelon slices and mangoes |
| 23 | `vegetable-garden` | แปลงผัก | 1×2 | nature | no | raised soil bed in a wood frame with rows of green cabbages, orange carrots and a small scarecrow stick |
| 24 | `stone-table` | โต๊ะหินอ่อนนั่งเล่น | 1×2 | seating | no | long grey concrete table with two concrete bench seats, chess board pattern on top |
| 25 | `tuk-tuk` | ตุ๊กตุ๊ก | 1×2 | vehicle | no | three-wheeled yellow and green tuk-tuk with a canopy, round headlight and open sides |
| 26 | `chicken-coop` | เล้าไก่ | 1×2 | animal | no | small wooden coop with a red roof and ramp, two white hens and a feeder (school farm project) |
| 27 | `handwash-trough` | รางล้างมือ | 1×2 | facility | no | long steel trough on legs with four chrome taps and a bar of pink soap on a dish |
| 28 | `tyre-hop` | ยางกระโดด | 1×2 | play | no | six half-buried tyres in a zig-zag row, painted red, blue, yellow and green |
| 29 | `swing-set` | ชิงช้า | 2×2 | play | yes | A-frame swing set with two seats over a sandpit base |
| 30 | `football-pitch` | สนามฟุตบอลเล็ก | 2×2 | play | no | mini pitch: green turf with white lines and centre circle, a white goal with net at each end |
| 31 | `basketball-court` | สนามบาสเกตบอล | 2×2 | play | no | orange court slab with white lines and a hoop on a pole with backboard at one end |
| 32 | `pavilion` | ศาลาพักร้อน | 2×2 | building | no | open Thai-style rest pavilion: four wooden posts, low bench rail, a red tiered roof with a gold finial |
| 33 | `flower-garden` | สวนดอกไม้ | 2×2 | nature | no | stone-edged round flowerbed with concentric rings of pink, yellow and purple flowers and a tiny path |
| 34 | `fish-pond` | บ่อปลา | 2×2 | nature | no | stone-rimmed pond of sky-blue water, lily pads with pink lotus buds, two orange carp, small wooden plank bridge |
| 35 | `merry-go-round` | ม้าหมุน | 2×2 | ride | no | round platform with a central post, four colourful handles and seats, a small cone top |
| 36 | `jungle-gym` | โครงปีนเล่น | 2×2 | play | no | cubic climbing frame of teal bars with a net side, a rope ladder and a small yellow roof platform |
| 37 | `classroom` | อาคารเรียน | 2×3 | building | yes | two-bay classroom building with gable roof, windows on all sides and a clock tower on the front |
| 38 | `library` | ห้องสมุด | 2×3 | building | no | single storey library: cream walls, tall arched-style windows, a blue roof, a round book sign over the door and a book-stack porch |
| 39 | `canteen` | โรงอาหาร | 2×3 | food | no | open-sided canteen hall: tall red roof on posts, three long tables with stools and a serving counter at the back |
| 40 | `school-bus` | รถรับส่งนักเรียน | 2×3 | vehicle | no | long yellow school bus, rounded roof, row of windows, wheels, a flashing-light bar and a black stripe, door on +x |

## Counts

| Footprint | Count | Existing | New |
|---|---|---|---|
| 1×1 | 16 | 3 | 13 |
| 1×2 | 12 | 1 | 11 |
| 2×2 | 8 | 1 | 7 |
| 2×3 | 4 | 1 | 3 |
| **Total** | **40** | **6** | **34** |

| Category | Count |
|---|---|
| building | 3 |
| nature | 7 |
| seating | 3 |
| food | 4 |
| play | 8 |
| ride | 1 |
| animal | 2 |
| vehicle | 4 |
| decoration | 5 |
| facility | 3 |
