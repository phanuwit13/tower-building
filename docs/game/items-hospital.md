# Hospital theme (โรงพยาบาล): item list

The full list of hospital items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`HOSPITAL_MIX`, the shared mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/hospital/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/hospital/batches/<batch>.ts`).

## The hospital (indoors)
The hospital (owner, 2026-11-24: "inside the hospital, not outside"): like the café, an INDOOR theme — the 20 × 20 map is a hospital floor that kids furnish. The room is built in (the café's room engine with a hospital look): low clean walls round the map with big windows, open automatic glass doors on the +x side under a heart-and-plus sign, a pavement outside, rain only outside. The floor is a pale clean floor. A bright, calm night (lit screens, lamps, the elevator lights).

**Indoors there is no wind**: never `sway` or `wave`. Animation key: **window** (screens, lit counters, vending machines), **breathe** (lamps), **blink** (monitor, elevator arrows), **spin** (toy mobiles, the lab centrifuge), **swing** (rocking horse), **water** (`pool`: the aquarium), **chase** (playroom string lights).

Content rules (owner): **no red cross on white anywhere** — the hospital sign is a heart with a plus in teal/green, the pharmacy a green plus in a circle; **no people** (beds and chairs are empty, a teddy bear may sit on them); nothing scary or gory — no blood, needles, drips, surgery, injuries, skeletons or ghosts; nothing religious (no prayer room, shrine or spirit house); no royal imagery; no real brands; signs, screens and charts are pictures and colour blocks, never text, letters or numbers (the eye chart uses pictures: apple, house, star); a bright, calm, friendly place where everyone gets better.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `reception-desk` | เคาน์เตอร์ประชาสัมพันธ์ | 2×3 | facility | h1 | window | long curved front desk with screens, a heart-and-plus sign on a stand and plants |
| 2 | `waiting-area` | ที่นั่งรอ | 2×3 | seating | h1 | window | rows of joined seats round a low table with magazines, a wall screen showing a sun picture |
| 3 | `vending-corner` | มุมตู้กด | 2×2 | food | h1 | window | two vending machines with lit fronts (no brands) and a bench |
| 4 | `gift-shop-corner` | ร้านของขวัญ | 2×2 | food | h1 | — | little shop counter with teddy bears, balloons, flowers and cards |
| 5 | `bench-seats` | เก้าอี้รอสามที่นั่ง | 1×2 | seating | h1 | — | three joined waiting seats in a bright colour |
| 6 | `info-kiosk` | ตู้ข้อมูล | 1×2 | facility | h1 | window | touch-screen kiosk showing a picture map, lit at night |
| 7 | `water-dispenser` | ตู้กดน้ำ | 1×1 | facility | h1 | — | water cooler with a blue bottle and cups |
| 8 | `sanitizer-stand` | เจลล้างมือ | 1×1 | facility | h1 | — | hand-gel stand with a pump bottle and a hand picture |
| 9 | `umbrella-stand` | ที่วางร่ม | 1×1 | facility | h1 | — | round stand with three colourful umbrellas |
| 10 | `kids-ward-beds` | ห้องพักผู้ป่วยเด็ก | 2×3 | seating | h2 | — | two small beds with animal-print blankets, a curtain rail, bedside tables and teddy bears |
| 11 | `playroom` | ห้องเด็กเล่น | 2×3 | play | h2 | chase | soft mats, a little slide, building blocks, toy shelves and string lights |
| 12 | `reading-corner` | มุมหนังสือ | 2×2 | decoration | h2 | — | low bookshelf, bean bags and a round rug |
| 13 | `baby-nursery` | ห้องเด็กแรกเกิด | 2×2 | seating | h2 | spin | row of empty baby cots with pastel blankets under a turning toy mobile |
| 14 | `art-wall` | บอร์ดรูปวาดเด็ก | 1×2 | decoration | h2 | — | free-standing board of kids' drawings (sun, house, cat, rainbow) |
| 15 | `bookshelf-low` | ชั้นหนังสือเด็ก | 1×2 | decoration | h2 | — | low shelf of colourful picture books with a plant on top |
| 16 | `toy-car` | รถของเล่นเด็ก | 1×1 | play | h2 | — | ride-on toy car in a bright colour |
| 17 | `rocking-horse` | ม้าโยก | 1×1 | play | h2 | swing | wooden rocking horse; it rocks gently |
| 18 | `teddy-bear` | ตุ๊กตาหมี | 1×1 | decoration | h2 | — | big teddy bear sitting on a little chair |
| 19 | `nurse-station` | เคาน์เตอร์พยาบาล | 2×3 | facility | h3 | window | counter with screens, file trays, a phone and a desk lamp |
| 20 | `recovery-bed` | เตียงพักฟื้น | 2×2 | seating | h3 | — | empty adjustable bed with a blanket, a side table with flowers and a curtain |
| 21 | `exam-room` | ห้องตรวจ | 2×2 | facility | h3 | — | exam bed with a paper roll, a doctor's desk and a folding screen |
| 22 | `hospital-bed` | เตียงผู้ป่วย | 1×2 | seating | h3 | — | single bed with rails, a pillow, a blanket and a small teddy |
| 23 | `stretcher` | เปลเข็นผู้ป่วย | 1×2 | facility | h3 | — | empty wheeled stretcher with a pillow |
| 24 | `wheelchair-pair` | รถเข็นผู้ป่วยคู่ | 1×2 | facility | h3 | — | two empty wheelchairs side by side |
| 25 | `screen-divider` | ฉากกั้น | 1×2 | decoration | h3 | — | folding screen with pastel panels |
| 26 | `heart-monitor` | จอวัดชีพจร | 1×1 | facility | h3 | blink | monitor on a stand with a heart picture and a blinking line |
| 27 | `aed-box` | ตู้ AED | 1×1 | facility | h3 | — | green cabinet on a stand with a heart icon |
| 28 | `mri-scanner` | เครื่องสแกน | 2×3 | facility | h4 | window | big friendly ring scanner with a sliding bed, painted with stars, lit ring |
| 29 | `xray-room` | ห้องเอกซเรย์ | 2×2 | facility | h4 | window | x-ray table and arm, a lightbox showing a teddy bear's x-ray picture |
| 30 | `dental-chair` | ห้องทำฟัน | 2×2 | facility | h4 | window | dental chair with a lamp, a tray and a giant smiling tooth poster |
| 31 | `eye-test-corner` | มุมตรวจตา | 2×2 | facility | h4 | — | chair, an eye-test machine and a picture chart (apple, house, star) |
| 32 | `medicine-cabinet` | ตู้ยา | 1×2 | facility | h4 | — | glass cabinet with colourful boxes and a green plus-in-circle sign |
| 33 | `hand-wash-station` | อ่างล้างมือ | 1×2 | facility | h4 | — | two sinks with soap pumps and a mirror |
| 34 | `height-chart` | แผ่นวัดส่วนสูงยีราฟ | 1×1 | decoration | h4 | — | giraffe-shaped height board with colour marks (no numbers) |
| 35 | `baby-scale` | เครื่องชั่งเด็ก | 1×1 | facility | h4 | — | baby scale on a little table with a soft pad |
| 36 | `stool-pair` | เก้าอี้สตูลคู่ | 1×1 | seating | h4 | — | two round wheeled stools |
| 37 | `physio-room` | ห้องกายภาพบำบัด | 2×3 | play | h5 | — | parallel bars, big exercise balls, mats and a little set of steps |
| 38 | `doctor-office` | ห้องหมอ | 2×2 | facility | h5 | breathe | desk with a screen, two chairs, a bookshelf and a heart model; a desk lamp |
| 39 | `plant-atrium` | สวนในอาคาร | 2×2 | nature | h5 | — | big indoor planter with small trees and a bench round it |
| 40 | `treadmill` | ลู่วิ่งกายภาพ | 1×2 | facility | h5 | window | therapy treadmill with handrails and a lit panel |
| 41 | `sofa` | โซฟารอ | 1×2 | seating | h5 | — | soft two-seat sofa with cushions |
| 42 | `therapy-dog` | สุนัขบำบัด | 1×1 | animal | h5 | — | friendly therapy dog in a heart vest on a mat |
| 43 | `flower-vase-table` | โต๊ะแจกันดอกไม้ | 1×1 | decoration | h5 | — | small round table with a vase of flowers |
| 44 | `potted-plant` | ต้นไม้กระถาง | 1×1 | nature | h5 | — | leafy plant in a white pot |
| 45 | `pharmacy-counter` | ห้องจ่ายยา | 2×3 | facility | h6 | window | counter with a glass window, shelves of colourful boxes and a green plus-in-circle sign |
| 46 | `lab-bench` | ห้องแล็บ | 2×2 | facility | h6 | spin | bench with microscopes, a rack of colourful test tubes and a spinning centrifuge |
| 47 | `supply-room` | ห้องเก็บของ | 2×2 | facility | h6 | — | shelves of boxes, folded towels and a ladder |
| 48 | `linen-cart` | รถเข็นผ้าปูเตียง | 1×2 | facility | h6 | — | cart of folded sheets and pillows |
| 49 | `food-trolley` | รถเข็นอาหาร | 1×2 | food | h6 | — | trolley with covered meal trays and a fruit bowl |
| 50 | `cleaning-cart` | รถเข็นทำความสะอาด | 1×2 | facility | h6 | — | cart with a mop bucket and spray bottles |
| 51 | `fire-extinguisher` | ถังดับเพลิง | 1×1 | facility | h6 | — | red extinguisher on a wall stand with a sign picture |
| 52 | `wet-floor-sign` | ป้ายพื้นเปียก | 1×1 | decoration | h6 | — | yellow A-frame sign with a water-drop picture |
| 53 | `hospital-cafe` | โซนอาหาร | 2×3 | food | h7 | window | food counter with a lit menu picture board, tables and chairs |
| 54 | `elevator-lobby` | โถงลิฟต์ | 2×3 | facility | h7 | blink | two elevator doors in a wall section with blinking arrow lights and plants |
| 55 | `aquarium-tank` | ตู้ปลา | 2×2 | animal | h7 | water | big fish tank on a cabinet with colourful fish and plants |
| 56 | `plant-planter` | กระบะต้นไม้ | 1×2 | nature | h7 | — | long planter of green plants |
| 57 | `recycle-bins` | ถังขยะแยกประเภท | 1×2 | facility | h7 | — | three coloured bins with picture lids |
| 58 | `air-purifier` | เครื่องฟอกอากาศ | 1×1 | facility | h7 | window | tall air purifier with a lit ring |
| 59 | `toy-mobile` | โมบายของเล่น | 1×1 | decoration | h7 | spin | stand with a turning mobile of stars and moons |
| 60 | `balloon-bunch` | ลูกโป่ง | 1×1 | decoration | h7 | — | bunch of bright balloons tied to a little weight |
