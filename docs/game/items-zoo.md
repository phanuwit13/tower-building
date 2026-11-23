# Zoo theme (สวนสัตว์): item list

The full list of zoo items (60, owner-approved 2026-11-23: the proposed 50 plus 10 the owner asked for):
**19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3**. The mix is checked by simulation on the 20 × 20 map (`src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/zoo/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/zoo/batches/zN.ts`).

Animation key: **sway** (wind), **wave** (flags), **water**, **spin** / **swing** (moving parts), lights **breathe** / **window**.

Content rules for this theme: every animal is a friendly, rounded cartoon animal (big eyes, simple shapes) — no animal hunting, eating another, bleeding or baring teeth; big cats rest or lounge. Enclosures are low fences, rocks and water, never cages that look like prisons; the clinic has no red cross on white. No copyrighted characters; no religious or royal imagery. Animals are part of their enclosure item (no separate animal items except where the row says so).

| # | id | Thai name | Footprint | Category | Batch | Animation | Description (what it looks like, key parts) |
|---|---|---|---|---|---|---|---|
| 1 | `penguin-pool` | บ่อเพนกวิน | 2×3 | animal | z1 | water | icy-blue pool with white rock ledges and a little slide; four penguins on the rocks, one in the water |
| 2 | `giraffe-yard` | ลานยีราฟ | 2×3 | animal | z1 | sway | sandy yard with two giraffes beside a tall feeding platform and an acacia; the acacia crown sways |
| 3 | `lion-rock` | โขดหินสิงโต | 2×2 | animal | z1 | — | big flat sunning rock on grass; a maned lion lounging on top, a lioness lying below |
| 4 | `zebra-paddock` | คอกม้าลาย | 2×2 | animal | z1 | — | low wooden fence round a dusty paddock, two striped zebras and a hay feeder |
| 5 | `zoo-tram` | รถรางชมสวนสัตว์ | 1×2 | vehicle | z1 | — | little open tram: engine with a striped canopy and one open carriage |
| 6 | `feed-kiosk` | ซุ้มขายอาหารสัตว์ | 1×2 | food | z1 | — | small kiosk with a thatched roof and bags of animal feed on the counter |
| 7 | `shaded-bench` | ม้านั่งใต้ซุ้ม | 1×2 | seating | z1 | sway | bench under a vine-covered pergola; the leaves sway |
| 8 | `shade-tree` | ต้นไม้ร่มใหญ่ | 1×1 | nature | z1 | sway | broad shady tree with a round dark-green crown |
| 9 | `acacia-tree` | ต้นอะคาเซีย | 1×1 | nature | z1 | sway | savanna tree with a flat, wide umbrella crown on a thin trunk |
| 10 | `elephant-yard` | คอกช้างมีสระ | 2×3 | animal | z2 | water | grassy yard with a bathing pool; a big elephant and a baby, a log to play with |
| 11 | `hippo-pool` | บ่อฮิปโป | 2×3 | animal | z2 | water | muddy-banked pool with two hippos, one half under the water with only eyes and ears showing |
| 12 | `kangaroo-yard` | ลานจิงโจ้ | 2×2 | animal | z2 | — | red-sand yard with a kangaroo (joey in the pouch) and a smaller one, a shady rock |
| 13 | `panda-bamboo` | ป่าไผ่แพนด้า | 2×2 | animal | z2 | sway | bamboo grove with a panda sitting and eating, another on a wooden platform; the bamboo sways |
| 14 | `info-board` | ป้ายข้อมูลสัตว์ | 1×2 | facility | z2 | — | wide board on two posts with an animal picture made of colour blocks (no text) |
| 15 | `parrot-perch` | นกแก้วบนคอน | 1×2 | animal | z2 | swing | T-perch on a stand with two bright parrots; the perch bar rocks gently |
| 16 | `direction-post` | เสาป้ายบอกทาง | 1×1 | facility | z2 | — | wooden post with arrow boards in different colours, each with a tiny animal silhouette |
| 17 | `penguin-bin` | ถังขยะรูปเพนกวิน | 1×1 | facility | z2 | — | penguin-shaped bin with an open beak as the slot |
| 18 | `water-station` | จุดเติมน้ำดื่ม | 1×1 | facility | z2 | — | blue water refill station with a tap and a little roof |
| 19 | `monkey-island` | เกาะลิง | 2×3 | animal | z3 | water, swing | island in a water moat with a climbing frame and ropes; monkeys on top, one swinging on a rope |
| 20 | `tortoise-pen` | คอกเต่ายักษ์ | 2×2 | animal | z3 | — | low stone wall round a grassy pen, two giant tortoises and a lettuce pile |
| 21 | `crocodile-pond` | บ่อจระเข้ | 2×2 | animal | z3 | water | reedy pond with a smiling green crocodile on the bank and one floating (mouth closed, friendly) |
| 22 | `reptile-tank` | ตู้กระจกงู | 1×2 | animal | z3 | window | glass tank on a stand with a branch and a cartoon snake coiled on it (friendly face) |
| 23 | `koi-pond` | บ่อปลาคาร์ป | 1×2 | animal | z3 | water | small stone-edged pond with orange-and-white koi and a lily pad |
| 24 | `meerkat-mound` | เนินเมียร์แคท | 1×2 | animal | z3 | — | sandy mound with burrow holes; three meerkats standing up on look-out |
| 25 | `elephant-statue` | รูปปั้นช้างน้อย | 1×1 | decoration | z3 | — | cute baby-elephant statue on a round plinth (not a religious statue) |
| 26 | `owl-stump` | นกฮูกบนตอไม้ | 1×1 | animal | z3 | — | tree stump with a round owl on top, big eyes |
| 27 | `bunny-hutch` | บ้านกระต่าย | 1×1 | animal | z3 | — | small hutch with a pitched roof and two rabbits in front |
| 28 | `zoo-gate` | ประตูทางเข้าสวนสัตว์ | 2×3 | building | z4 | wave | entrance arch made of two rock-and-wood towers with animal heads (giraffe, lion) on top, flags waving |
| 29 | `flamingo-pond` | บ่อนกฟลามิงโก | 2×2 | animal | z4 | water | shallow pond with pink flamingos, some on one leg |
| 30 | `bird-aviary` | กรงนกใหญ่ | 2×2 | animal | z4 | — | tall dome of thin net frames with a tree and colourful birds inside |
| 31 | `otter-stream` | ลำธารนาก | 1×2 | animal | z4 | water | little stream between rocks with two otters, one floating on its back |
| 32 | `camel-pen` | คอกอูฐ | 1×2 | animal | z4 | — | sandy pen with a two-humped camel and a palm-leaf shade |
| 33 | `duck-tub` | เป็ดในอ่าง | 1×1 | animal | z4 | water | round wooden tub of water with three ducks |
| 34 | `banana-crate` | ลังกล้วย | 1×1 | food | z4 | — | wooden crate piled with bunches of bananas |
| 35 | `flower-bush` | พุ่มดอกไม้ | 1×1 | nature | z4 | sway | round bush covered in bright flowers |
| 36 | `aquarium` | อควาเรียม | 2×3 | building | z5 | window | blue building with a curved glass front showing fish and a big wave-shaped roof |
| 37 | `butterfly-house` | บ้านผีเสื้อ | 2×3 | building | z5 | window | glass-dome greenhouse with plants and big colourful butterflies on the outside |
| 38 | `petting-farm` | ฟาร์มแพะลูบได้ | 2×2 | animal | z5 | — | red barn corner with a fenced yard, goats and a sheep, a hay bale |
| 39 | `zoo-cafe` | ร้านอาหารสวนสัตว์ | 2×2 | food | z5 | window | café with a leaf-shaped roof, tables with umbrellas outside |
| 40 | `ostrich-pen` | คอกนกกระจอกเทศ | 1×2 | animal | z5 | — | sandy pen with an ostrich and two eggs in a nest |
| 41 | `bamboo-clump` | กอไผ่ | 1×2 | nature | z5 | sway | dense clump of bamboo stalks with leaves |
| 42 | `fish-feeder` | ตู้อาหารปลาหยอดเหรียญ | 1×1 | facility | z5 | — | small coin-operated feed dispenser on a post, fish picture on the front |
| 43 | `garden-lamp` | ไฟสวน | 1×1 | decoration | z5 | breathe | wooden post lamp with a warm lantern |
| 44 | `polar-bear-cove` | อ่าวหมีขั้วโลก | 2×3 | animal | z6 | water | white ice-rock shelf above a cold blue pool, a polar bear and a cub on the ice |
| 45 | `zoo-shop` | ร้านของฝาก | 2×2 | building | z6 | window | shop with a big plush-animal sign, plushies in the window |
| 46 | `animal-clinic` | คลินิกสัตว์ | 2×2 | building | z6 | window | small clinic with a paw-print sign (no red cross), a little garden |
| 47 | `turnstiles` | ประตูหมุนทางเข้า | 1×2 | facility | z6 | — | row of three turnstiles under a striped roof |
| 48 | `water-trough` | รางน้ำสัตว์ | 1×2 | facility | z6 | water | long stone water trough with a pump |
| 49 | `koala-tree` | โคอาล่าบนต้นยูคาลิปตัส | 1×2 | animal | z6 | sway | eucalyptus tree with a koala hugging the trunk and one in the fork; leaves sway |
| 50 | `animal-balloons` | ลูกโป่งรูปสัตว์ | 1×1 | decoration | z6 | sway | post with a bunch of animal-shaped balloons (bear, elephant) |
| 51 | `binoculars` | กล้องส่องทางไกล | 1×1 | facility | z6 | — | coin-operated viewing binoculars on a stand |
| 52 | `lizard-rock` | ก้อนหินมีกิ้งก่า | 1×1 | animal | z6 | — | warm rock with a green lizard sunbathing |
| 53 | `rhino-yard` | ลานแรด | 2×3 | animal | z7 | water | dusty yard with a mud wallow, a rhino and a baby rhino |
| 54 | `tiger-den` | ถ้ำเสือ | 2×2 | animal | z7 | — | rocky den with a tiger asleep on a ledge in the sun, ferns around |
| 55 | `seal-pool` | สระแมวน้ำ | 2×2 | animal | z7 | water | round pool with a show platform; a seal balancing a ball on its nose |
| 56 | `pony-ride` | ม้าโพนี่วนรอบเสา | 1×2 | ride | z7 | spin | small ring with a centre post and two ponies with saddles on arms; arms + ponies spin slowly |
| 57 | `peacock-lawn` | สนามนกยูง | 1×2 | animal | z7 | — | lawn with a peacock showing its fanned tail and a peahen |
| 58 | `sloth-branch` | สลอธห้อยกิ่งไม้ | 1×1 | animal | z7 | sway | wooden frame with a branch, a sleepy sloth hanging from it; branch + sloth sway |
| 59 | `hedgehog-log` | เม่นแคระข้างขอนไม้ | 1×1 | animal | z7 | — | hollow log with a little hedgehog beside it and mushrooms |
| 60 | `toucan-post` | นกทูแคนบนเสา | 1×1 | animal | z7 | — | carved post with a toucan with a big orange beak on top |
