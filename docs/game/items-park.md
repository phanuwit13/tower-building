# Park theme (สวนสาธารณะ): item list

The full list of park items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`PARK_MIX`, the shared mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/park/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/park/batches/pN.ts`).

## The park
The park: a big city park like the ones in Bangkok — a lake with swan boats, fountains, playgrounds, sports courts, gardens, shade trees, picnic lawns, a stage. Default ground grass (the floor tiles give paths). Night is the standard night, lit by park lamps, the stage, kiosks and the greenhouse.

Animation key: **sway** (trees, flowers, balloons), **water** (`pond`), **swing** (swings, seesaw, spring riders), **spin** (sprinkler, flower-clock hands, kinetic sculpture), lights **window** / **breathe** / **chase**.

Content rules: no people; no statues of people, no monuments, no royal imagery; nothing religious (no shrine, no Chinese god statue, no sacred tree with cloth); no alcohol; no real brands; signs and maps are pictures and arrows, never text; animals are friendly cartoons.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `swan-boat-lake` | ทะเลสาบเรือเป็ดถีบ | 2×3 | ride | p1 | water | lake corner with a little jetty and three swan-shaped pedal boats |
| 2 | `fountain-plaza` | ลานน้ำพุ | 2×3 | decoration | p1 | water | round tiered fountain in a paved plaza with benches and flower tubs |
| 3 | `koi-pond` | บ่อปลาคาร์ป | 2×2 | animal | p1 | water | rock-edged pond with orange, white and gold koi and lily pads |
| 4 | `splash-pad` | ลานน้ำพุเด็กเล่น | 2×2 | play | p1 | water | colourful splash pad with water-jet posts and a shallow blue floor |
| 5 | `stepping-stones` | ทางเดินหินข้ามลำธาร | 1×2 | decoration | p1 | water | round stepping stones across a strip of stream |
| 6 | `stream` | ลำธาร | 1×2 | nature | p1 | water | strip of stream with pebbles, rocks and reeds |
| 7 | `swan` | หงส์ขาว | 1×1 | animal | p1 | water | white swan on a small round pool |
| 8 | `toy-sailboat` | เรือใบจำลอง | 1×1 | play | p1 | water | small round pool with two toy sailboats |
| 9 | `drinking-fountain` | ก๊อกน้ำดื่ม | 1×1 | facility | p1 | — | drinking fountain on a stone post with a little step |
| 10 | `playground` | สนามเด็กเล่น | 2×3 | play | p2 | — | big play tower with a tube slide, a climbing net and a little roof on soft rubber floor |
| 11 | `sandpit` | บ่อทราย | 2×2 | play | p2 | — | wooden sandpit with buckets, spades and a sandcastle |
| 12 | `climbing-dome` | โดมปีนป่าย | 2×2 | play | p2 | — | rainbow climbing dome on soft floor |
| 13 | `seesaw` | ไม้กระดก | 1×2 | play | p2 | swing | bright seesaw with handles; it tips gently |
| 14 | `slide` | สไลเดอร์ | 1×2 | play | p2 | — | ladder and a wavy slide |
| 15 | `swings` | ชิงช้าคู่ | 1×2 | play | p2 | swing | frame with two swings; they swing gently |
| 16 | `spring-riders` | ตุ๊กตาสปริงโยก | 1×2 | play | p2 | swing | two spring riders (a duck and a horse) that rock |
| 17 | `mushroom-stools` | เก้าอี้เห็ด | 1×1 | seating | p2 | — | three mushroom-shaped stools round a little mushroom table |
| 18 | `park-dog` | สุนัขกับลูกบอล | 1×1 | animal | p2 | — | friendly dog with a ball by a water bowl |
| 19 | `outdoor-gym` | ลานออกกำลังกาย | 2×3 | facility | p3 | — | outdoor exercise machines in bright colours on a rubber floor |
| 20 | `skate-park` | ลานสเก็ตบอร์ด | 2×3 | play | p3 | — | concrete bowl, a ramp and a rail with colourful paint |
| 21 | `basketball-court` | สนามบาสครึ่งสนาม | 2×3 | play | p3 | — | half court with a hoop, painted lines and a ball |
| 22 | `bike-rental` | จุดเช่าจักรยาน | 2×2 | vehicle | p3 | — | small kiosk with a row of colourful bikes in a rack |
| 23 | `jogging-track` | ลู่วิ่ง | 1×2 | facility | p3 | — | strip of red running track with white lane lines (no numbers) |
| 24 | `bike-rack` | ที่จอดจักรยาน | 1×2 | facility | p3 | — | bike rack with two parked bikes |
| 25 | `trash-bins` | ถังขยะแยกประเภท | 1×1 | facility | p3 | — | three coloured bins with picture lids |
| 26 | `vending-machine` | ตู้กดเครื่องดื่ม | 1×1 | food | p3 | window | drinks vending machine with a lit front of bottles (no brand) |
| 27 | `signpost` | ป้ายบอกทาง | 1×1 | decoration | p3 | — | wooden post with arrow signs showing pictures (a swan, a slide, a cup) |
| 28 | `rose-garden` | สวนกุหลาบ | 2×3 | nature | p4 | sway | beds of red, pink and yellow roses round an arch |
| 29 | `maze-hedge` | เขาวงกตพุ่มไม้ | 2×2 | nature | p4 | — | low hedge maze with a little flag in the middle |
| 30 | `topiary-garden` | สวนไม้ดัดรูปสัตว์ | 2×2 | nature | p4 | — | shrubs trimmed into an elephant, a rabbit and a bird |
| 31 | `butterfly-garden` | สวนผีเสื้อ | 2×2 | nature | p4 | sway | flower garden with big colourful butterflies on the flowers |
| 32 | `flower-bed` | แปลงดอกไม้ | 1×2 | nature | p4 | sway | raised bed of bright mixed flowers |
| 33 | `hedge-row` | แนวพุ่มไม้ตัด | 1×2 | nature | p4 | — | neatly trimmed hedge with small flowers at its foot |
| 34 | `round-shrub` | พุ่มไม้ทรงกลม | 1×1 | nature | p4 | — | round trimmed shrub in a stone ring |
| 35 | `rock-garden` | สวนหิน | 1×1 | nature | p4 | — | rocks, pebbles and small succulents |
| 36 | `sprinkler` | สปริงเกอร์รดน้ำ | 1×1 | facility | p4 | spin | lawn sprinkler with a spinning head and water arcs |
| 37 | `greenhouse` | เรือนกระจกพรรณไม้ | 2×3 | building | p5 | window | glass greenhouse with plants inside, lit at night |
| 38 | `flame-tree` | ต้นหางนกยูง | 2×2 | nature | p5 | sway | big shade tree covered in red-orange flowers |
| 39 | `pergola` | ซุ้มไม้เลื้อย | 1×2 | decoration | p5 | sway | wooden pergola with flowering vines and a bench under it |
| 40 | `squirrel-tree` | ต้นไม้กับกระรอก | 1×1 | animal | p5 | sway | tree with two squirrels on the trunk and a nut |
| 41 | `pink-trumpet-tree` | ต้นชมพูพันธุ์ทิพย์ | 1×1 | nature | p5 | sway | tree covered in pink blossoms |
| 42 | `fan-palm` | ต้นปาล์มพัด | 1×1 | nature | p5 | sway | palm with big round fan leaves |
| 43 | `pigeons` | ฝูงนกพิราบ | 1×1 | animal | p5 | — | grey pigeons pecking round a little paved spot |
| 44 | `bird-house` | บ้านนก | 1×1 | decoration | p5 | — | bird house on a pole with two little birds |
| 45 | `picnic-lawn` | ลานปิกนิก | 2×3 | seating | p6 | — | lawn with checked picnic blankets, baskets, fruit and a kite on the grass |
| 46 | `gazebo` | ศาลาพักผ่อน | 2×2 | building | p6 | breathe | open hexagonal gazebo with benches; a lamp inside at night |
| 47 | `ice-cream-kiosk` | ซุ้มไอศกรีม | 2×2 | food | p6 | window | ice cream kiosk with a giant cone on the roof and a lit counter |
| 48 | `chess-tables` | โต๊ะหมากรุก | 2×2 | play | p6 | — | two stone tables with game boards and stools |
| 49 | `park-bench` | ม้านั่งสวน | 1×2 | seating | p6 | — | classic park bench with iron arms and a little lamp beside |
| 50 | `picnic-table` | โต๊ะปิกนิก | 1×2 | seating | p6 | — | wooden picnic table with benches and a basket |
| 51 | `coconut-ice-cream-cart` | รถไอติมกะทิ | 1×2 | food | p6 | — | push cart with an umbrella and a tub of coconut ice cream |
| 52 | `lamp-post` | เสาไฟสวน | 1×1 | decoration | p6 | breathe | old-style park lamp post that glows at night |
| 53 | `open-air-stage` | เวทีกลางแจ้ง | 2×3 | decoration | p7 | chase | small stage with a curved roof, speakers and string lights |
| 54 | `restroom-block` | ห้องน้ำสาธารณะ | 2×2 | facility | p7 | — | small restroom building with two picture-sign doors and a plant box |
| 55 | `flower-clock` | นาฬิกาดอกไม้ | 2×2 | decoration | p7 | spin | big clock face planted in flowers on a slope; the hands turn slowly (no numbers) |
| 56 | `balloon-cart` | รถขายลูกโป่ง | 1×2 | decoration | p7 | sway | cart with a bunch of colourful balloons bobbing |
| 57 | `telescope-deck` | จุดชมวิว | 1×2 | decoration | p7 | — | small wooden deck with a coin telescope and a railing |
| 58 | `park-tram` | รถรางชมสวน | 1×2 | vehicle | p7 | — | little open tram car with a striped roof |
| 59 | `park-map` | ป้ายแผนที่สวน | 1×1 | decoration | p7 | — | map board with a picture map of the park (no text) |
| 60 | `kinetic-sculpture` | ประติมากรรมกังหัน | 1×1 | decoration | p7 | spin | colourful abstract sculpture with spinning cups on top (no figures) |
