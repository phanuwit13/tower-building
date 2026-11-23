# Tokyo theme (เมืองโตเกียว): item list

The full list of tokyo items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`TOKYO_MIX`, the shared mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/tokyo/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/tokyo/batches/<batch>.ts`).

## The city
The city (owner, 2026-11-24: "เมืองหลวงญี่ปุ่น แบบมีตึกเยอะๆ tokyo tower วัดญี่ปุ่น"): Japan's capital — lots of tall buildings and neon, Tokyo Tower, a Japanese temple with a pagoda, trains, little food stalls, cherry blossoms and quiet gardens. Ground concrete. A bright, colourful neon night like the shopping district (`nightGlow` 1.5): lit windows, neon icon signs, paper lanterns, the tower's lights.

Animation key: **sway** (cherry blossoms, maples, pines, bamboo), **wave** (carp streamers, shop curtains), **water** (`pond`: garden ponds and canals), **spin** (the sushi counter's plates), **swing** (the bamboo water knocker), lights **window** / **breathe** (lanterns) / **chase** (neon, arcade) / **blink** (tower and traffic lights).

Content rules: no people; the Japanese temple and pagoda are ARCHITECTURE only (the owner asked for them by name) — no statues of the Buddha or any deity, no altars, offerings, incense, prayer boards or fortune slips, and no Shinto shrine gates; no text or letters of any script (no kanji, kana or Latin) — signs and neon are pictures and icons (ramen bowl, sushi, star, heart, music note, cat); no real brands or logos; no copyrighted characters (no anime or game characters); no lucky-cat charm; no gambling (no pachinko, no prize machines); no alcohol (no sake barrels, no beer signs); cheerful and tidy.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `tokyo-tower` | โตเกียวทาวเวอร์ | 2×2 | building | t1 | blink | red-and-white lattice tower on four legs with two observation decks and blinking lights, about 4 tall |
| 2 | `five-storey-pagoda` | เจดีย์ห้าชั้น | 2×2 | building | t1 | — | five-storey wooden pagoda with red posts and dark curved roofs on a stone base |
| 3 | `japanese-temple` | วัดญี่ปุ่น | 2×3 | building | t1 | breathe | temple hall with a big sweeping roof behind a red gate holding a giant paper lantern (no writing), a stone path |
| 4 | `japanese-garden` | สวนญี่ปุ่น | 2×3 | nature | t1 | water | pond with koi, a little arched bridge, rocks, moss and a pine |
| 5 | `stone-lanterns` | ตะเกียงหินคู่ | 1×2 | decoration | t1 | breathe | two stone garden lanterns on gravel; their windows glow at night |
| 6 | `red-bridge` | สะพานแดงข้ามคลอง | 1×2 | decoration | t1 | water | red arched footbridge over a strip of canal |
| 7 | `shishi-odoshi` | กระบอกไม้ไผ่กระดก | 1×1 | decoration | t1 | swing | bamboo water knocker over a stone basin; it tips slowly |
| 8 | `rock-and-moss` | หินกับมอส | 1×1 | nature | t1 | — | mossy rocks on raked gravel |
| 9 | `japanese-pine` | ต้นสนญี่ปุ่น | 1×1 | nature | t1 | sway | pine with flat cloud-shaped layers of needles |
| 10 | `skyscraper-office` | ตึกสำนักงานระฟ้า | 2×3 | building | t2 | window | tall glass office tower with a stepped top and a rooftop helipad |
| 11 | `department-store` | ห้างสรรพสินค้า | 2×3 | building | t2 | chase | big store with a lit glass front, a giant screen and neon icon signs |
| 12 | `capsule-hotel` | โรงแรมแคปซูล | 2×2 | building | t2 | window | narrow building whose front is a grid of round capsule windows, lit at night |
| 13 | `karaoke-building` | ตึกคาราโอเกะ | 2×2 | building | t2 | chase | slim colourful building with a big neon music-note sign |
| 14 | `neon-sign-tower` | ป้ายไฟนีออน | 1×2 | decoration | t2 | chase | tall frame of stacked neon icon signs (ramen bowl, star, heart, cat) |
| 15 | `vending-machines` | ตู้กดเครื่องดื่ม | 1×2 | food | t2 | window | row of three lit drink machines (no brands) |
| 16 | `street-lamp` | เสาไฟถนน | 1×1 | decoration | t2 | breathe | modern street lamp that glows at night |
| 17 | `electric-pole` | เสาไฟฟ้า | 1×1 | facility | t2 | — | concrete utility pole with a tangle of wires and a transformer |
| 18 | `traffic-light` | สัญญาณไฟจราจร | 1×1 | facility | t2 | blink | horizontal traffic light on a pole, blinking |
| 19 | `train-station` | สถานีรถไฟ | 2×3 | building | t3 | window | station building with a glass roof over a platform and a green-striped train |
| 20 | `shinkansen-viaduct` | รถไฟชินคันเซ็น | 2×3 | vehicle | t3 | window | sleek white bullet train with a long blue-striped nose on a raised viaduct |
| 21 | `pedestrian-bridge` | สะพานลอยคนข้าม | 2×2 | facility | t3 | — | footbridge with stairs at both ends and railings |
| 22 | `commuter-train` | รถไฟฟ้า | 1×2 | vehicle | t3 | window | silver commuter train car with a coloured stripe |
| 23 | `tram` | รถราง | 1×2 | vehicle | t3 | — | small retro tram in cream and green on rails |
| 24 | `taxi` | แท็กซี่ | 1×2 | vehicle | t3 | — | boxy classic taxi with a roof lamp (no text) |
| 25 | `kei-truck` | รถกระบะเล็ก | 1×2 | vehicle | t3 | — | tiny white pickup with crates of vegetables |
| 26 | `bus-stop-sign` | ป้ายรถเมล์ | 1×1 | facility | t3 | — | round bus-stop sign on a pole with a small bench |
| 27 | `mama-bicycle` | จักรยานแม่บ้าน | 1×1 | vehicle | t3 | — | step-through bicycle with a front basket |
| 28 | `scramble-crossing` | สี่แยกทางม้าลาย | 2×3 | facility | t4 | window | big crossing with zebra stripes every way and building corners with giant screens |
| 29 | `apartment-block` | อพาร์ตเมนต์ | 2×3 | building | t4 | window | tall apartment block with balconies, air-con units and laundry poles |
| 30 | `konbini` | ร้านสะดวกซื้อ | 2×2 | food | t4 | window | small bright corner store with a striped band and lit shelves (no brand) |
| 31 | `toy-shop` | ร้านของเล่น | 2×2 | building | t4 | window | toy shop with robots, plushies and a giant toy robot on the roof (no known character) |
| 32 | `bicycle-parking` | ที่จอดจักรยาน | 1×2 | facility | t4 | — | rack with a row of colourful bicycles |
| 33 | `rickshaw` | รถลาก | 1×2 | vehicle | t4 | — | red two-wheeled rickshaw with a hood |
| 34 | `police-box` | ป้อมตำรวจ | 1×1 | building | t4 | breathe | tiny neighbourhood police box with a round red lamp (no text) |
| 35 | `mailbox` | ตู้ไปรษณีย์ | 1×1 | facility | t4 | — | red square-top mailbox |
| 36 | `trash-bins` | ถังขยะแยกประเภท | 1×1 | facility | t4 | — | bins with picture lids |
| 37 | `ramen-alley` | ซอยราเมน | 2×3 | food | t5 | breathe | narrow lane of tiny eateries with red paper lanterns and noren curtains |
| 38 | `sushi-restaurant` | ร้านซูชิสายพาน | 2×2 | food | t5 | spin | round counter with coloured sushi plates going round and stools |
| 39 | `fish-market` | ตลาดปลา | 2×2 | food | t5 | — | market stalls of fish on ice, crabs and tuna |
| 40 | `ramen-stall` | แผงราเมน | 1×2 | food | t5 | breathe | wooden street cart with a lantern, a curtain and steaming bowls |
| 41 | `takoyaki-stall` | ร้านทาโกะยากิ | 1×2 | food | t5 | — | stall with a round-dimpled grill full of takoyaki balls |
| 42 | `crepe-stand` | ร้านเครป | 1×2 | food | t5 | window | pastel crepe stand with a giant crepe on top |
| 43 | `taiyaki-stand` | ร้านไทยากิ | 1×1 | food | t5 | — | little stand with fish-shaped cakes on a tray |
| 44 | `paper-lantern-post` | โคมไฟกระดาษ | 1×1 | decoration | t5 | breathe | wooden post with a round paper lantern that glows |
| 45 | `arcade-center` | เกมเซ็นเตอร์ | 2×3 | play | t6 | chase | colourful arcade building with running neon and game cabinets visible inside (no prize or gambling machines) |
| 46 | `cat-cafe` | คาเฟ่แมว | 2×2 | food | t6 | window | cosy café with cat trees in the window and a giant cat-ear roof sign |
| 47 | `tea-house` | โรงน้ำชา | 2×2 | building | t6 | window | small wooden tea house with paper screens and a stepping-stone path |
| 48 | `koinobori-pole` | ธงปลาคาร์ป | 1×2 | decoration | t6 | wave | pole with colourful carp streamers that wave |
| 49 | `lantern-row` | แถวโคมกระดาษ | 1×2 | decoration | t6 | breathe | wire of red and white paper lanterns between two posts |
| 50 | `wagasa-stand` | ร่มกระดาษ | 1×1 | decoration | t6 | — | stand of open red and blue paper umbrellas |
| 51 | `shiba-dog` | สุนัขชิบะ | 1×1 | animal | t6 | — | friendly shiba dog with a curled tail |
| 52 | `calico-cat` | แมวสามสี | 1×1 | animal | t6 | — | calico cat sitting on a low wall |
| 53 | `zen-garden` | สวนหินเซน | 2×2 | nature | t7 | — | raked gravel in wave rings round three rocks, with a low fence |
| 54 | `sakura-grove` | สวนซากุระ | 2×2 | nature | t7 | sway | three cherry trees in pink bloom with petals on the grass |
| 55 | `bamboo-grove` | ป่าไผ่ | 2×2 | nature | t7 | sway | dense tall green bamboo with a path through it |
| 56 | `sakura-bench` | ม้านั่งใต้ซากุระ | 1×2 | seating | t7 | sway | bench under a small cherry tree |
| 57 | `bonsai-shelf` | ชั้นบอนไซ | 1×2 | nature | t7 | — | wooden shelf of little bonsai trees in pots |
| 58 | `sakura-tree` | ต้นซากุระ | 1×1 | nature | t7 | sway | cherry tree in full pink bloom |
| 59 | `maple-tree` | ต้นเมเปิลแดง | 1×1 | nature | t7 | sway | Japanese maple with red leaves |
| 60 | `azalea-bush` | พุ่มอาซาเลีย | 1×1 | nature | t7 | sway | round azalea bush covered in pink flowers |
