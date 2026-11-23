# Amusement park theme (สวนสนุก): item list

The full list of amusement-park items (53, owner-approved 2026-11-23: the proposed 50 plus บ้านผีสิง, สนามยิงปืน and บ้านยักษ์):
**16 × 1×1, 15 × 1×2, 12 × 2×2, 10 × 2×3**. The mix is checked by simulation on the 20 × 20 map (`src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/amusement/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, palette, animation, item ground surfaces ≥ 0.02). Batch = the sculptor batch that owns the item (`src/themes/amusement/batches/aN.ts`).

Animation key: **spin** / **swing** (moving parts), **sway** (wind), **wave** (flags), **water**, lights **chase** (lights run in sequence around a ring or along a line), **blink**, **breathe**, **window**.

Content rules for this theme (owner decisions): bright, friendly, fair-ground fun. **บ้านผีสิง** is cartoon-spooky only — a crooked purple house, a smiling sheet ghost, pumpkins and bats as shapes; no skulls, blood or gore. **สนามยิงปืน** is a fair-ground toy game — chunky, brightly coloured cork pop-guns chained to the counter, tin cans and yellow ducks as targets; nothing shaped like a real firearm. **บ้านยักษ์** is a fairy-tale giant's house (huge door, giant boots and a giant chair) — not a temple ยักษ์ guardian. No copyrighted characters; no religious or royal imagery.

| # | id | Thai name | Footprint | Category | Batch | Animation | Description (what it looks like, key parts) |
|---|---|---|---|---|---|---|---|
| 1 | `ferris-wheel` | ชิงช้าสวรรค์ | 2×3 | ride | a1 | chase | tall wheel on an A-frame along z, coloured cabins hanging at the rim; chase lights round the rim (the wheel does not spin: the cabins would turn upside down) |
| 2 | `carousel` | ม้าหมุน | 2×2 | ride | a1 | spin, chase | round platform with striped cone roof, horses on poles; platform + horses + roof spin slowly, chase lights on the roof edge |
| 3 | `teacups` | ถ้วยกาแฟหมุน | 2×2 | ride | a1 | spin | round base with three big teacups; each cup spins about its own centre |
| 4 | `ticket-booth` | ซุ้มขายตั๋ว | 1×2 | service | a1 | window | small striped kiosk with a ticket window and a sign board |
| 5 | `ring-toss` | เกมโยนห่วง | 1×2 | game | a1 | blink | counter stall with rows of bottles and rings, striped awning, blinking bulbs |
| 6 | `light-pole` | เสาไฟประดับ | 1×1 | decoration | a1 | chase | ornate pole with a ring of small bulbs that chase |
| 7 | `mascot-bear` | รูปปั้นมาสคอตหมี | 1×1 | decoration | a1 | — | friendly round bear statue (original design) waving, on a plinth |
| 8 | `frog-bin` | ถังขยะปากกบ | 1×1 | service | a1 | — | green frog-shaped bin with a wide open mouth |
| 9 | `park-map` | ป้ายแผนที่สวนสนุก | 1×1 | service | a1 | — | board on two posts showing a colourful map (blocks of colour, no text) |
| 10 | `roller-coaster` | รถไฟเหาะ | 2×3 | ride | a2 | chase | track on posts making a hump and a dip, a short train of cars on it; chase lights along the rail |
| 11 | `swing-ride` | ชิงช้าโซ่หมุน | 2×2 | ride | a2 | spin | central tower with a top disc; seats on chains hang from it; top + seats spin |
| 12 | `drop-tower` | หอคอยดิ่ง | 2×2 | ride | a2 | chase | tall tower with a ring of seats near the bottom; chase lights run up the tower |
| 13 | `duck-fishing` | เกมตกเป็ด | 1×2 | game | a2 | water | small pool of water with floating yellow ducks, rods leaning on the rim |
| 14 | `ice-cream-truck` | รถขายไอศกรีม | 1×2 | food | a2 | — | pastel van with a side hatch and a giant cone on the roof |
| 15 | `height-sign` | ป้ายวัดส่วนสูง | 1×1 | service | a2 | — | cartoon giraffe board with a hand at ride height |
| 16 | `coin-horse` | ม้าโยกหยอดเหรียญ | 1×1 | ride | a2 | swing | small coin-operated horse on a base; rocks gently |
| 17 | `coin-rocket` | จรวดหยอดเหรียญ | 1×1 | ride | a2 | swing, blink | small coin-operated rocket on a base; rocks gently, blinking tip |
| 18 | `umbrella-table` | โต๊ะร่ม | 1×1 | seating | a2 | — | round table with a striped umbrella and two stools |
| 19 | `pirate-ship` | เรือไวกิ้ง | 2×3 | ride | a3 | swing | big boat hanging from an A-frame; the boat swings along its length |
| 20 | `log-flume` | รางน้ำซุง | 2×3 | ride | a3 | water | water channel with a slope and a splash pool, a log boat on it |
| 21 | `bouncy-castle` | ปราสาทเป่าลม | 2×2 | game | a3 | wave | puffy inflatable castle with round towers and little flags |
| 22 | `cotton-candy` | ร้านสายไหม | 1×2 | food | a3 | — | cart with a big pink cotton-candy cloud on top, sticks in a holder |
| 23 | `popcorn-stand` | ร้านป๊อปคอร์น | 1×2 | food | a3 | window | red-and-white stand with a glass popcorn box (warm glow at night) |
| 24 | `hotdog-stand` | ร้านฮอทดอก | 1×2 | food | a3 | — | cart with an umbrella and a giant hot-dog sign |
| 25 | `topiary-animal` | ต้นไม้ตัดรูปสัตว์ | 1×1 | nature | a3 | sway | hedge trimmed into an elephant shape in a square planter |
| 26 | `flower-tub` | กระถางดอกไม้ | 1×1 | nature | a3 | sway | round tub overflowing with bright flowers |
| 27 | `bubble-machine` | เครื่องเป่าฟองสบู่ | 1×1 | game | a3 | — | small machine on a post with a cluster of glassy bubbles above it |
| 28 | `bumper-cars` | รถบั๊มพ์ | 2×3 | ride | a4 | spin, chase | low arena with a roof grid on posts, colourful cars that each turn slowly on the spot, chase lights on the roof edge |
| 29 | `entrance-gate` | ประตูทางเข้าสวนสนุก | 2×3 | building | a4 | chase, wave | big arch over the entrance with two towers, flags on top, chase lights round the arch |
| 30 | `mirror-maze` | บ้านกระจก | 2×2 | building | a4 | window | box house with shiny glass panels and a bright entrance |
| 31 | `kiddie-cars` | รถเด็กวนรอบ | 2×2 | ride | a4 | spin | round track with small cars around a centre post; cars + arms spin |
| 32 | `balloon-stall` | ร้านลูกโป่ง | 1×2 | shop | a4 | sway | cart with a bunch of balloons tied above it |
| 33 | `photo-booth` | ตู้ถ่ายรูป | 1×2 | service | a4 | window | booth with a curtain and a camera bulb on top |
| 34 | `face-cutout` | ป้ายเจาะหน้าถ่ายรูป | 1×1 | game | a4 | — | painted board of a cartoon astronaut with a face hole |
| 35 | `shaved-ice-cart` | รถเข็นน้ำแข็งใส | 1×1 | food | a4 | — | small cart with a striped canopy and colourful syrup bottles |
| 36 | `lollipop-sign` | ป้ายอมยิ้มยักษ์ | 1×1 | decoration | a4 | — | giant swirly lollipop on a stick |
| 37 | `show-stage` | เวทีโชว์ | 2×3 | building | a5 | breathe | raised stage with curtains, a top truss and spotlights that breathe |
| 38 | `train-station` | สถานีรถไฟเล็ก | 2×3 | building | a5 | window | small station with a platform, a clock and a short piece of track |
| 39 | `splash-pad` | ลานน้ำพุเล่นน้ำ | 2×2 | game | a5 | water | colourful pad with shallow water and spray posts |
| 40 | `spiral-slide` | สไลเดอร์เกลียว | 2×2 | ride | a5 | — | tower with a spiral slide winding round it to a landing mat |
| 41 | `claw-machines` | ตู้คีบตุ๊กตา | 1×2 | game | a5 | blink | two glass cabinets full of plush toys with claws on top, blinking marquee |
| 42 | `queue-rails` | แนวกั้นคิว | 1×2 | service | a5 | — | zigzag queue rails on short posts |
| 43 | `mini-train` | ขบวนรถไฟเล็ก | 1×2 | vehicle | a5 | — | tiny engine and two open carriages on a short rail |
| 44 | `water-jet` | น้ำพุพุ่ง | 1×1 | decoration | a5 | water | small basin with a tall water jet |
| 45 | `balloon-post` | ลูกโป่งผูกเสา | 1×1 | decoration | a5 | sway | post with a bunch of balloons tied to it |
| 46 | `haunted-house` | บ้านผีสิง | 2×3 | ride | a6 | blink | crooked purple house, tilted roof, a smiling sheet ghost on the porch, pumpkins; windows flicker (cartoon-spooky only) |
| 47 | `giant-house` | บ้านยักษ์ | 2×3 | building | a6 | window | fairy-tale giant's house: oversized door and windows, a giant boot and a giant chair outside |
| 48 | `food-court` | ศูนย์อาหาร | 2×2 | food | a6 | window | open-sided hall with stalls and tables under a big roof |
| 49 | `souvenir-shop` | ร้านของที่ระลึก | 2×2 | shop | a6 | window | small shop with plushies and balloons in the window, striped awning |
| 50 | `restrooms` | ห้องน้ำ | 2×2 | service | a6 | — | tidy toilet block with two doors and a small roof |
| 51 | `shooting-gallery` | สนามยิงปืน | 1×2 | game | a6 | chase | fair-ground booth: counter with chunky toy cork guns, rows of tin cans and ducks as targets, chase lights round the top |
| 52 | `parade-float` | รถแห่ขบวนพาเหรด | 1×2 | vehicle | a6 | wave | decorated float with a big flower crown and flags |
| 53 | `double-bench` | ม้านั่งคู่ | 1×2 | seating | a6 | — | two benches back to back with a flower box between them |
