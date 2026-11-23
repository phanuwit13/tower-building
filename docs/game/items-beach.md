# Beach theme (ชายหาดทะเล): item list

The full list of beach items (60, owner-approved 2026-11-23: the proposed 50 plus 10 the owner asked for):
**19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (the same mix as the zoo, `ZOO_MIX`/`BEACH_MIX`, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/beach/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/beach/batches/cN.ts` — "c" for coast; the School theme's batches are `bN`, do not touch them).

Animation key: **sway** (wind), **wave** (flags, cloth), **water** (`pond` for sea/rock pools, `pool` for swimming pools), **swing**, lights **breathe** / **window**.

Content rules for this theme: a bright, sunny Thai-style beach for kids. No people (the game has none); no swimwear, alcohol or bar imagery (the coconut bar sells coconuts and juice); no religious or royal imagery (no shrines, no Buddha images, no spirit houses); signs carry shapes and colour blocks, never text; sea animals are friendly cartoons; nothing scary in the sea (no sharks with teeth). No copyrighted characters.

| # | id | Thai name | Footprint | Category | Batch | Animation | Description (what it looks like, key parts) |
|---|---|---|---|---|---|---|---|
| 1 | `pier` | ท่าเรือไม้ | 2×3 | building | c1 | water | wooden pier on posts running out over a patch of sea, a ladder and a mooring post |
| 2 | `lighthouse` | ประภาคาร | 2×3 | building | c1 | breathe | red-and-white striped lighthouse on a rocky base with a lamp room whose light breathes at night |
| 3 | `sandcastle` | ปราสาททราย | 2×2 | play | c1 | wave | big sandcastle with towers, a moat and a little flag on top |
| 4 | `lifeguard-tower` | หอไลฟ์การ์ด | 2×2 | facility | c1 | wave | tall wooden lifeguard chair-hut on stilts with a ramp and a red-yellow flag |
| 5 | `sunloungers` | เก้าอี้ผ้าใบคู่ | 1×2 | seating | c1 | — | two striped deck loungers side by side with a small table |
| 6 | `umbrella-mat` | ร่มชายหาดกับเสื่อ | 1×2 | seating | c1 | sway | beach umbrella over a woven mat with a bag and sandals; the umbrella canopy sways a little |
| 7 | `longtail-boat` | เรือหางยาว | 1×2 | vehicle | c1 | water | Thai longtail boat with a long-shaft engine at the back and colourful ribbons on the bow, on a patch of water |
| 8 | `palm-tree` | ต้นมะพร้าว | 1×1 | nature | c1 | sway | tall curving coconut palm with coconuts under the fronds |
| 9 | `sand-bucket` | ถังทรายกับพลั่ว | 1×1 | play | c1 | — | bright plastic bucket and spade beside a little sand mound |
| 10 | `sailboat-dock` | เรือใบจอดท่า | 2×3 | vehicle | c2 | water, wave | small jetty with a sailboat moored beside it; the sail cloth ripples |
| 11 | `seafood-restaurant` | ร้านอาหารทะเล | 2×3 | food | c2 | window | wooden restaurant on low stilts with a thatched roof, a fish-shaped sign and tables on the deck |
| 12 | `kayak-rack` | ชั้นวางเรือคายัค | 2×2 | facility | c2 | — | wooden rack holding colourful kayaks and paddles |
| 13 | `coconut-bar` | บาร์น้ำมะพร้าว | 2×2 | food | c2 | — | round thatched kiosk selling fresh coconuts and juice, stools around the counter |
| 14 | `palm-hammock` | เปลญวนระหว่างมะพร้าว | 1×2 | seating | c2 | sway | hammock strung between two short palms; palms and hammock sway together |
| 15 | `boardwalk-bench` | ม้านั่งทางเดินไม้ | 1×2 | seating | c2 | — | a short boardwalk section with a bench and a rope rail |
| 16 | `beach-ball` | ลูกบอลชายหาด | 1×1 | play | c2 | — | big striped beach ball resting on the sand |
| 17 | `starfish` | ปลาดาว | 1×1 | animal | c2 | — | a big orange starfish with a smiley face on the sand |
| 18 | `giant-shell` | เปลือกหอยยักษ์ | 1×1 | decoration | c2 | — | a giant pink scallop shell standing up like a photo spot |
| 19 | `beach-pool` | สระน้ำริมหาด | 2×3 | play | c3 | water (pool) | tiled swimming pool with steps, a rail and two loungers |
| 20 | `surf-shop` | ร้านเช่ากระดานโต้คลื่น | 2×2 | building | c3 | window | small shop with surfboards leaning on the front and a wave sign |
| 21 | `changing-rooms` | ห้องอาบน้ำเปลี่ยนชุด | 2×2 | facility | c3 | — | row of beach cabins with doors and an outdoor shower post |
| 22 | `beach-fruit-cart` | รถเข็นผลไม้ชายหาด | 1×2 | food | c3 | — | glass-box fruit cart with pineapple, watermelon and mango under an umbrella |
| 23 | `dive-shop` | ร้านอุปกรณ์ดำน้ำ | 1×2 | building | c3 | — | kiosk with masks, snorkels and flippers on a rack |
| 24 | `towel-rack` | ราวตากผ้าเช็ดตัว | 1×2 | decoration | c3 | wave | wooden rack with striped towels drying; the towels ripple |
| 25 | `little-crab` | ปูน้อย | 1×1 | animal | c3 | — | a red cartoon crab with raised claws next to a small hole |
| 26 | `turtle-nest` | ลูกเต่าทะเลกับรัง | 1×1 | animal | c3 | — | a sand nest with two baby sea turtles heading out |
| 27 | `lifebuoy-post` | เสาห่วงชูชีพ | 1×1 | facility | c3 | — | wooden post holding a red-and-white life ring |
| 28 | `beach-bungalow` | บ้านพักริมหาด | 2×3 | building | c4 | window | wooden bungalow on stilts with a thatched roof, a veranda and steps |
| 29 | `rock-pool` | แอ่งหินมีปู | 2×2 | nature | c4 | water | ring of grey rocks holding a shallow pool with a crab, a starfish and seaweed |
| 30 | `sea-swing` | ชิงช้าริมทะเล | 2×2 | play | c4 | swing | rope swing hanging from a big driftwood frame; the seat swings |
| 31 | `pedal-boat` | เรือถีบ | 1×2 | vehicle | c4 | water | swan-shaped pedal boat on a patch of water |
| 32 | `beach-buggy` | รถบักกี้ชายหาด | 1×2 | vehicle | c4 | — | chunky open beach buggy with big tyres |
| 33 | `fish-bin` | ถังขยะรูปปลา | 1×1 | facility | c4 | — | fish-shaped bin with an open mouth as the slot |
| 34 | `tiki-torch` | คบเพลิงไม้ | 1×1 | decoration | c4 | breathe | bamboo torch post with a flame that glows and breathes at night |
| 35 | `anchor` | สมอเรือ | 1×1 | decoration | c4 | — | big old anchor resting against a coil of rope |
| 36 | `water-slide` | สไลเดอร์น้ำ | 2×3 | ride | c5 | water (pool) | tall twisting water slide ending in a splash pool |
| 37 | `volleyball-court` | สนามวอลเลย์บอลชายหาด | 2×3 | play | c5 | — | sand court with rope lines, a net on two posts and a ball |
| 38 | `beach-pavilion` | ศาลาไม้ | 2×2 | seating | c5 | — | open wooden pavilion with a pitched roof and benches (not a religious sala) |
| 39 | `shell-ice-cream` | ร้านไอศกรีมเปลือกหอย | 2×2 | food | c5 | window | ice-cream kiosk shaped like a big spiral shell, cone sign on top |
| 40 | `bbq-grill` | เตาบาร์บีคิว | 1×2 | food | c5 | breathe | barbecue grill with skewers and glowing coals, a small table |
| 41 | `welcome-sign` | ป้ายต้อนรับ | 1×2 | decoration | c5 | — | arched wooden sign on two posts decorated with shells and a sun (no text) |
| 42 | `surfboard` | กระดานโต้คลื่นปักทราย | 1×1 | decoration | c5 | — | colourful surfboard standing upright in the sand |
| 43 | `sand-flag` | ธงปักกองทราย | 1×1 | decoration | c5 | wave | sand mound with a small triangular flag (not a national flag) |
| 44 | `beach-hotel` | โรงแรมริมหาด | 2×3 | building | c6 | window | three-storey white hotel with balconies, blue railings and a palm by the door |
| 45 | `pirate-play-ship` | สนามเด็กเล่นเรือโจรสลัด | 2×2 | play | c6 | wave | wooden play ship with a slide, a mast and a striped flag (no skull) |
| 46 | `float-raft` | แพเป่าลมในน้ำตื้น | 2×2 | play | c6 | water | colourful inflatable raft floating in a patch of shallow water |
| 47 | `bonfire` | กองไฟชายหาด | 1×2 | decoration | c6 | breathe | ring of stones with a small fire and log seats; the fire glows and breathes |
| 48 | `flamingo-float` | ห่วงยางฟลามิงโก | 1×2 | play | c6 | water | pink flamingo swim ring floating in a patch of water |
| 49 | `jet-ski` | เจ็ตสกีจอดริมน้ำ | 1×2 | vehicle | c6 | water | jet ski moored at the water's edge |
| 50 | `seagull-post` | นกนางนวลบนเสา | 1×1 | animal | c6 | — | wooden post with a white seagull on top |
| 51 | `coconut-pile` | กองมะพร้าว | 1×1 | food | c6 | — | pile of green and brown coconuts, one opened with a straw |
| 52 | `mini-umbrella` | ร่มเล็กกับเก้าอี้ | 1×1 | seating | c6 | — | small beach umbrella over a folding chair |
| 53 | `ferry-dock` | ท่าเรือเฟอร์รี่ | 2×3 | vehicle | c7 | water | concrete jetty with a small white-and-blue ferry moored beside it |
| 54 | `turtle-nursery` | บ่ออนุบาลเต่าทะเล | 2×2 | animal | c7 | water | shallow tiled pools with baby turtles and a little conservation sign (picture only) |
| 55 | `van-cafe` | ร้านกาแฟรถตู้ | 2×2 | food | c7 | — | pastel camper van with a side hatch, a table and an umbrella beside it |
| 56 | `kite-stall` | แผงขายว่าว | 1×2 | building | c7 | sway | stall with kites flying on poles above it; the kites sway |
| 57 | `squid-grill` | ร้านปลาหมึกย่าง | 1×2 | food | c7 | breathe | Thai grilled-squid cart with skewers over glowing charcoal |
| 58 | `seahorse-statue` | รูปปั้นม้าน้ำ | 1×1 | decoration | c7 | — | friendly seahorse statue on a shell plinth (not a deity) |
| 59 | `buoy` | ทุ่นลอยน้ำ | 1×1 | decoration | c7 | water | red-and-white buoy floating in a small patch of water |
| 60 | `sea-pandanus` | ต้นเตยทะเล | 1×1 | nature | c7 | sway | screwpine with stilt roots and spiky leaves |
