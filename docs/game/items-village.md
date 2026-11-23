# Village theme (หมู่บ้าน): item list

The full list of village items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`VILLAGE_MIX`, the zoo, beach and café mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/village/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/village/batches/vN.ts`).

## The village (owner chose "ก", 2026-11-24)
A Thai countryside village: wooden stilt houses, rice paddies, buffaloes, ponds and canals, a little market. The default ground is grass (the floor tiles give dirt paths). Night is a quiet country night (the standard night glow), lit by lanterns, lit windows and fireflies.

Animation key: **sway** (rice, trees, crops), **wave** (laundry, scarecrow), **water** (`pond`), **spin** (pinwheel), **swing** (hammock, swing), lights **window** / **breathe** / **chase** / **blink**.

## Content rules
No people; no temple, monk, stupa, spirit house or any religious object; no royal imagery or royal-project symbols (no Chaipattana aerator); no alcohol, no cockfighting or any gambling; signs are pictures, never text; animals are friendly cartoons; a cheerful, tidy village, never shown as poor or run-down.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `stilt-house` | บ้านไม้ใต้ถุนสูง | 2×3 | building | v1 | window | wooden house on stilts with a steep roof, a front stair and a veranda; a hammock and a bamboo bench in the open space underneath |
| 2 | `grocery-shop` | ร้านขายของชำ | 2×3 | building | v1 | window | wooden shop with folding shutters open, shelves of snacks and drinks, an ice cooler and a bench out front |
| 3 | `rice-barn` | ยุ้งข้าว | 2×2 | building | v1 | — | raised wooden granary with a tall roof and a ladder, sacks of rice beside it |
| 4 | `field-hut` | เถียงนา | 2×2 | building | v1 | — | small open bamboo hut on stilts with a thatched roof, the kind that stands in a rice field |
| 5 | `water-tower` | แท็งก์น้ำประปาหมู่บ้าน | 2×2 | facility | v1 | — | tall village water tank on four legs with a ladder and pipes |
| 6 | `bamboo-bench` | แคร่ไม้ไผ่ | 1×2 | seating | v1 | — | low bamboo platform bench with a mat and a fan on it |
| 7 | `hammock` | เปลญวน | 1×2 | seating | v1 | swing | net hammock between two posts; it swings gently |
| 8 | `well` | บ่อน้ำ | 1×1 | facility | v1 | water | round brick well with a little roof, a pulley and a bucket; the water inside shimmers |
| 9 | `mailbox` | ตู้ไปรษณีย์ | 1×1 | facility | v1 | — | red round mailbox on a post (no text) |
| 10 | `rice-paddy` | นาข้าว | 2×3 | nature | v2 | sway, water | flooded paddy with neat rows of green rice and raised mud banks; the rice sways, the water shimmers |
| 11 | `rice-mill` | โรงสีข้าว | 2×3 | building | v2 | window | small corrugated-roof mill with a hopper, a chute and stacked rice sacks |
| 12 | `drying-yard` | ลานตากข้าว | 2×2 | facility | v2 | — | yard of golden rice spread to dry, a wooden rake and baskets |
| 13 | `haystacks` | กองฟาง | 2×2 | nature | v2 | — | three round straw stacks on golden stubble |
| 14 | `walking-tractor` | รถไถเดินตาม | 1×2 | vehicle | v2 | — | two-wheel walking tractor with long handles and a small trailer |
| 15 | `farm-truck` | รถอีแต๋น | 1×2 | vehicle | v2 | — | farm truck with an open engine and a wooden cargo bed of vegetables |
| 16 | `scarecrow` | หุ่นไล่กา | 1×1 | decoration | v2 | wave | straw scarecrow in a hat with ribbons; the shirt and ribbons flap |
| 17 | `pinwheel` | กังหันลมไม้ไผ่ | 1×1 | decoration | v2 | spin | bamboo pinwheel on a tall pole that turns in the wind |
| 18 | `water-buffalo` | ควาย | 1×1 | animal | v2 | — | friendly grey water buffalo with curved horns |
| 19 | `buffalo-wallow` | ปลักควาย | 2×3 | animal | v3 | water | muddy pool with two buffaloes, one lying in the water, white egrets on the bank |
| 20 | `chicken-coop` | เล้าไก่ | 2×2 | animal | v3 | — | wooden coop with a wire run, a hen, a rooster and chicks |
| 21 | `cow-pen` | คอกวัว | 2×2 | animal | v3 | — | wooden fenced pen with two cows, a hay trough and a water trough |
| 22 | `pig-pen` | คอกหมู | 2×2 | animal | v3 | — | low pen with a pink sow, piglets and a little shelter |
| 23 | `goats` | แพะ | 1×2 | animal | v3 | — | small fenced pen with two goats and a feed box |
| 24 | `hen-and-chicks` | แม่ไก่กับลูกเจี๊ยบ | 1×1 | animal | v3 | — | hen with four yellow chicks pecking grain |
| 25 | `ducks` | เป็ด | 1×1 | animal | v3 | water | three white ducks around a small puddle |
| 26 | `village-dog` | หมาบ้าน | 1×1 | animal | v3 | — | friendly village dog lying on a mat by a bowl |
| 27 | `woodpile` | กองฟืน | 1×1 | decoration | v3 | — | neat stack of firewood under a little lean-to roof |
| 28 | `fish-pond` | บ่อปลา | 2×3 | animal | v4 | water | farm fish pond with a wooden feeding deck, fish at the surface and water plants |
| 29 | `lotus-pond` | บ่อบัว | 2×2 | nature | v4 | water | pond with pink lotus flowers and big round leaves |
| 30 | `waterside-pavilion` | ศาลาท่าน้ำ | 2×2 | building | v4 | water | open wooden pavilion on a pier over water, with steps down to the water |
| 31 | `footbridge` | สะพานไม้ข้ามคลอง | 1×2 | decoration | v4 | water | arched wooden footbridge over a strip of canal |
| 32 | `rowboat` | เรือพาย | 1×2 | vehicle | v4 | water | wooden rowboat with paddles on a strip of canal, tied to a post |
| 33 | `water-jars` | โอ่งน้ำ | 1×2 | facility | v4 | — | row of three big glazed water jars with lids and a dipper |
| 34 | `hand-pump` | ปั๊มน้ำมือโยก | 1×1 | facility | v4 | — | green hand pump on a concrete base with a bucket |
| 35 | `firefly-bush` | พุ่มไม้หิ่งห้อย | 1×1 | nature | v4 | blink | round bush by the water; tiny fireflies blink in it at night |
| 36 | `bamboo-clump` | กอไผ่ | 1×1 | nature | v4 | sway | tall clump of bamboo stems; it sways |
| 37 | `village-market` | ตลาดนัดหมู่บ้าน | 2×3 | food | v5 | chase | row of stalls under striped umbrellas and tarps with fruit, vegetables and snacks; string bulbs at night |
| 38 | `coffee-stall` | ร้านกาแฟโบราณ | 2×2 | food | v5 | breathe | old-style coffee stall with a cloth filter pot, glass jars and stools round a table; a lamp at night |
| 39 | `som-tam-stall` | ร้านส้มตำ | 1×2 | food | v5 | — | stall with a big clay mortar, papayas, chillies and limes |
| 40 | `fruit-stall` | แผงผลไม้ | 1×2 | food | v5 | — | wooden stand of mangoes, bananas, watermelons and rambutans |
| 41 | `bamboo-rice-grill` | ข้าวหลามเผา | 1×2 | food | v5 | breathe | long grill of bamboo tubes over glowing embers |
| 42 | `sidecar-motorbike` | มอเตอร์ไซค์พ่วงข้าง | 1×2 | vehicle | v5 | — | small motorbike with a sidecar full of baskets |
| 43 | `clay-stove` | เตาถ่าน | 1×1 | food | v5 | breathe | clay charcoal stove with a pot on top; the coals glow |
| 44 | `bicycle` | จักรยานติดตะกร้า | 1×1 | vehicle | v5 | — | old bicycle with a front basket of flowers |
| 45 | `village-hall` | ศาลากลางบ้าน | 2×3 | building | v6 | breathe | open meeting hall with a tiled roof, benches and a notice board with pictures; lamps at night |
| 46 | `takraw-court` | ลานตะกร้อ | 2×3 | play | v6 | — | small court with a net, a rattan ball and a bench |
| 47 | `mushroom-house` | โรงเรือนเพาะเห็ด | 2×2 | building | v6 | — | low shade house with racks of mushroom bags and mushrooms popping out |
| 48 | `roadside-sala` | ศาลาริมทาง | 1×2 | seating | v6 | — | small roadside shelter with a bench and a roof |
| 49 | `ox-cart` | เกวียน | 1×2 | vehicle | v6 | — | old wooden cart with big spoked wheels, kept as decoration with flowers |
| 50 | `loudspeaker-pole` | หอกระจายข่าว | 1×1 | facility | v6 | — | tall pole with horn loudspeakers pointing different ways |
| 51 | `lantern-post` | ตะเกียงริมทาง | 1×1 | decoration | v6 | breathe | wooden post with a hanging lantern that glows at night |
| 52 | `swing` | ชิงช้าไม้ | 1×1 | play | v6 | swing | wooden frame swing with a plank seat; it swings gently |
| 53 | `banana-grove` | สวนกล้วย | 2×3 | nature | v7 | sway | banana plants with big leaves and bunches of bananas |
| 54 | `rain-tree` | ต้นจามจุรี | 2×2 | nature | v7 | sway | huge umbrella-shaped shade tree with a bench round its trunk |
| 55 | `vegetable-garden` | แปลงผักสวนครัว | 2×2 | nature | v7 | sway | raised beds of greens, chillies, lemongrass and a watering can |
| 56 | `laundry-line` | ราวตากผ้า | 1×2 | decoration | v7 | wave | bamboo laundry line with colourful clothes and a sarong flapping |
| 57 | `bamboo-fence` | รั้วไม้ไผ่ | 1×2 | decoration | v7 | — | woven bamboo fence with a climbing flower vine |
| 58 | `marigold-patch` | แปลงดาวเรือง | 1×2 | nature | v7 | sway | bed of bright orange and yellow marigolds |
| 59 | `mango-tree` | ต้นมะม่วง | 1×1 | nature | v7 | sway | round mango tree with yellow mangoes |
| 60 | `coconut-palm` | ต้นมะพร้าว | 1×1 | nature | v7 | sway | tall leaning coconut palm with green coconuts |
