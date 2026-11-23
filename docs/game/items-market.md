# Shopping district theme (ย่านการค้า): item list

The full list of shopping-district items (70, owner-approved 2026-11-23: the proposed 50 plus 20 the owner asked for — "a market and a mall have lots of shops"):
**22 × 1×1, 20 × 1×2, 17 × 2×2, 11 × 2×3** (`MARKET_MIX`, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/market/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/market/batches/mN.ts`).

Animation key: **sway** (wind), **wave** (flags, banners), **spin**, lights **chase** / **blink** / **breathe** / **window**.

## Night is the showpiece (owner: "lots of colourful light at night, not dark")
Every shop and building has **lit windows** (`glassWindow` panes or `light: 'window'`) AND at least one **neon sign** — a glow part in a vivid palette colour (pink, purple, blue, skyBlue, teal, lime, sunYellow, orange, red). Neighbouring shops use different neon colours. Stalls, carts and kiosks carry **string lights or a glowing lamp** (`breathe` or `chase`). Marquees (cinema, night market, department store, electronics store) run **chase** lights. The theme also gets a brighter "city night" (Task 1), so the street never goes dark. Keep glows as signs, bulbs, windows and screens — never a whole wall blown out white.

## Content rules
Bright, busy Thai shopping street, mall and market. No people. Signs and neon are **icons and shapes, never text or letters** (a cup, a shirt, a shoe, a star, a heart, a donut, scissors, glasses…). No alcohol, tobacco, gambling or lottery; the pharmacy uses a green leaf/plus-in-circle in green, never a red cross on white. No real brands or logos; no copyrighted characters; no religious or royal imagery (no shrines or spirit houses, no lucky-cat charms).

| # | id | Thai name | Footprint | Category | Batch | Animation | Description (what it looks like, key parts, night lights) |
|---|---|---|---|---|---|---|---|
| 1 | `department-store` | ห้างสรรพสินค้า | 2×3 | building | m1 | chase, window | three-storey store with big glass fronts, a canopy entrance and a rooftop sign; chase lights round the sign, lit floors at night |
| 2 | `supermarket` | ซูเปอร์มาร์เก็ต | 2×3 | building | m1 | window | wide single-storey market hall with glass front, trolley bay and a basket-icon neon sign |
| 3 | `bakery` | เบเกอรี่ | 2×2 | food | m1 | window | cosy shop with a striped awning, bread in the window and a croissant neon sign |
| 4 | `ice-cream-parlour` | ร้านไอศกรีม | 2×2 | food | m1 | window | pastel parlour with a giant cone on the roof and a pink cone neon |
| 5 | `coffee-cart` | รถเข็นกาแฟ | 1×2 | food | m1 | breathe | wooden coffee cart with an umbrella, a machine and a glowing cup lamp |
| 6 | `food-truck` | ฟู้ดทรัค | 1×2 | vehicle | m1 | chase | bright food truck with a side hatch, a menu board of food pictures and bulbs round the hatch |
| 7 | `fruit-stall` | แผงผลไม้ | 1×2 | food | m1 | breathe | wooden stall heaped with tropical fruit under a canvas roof, a hanging bulb |
| 8 | `street-lamp` | เสาไฟถนน | 1×1 | decoration | m1 | breathe | ornate city street lamp with a warm globe |
| 9 | `trash-bin` | ถังขยะ | 1×1 | facility | m1 | — | city litter bin with a recycling-colour lid |
| 10 | `fresh-market` | ตลาดสด | 2×3 | food | m2 | breathe | open market hall with a big roof on posts, rows of stalls with fruit, veg and fish crates, hanging bulbs |
| 11 | `cinema` | โรงหนัง | 2×3 | building | m2 | chase, window | cinema with a big marquee and a film-reel icon, poster frames (pictures only), chase lights round the marquee |
| 12 | `flower-shop` | ร้านดอกไม้ | 2×2 | building | m2 | window, sway | shop with buckets of flowers out front (swaying) and a flower neon |
| 13 | `toy-store` | ร้านของเล่น | 2×2 | building | m2 | window | toy shop with a teddy and a rocket in the window and a star neon |
| 14 | `newsstand` | แผงหนังสือ | 1×2 | building | m2 | breathe | kiosk with racks of colourful magazines (colour blocks, no text) and a lamp |
| 15 | `atm-kiosk` | ตู้ ATM | 1×2 | facility | m2 | window | small booth with two cash machines whose screens glow |
| 16 | `mailbox` | ตู้ไปรษณีย์ | 1×1 | facility | m2 | — | red post box on a short pillar |
| 17 | `fire-hydrant` | หัวดับเพลิง | 1×1 | facility | m2 | — | red-and-white fire hydrant |
| 18 | `a-frame-sign` | ป้ายตั้งหน้าร้าน | 1×1 | decoration | m2 | — | chalkboard A-frame with drawn icons (cup, cake), no text |
| 19 | `grand-cafe` | ร้านกาแฟหลังใหญ่ | 2×3 | food | m3 | window, breathe | two-storey café with big windows, an outdoor terrace with tables and string bulbs |
| 20 | `clothing-shop` | ร้านเสื้อผ้า | 2×2 | building | m3 | window | boutique with mannequin shapes (simple dress forms, no faces) in the window and a shirt neon |
| 21 | `shoe-shop` | ร้านรองเท้า | 2×2 | building | m3 | window | shop with shoe shelves in the window and a sneaker neon |
| 22 | `city-bus-stop` | ป้ายรถเมล์ | 1×2 | facility | m3 | window | glass bus shelter with a bench and a glowing advert panel (picture only) |
| 23 | `phone-booth` | ตู้โทรศัพท์ | 1×2 | facility | m3 | window | two glass phone booths side by side, lit inside at night |
| 24 | `street-bench` | ม้านั่งริมทาง | 1×2 | seating | m3 | — | park-style bench with cast-iron ends and a small planter |
| 25 | `potted-plant` | กระถางต้นไม้ | 1×1 | nature | m3 | sway | big street pot with a round shrub |
| 26 | `patio-umbrella` | ร่มสนาม | 1×1 | seating | m3 | sway | café umbrella over a small table and two chairs; canopy sways a little |
| 27 | `sidewalk-table` | โต๊ะริมทาง | 1×1 | seating | m3 | breathe | small bistro table with two chairs and a glowing table lamp |
| 28 | `bookstore` | ร้านหนังสือ | 2×3 | building | m4 | window | bookshop with tall windows showing coloured book spines, a book neon |
| 29 | `pharmacy` | ร้านขายยา | 2×2 | building | m4 | window | clean white shop with a green leaf/plus-in-circle neon (never a red cross) |
| 30 | `stationery-shop` | ร้านเครื่องเขียน | 2×2 | building | m4 | window | shop with giant pencil sign and colourful shelves, pencil neon |
| 31 | `planter-box` | กระบะต้นไม้ | 1×2 | nature | m4 | sway | long raised planter with flowers |
| 32 | `vending-machines` | ตู้กดเครื่องดื่ม | 1×2 | facility | m4 | window | two drink vending machines with glowing fronts |
| 33 | `banner-pole` | เสาธงประดับ | 1×1 | decoration | m4 | wave | lamp-post style pole with a long colourful banner (shapes only) |
| 34 | `gashapon` | ตู้กาชาปอง | 1×1 | play | m4 | window | capsule-toy machine with a clear dome of colourful capsules, lit dome |
| 35 | `parking-meter` | มิเตอร์จอดรถ | 1×1 | facility | m4 | blink | parking meter with a small blinking light |
| 36 | `shop-cat` | แมวนอนหน้าร้าน | 1×1 | animal | m4 | — | ginger cat asleep on a doormat |
| 37 | `parking-lot` | ลานจอดรถ | 2×3 | facility | m5 | breathe | small car park with painted bays, two parked cars and a light post |
| 38 | `shophouse-row` | ตึกแถวร้านค้า | 2×3 | building | m5 | window | three Thai shophouses in a row with roll-up shutters, balconies and different neon icons |
| 39 | `barber-shop` | ร้านตัดผม | 2×2 | building | m5 | spin, window | barber shop with a spinning striped pole and a scissors neon |
| 40 | `noodle-shop` | ร้านก๋วยเตี๋ยว | 2×2 | food | m5 | window, breathe | shop-front noodle restaurant with a steaming pot cart out front and a bowl neon |
| 41 | `bike-rack` | ที่จอดจักรยาน | 1×2 | facility | m5 | — | rack with three colourful bikes |
| 42 | `bread-bike` | จักรยานขายขนมปัง | 1×2 | food | m5 | breathe | tricycle with a glass box of bread and a little lantern |
| 43 | `street-clock` | นาฬิกาเสา | 1×1 | decoration | m5 | window | green post clock with a glowing face |
| 44 | `parked-bike` | จักรยานจอด | 1×1 | vehicle | m5 | — | city bike with a front basket on its stand |
| 45 | `balloon-stand` | ลูกโป่งหน้าร้าน | 1×1 | decoration | m5 | sway | stand with a cluster of balloons |
| 46 | `night-market` | ตลาดนัดกลางคืน | 2×3 | food | m6 | chase | rows of stalls with colourful canopies under criss-crossed string lights that chase |
| 47 | `bubble-tea-shop` | ร้านชานมไข่มุก | 2×2 | food | m6 | window | modern shop with a giant cup-with-straw sign and a purple neon |
| 48 | `donut-shop` | ร้านโดนัท | 2×2 | food | m6 | window | shop with a giant pink donut on the roof and a donut neon |
| 49 | `tuk-tuk` | รถตุ๊กตุ๊ก | 1×2 | vehicle | m6 | blink | colourful Thai tuk-tuk parked, with blinking side lights |
| 50 | `flower-cart` | รถเข็นดอกไม้ | 1×2 | building | m6 | sway | wooden cart loaded with flower buckets |
| 51 | `clothes-stall` | แผงเสื้อผ้าแขวนราว | 1×2 | building | m6 | wave, breathe | market stall with shirts on a rail (rippling) and a bulb |
| 52 | `street-tree` | ต้นไม้ริมทาง | 1×1 | nature | m6 | sway | street tree in a square grate |
| 53 | `fruit-basket` | ตะกร้าผลไม้ | 1×1 | food | m6 | — | wicker basket of mixed fruit on a stand |
| 54 | `veg-crate` | ลังผัก | 1×1 | food | m6 | — | stacked crates of vegetables |
| 55 | `mall-food-court` | ศูนย์อาหารในห้าง | 2×3 | food | m7 | window, chase | glass-roofed food hall with counters, tables and a chase-lit sign |
| 56 | `optical-shop` | ร้านแว่นตา | 2×2 | building | m7 | window | shop with a giant glasses sign and a teal neon |
| 57 | `sports-shop` | ร้านกีฬา | 2×2 | building | m7 | window | shop with balls and rackets in the window and a ball neon |
| 58 | `meatball-grill` | แผงลูกชิ้นปิ้ง | 1×2 | food | m7 | breathe | Thai grilled-meatball cart with skewers over glowing charcoal |
| 59 | `juice-stall` | แผงน้ำผลไม้ | 1×2 | food | m7 | breathe | stall with jugs of bright juices and fruit, a glowing lamp |
| 60 | `corn-cart` | รถเข็นข้าวโพด | 1×2 | food | m7 | breathe | yellow cart with steaming corn and a lamp |
| 61 | `shopping-trolley` | รถเข็นช้อปปิ้ง | 1×1 | decoration | m7 | — | shopping trolley with a few bags |
| 62 | `market-scale` | ตาชั่งตลาด | 1×1 | facility | m7 | — | old market scale on a crate with fruit on the pan |
| 63 | `electronics-store` | ร้านเครื่องใช้ไฟฟ้า | 2×3 | building | m8 | window, chase | big store with a wall of glowing TV screens in the window and chase lights on its sign |
| 64 | `plant-nursery` | ร้านต้นไม้ | 2×2 | nature | m8 | sway, breathe | garden shop with pots, hanging baskets and a greenhouse corner, lanterns |
| 65 | `thai-dessert-shop` | ร้านขนมไทย | 2×2 | food | m8 | window | wooden shop with trays of colourful Thai desserts and a flower neon |
| 66 | `laundromat` | ร้านสะดวกซัก | 2×2 | building | m8 | spin, window | shop with a row of washing machines whose drums spin, a bubble neon |
| 67 | `toy-stall` | แผงของเล่น | 1×2 | play | m8 | breathe | market stall with toys, pinwheels and balls, a bulb |
| 68 | `umbrella-stall` | แผงร่มตลาด | 1×2 | building | m8 | sway, breathe | stall under a big market umbrella with goods on a table, a bulb |
| 69 | `sale-star` | ป้ายดาวลดราคา | 1×1 | decoration | m8 | blink | star-burst sign on a post that blinks (shape only, no text) |
| 70 | `hanging-planter` | กระถางแขวน | 1×1 | nature | m8 | sway | iron hook post with a hanging flower basket |
