# Space theme (อวกาศ): item list

The full list of space items (60, owner-approved 2026-11-24): **19 × 1×1, 17 × 1×2, 14 × 2×2, 10 × 2×3** (`SPACE_MIX`, the shared mix, checked by simulation in `src/game/simulate.test.ts`). If you change this list, change the mix and re-run the test.

How to use it: one row = one item = one file `src/themes/space/items/<id>.ts`. The footprint is fixed (`w × d` at rotation 0, long side along z, front faces +x). Read `docs/game/sculpting.md` first (style kit, master palette only, triangle budget, item ground surfaces ≥ 0.02, animation options and limits, shared pivots). Batch = the sculptor batch that owns the item (`src/themes/space/batches/<batch>.ts`).

## The moon base
The space base: a friendly moon base on the moon ground (`moon`) — rockets, domes, rovers, robots, solar panels, craters and glowing crystals. Night is the base's showpiece: lit domes, beacons, landing lights and glowing crystals.

**No wind on the moon**: never `sway` or `wave`. Animation key: **spin** (radar and dishes, drills, rotors), **blink** (beacons, the UFO), **chase** (landing lights), **breathe** (crystals, lamps, space plants), **window** (lit domes and modules).

Content rules: no people (no astronauts) — robots and one friendly cartoon alien are fine; no national flags or real space-agency logos; no weapons, no lasers, no scary aliens; signs are pictures (stars, planets, arrows), never text or letters; bright toy-like colours.

## Items

| # | id | Thai name | Footprint | Category | Batch | Animation | Description |
|---|---|---|---|---|---|---|---|
| 1 | `launch-pad` | ฐานปล่อยจรวด | 2×3 | facility | s1 | blink | big rocket standing on a pad beside a gantry tower with blinking lights |
| 2 | `spaceport-runway` | ลานจอดยานอวกาศ | 2×3 | facility | s1 | chase | landing strip with a winged space plane and running edge lights |
| 3 | `fuel-tanks` | ถังเชื้อเพลิง | 2×2 | facility | s1 | — | three round fuel tanks with pipes and ladders |
| 4 | `landing-pad-small` | ลานจอดยานเล็ก | 2×2 | facility | s1 | blink | small round pad with a little shuttle and corner beacons |
| 5 | `mini-rocket` | จรวดเล็ก | 1×2 | vehicle | s1 | — | small striped rocket on a launch stand |
| 6 | `lunar-lander` | ยานลงจอด | 1×2 | vehicle | s1 | — | spider-legged lander with a gold body and a ladder |
| 7 | `fuel-pump` | ปั๊มเชื้อเพลิง | 1×1 | facility | s1 | window | fuel pump post with a hose and a lit gauge |
| 8 | `beacon` | สัญญาณไฟ | 1×1 | decoration | s1 | blink | tall pole with a blinking light on top |
| 9 | `mission-sign` | ป้ายภารกิจ | 1×1 | decoration | s1 | window | round sign with a star-and-planet picture that glows at night |
| 10 | `habitat-dome` | โดมที่พัก | 2×3 | building | s2 | window | two linked white domes with round windows, lit at night |
| 11 | `command-center` | ศูนย์ควบคุม | 2×3 | building | s2 | window | low module building with a glass control room and dishes on the roof |
| 12 | `airlock-hub` | ชุมทางประตูลม | 2×2 | building | s2 | window | round hub module with four round doors |
| 13 | `space-cafe` | คาเฟ่อวกาศ | 2×2 | food | s2 | window | glass dome café with tables inside and a giant cup on top |
| 14 | `tube-corridor` | ทางเดินอุโมงค์ | 1×2 | building | s2 | window | straight tube corridor with round windows that links modules |
| 15 | `air-tanks` | ถังอากาศ | 1×2 | facility | s2 | — | rack of blue and white air tanks |
| 16 | `base-lamp` | เสาไฟฐาน | 1×1 | decoration | s2 | breathe | futuristic lamp post that glows at night |
| 17 | `supply-crate` | กล่องเสบียง | 1×1 | decoration | s2 | — | stacked supply boxes with picture labels |
| 18 | `helper-robot` | หุ่นยนต์ผู้ช่วย | 1×1 | decoration | s2 | blink | friendly round robot with a screen face and a blinking antenna |
| 19 | `observatory` | หอดูดาว | 2×3 | building | s3 | spin | observatory with a big dome whose slit turns slowly, a telescope inside |
| 20 | `lab-module` | โมดูลห้องแล็บ | 2×2 | building | s3 | window | lab module with glass windows, tubes and a rock sample table |
| 21 | `telescope-array` | กล้องโทรทรรศน์วิทยุ | 2×2 | facility | s3 | — | three small radio dishes in a row |
| 22 | `radar-dish` | จานเรดาร์ | 2×2 | facility | s3 | spin | big radar dish on a tower that turns slowly |
| 23 | `satellite-stand` | ดาวเทียม | 1×2 | decoration | s3 | — | satellite on a display stand with gold foil and solar wings |
| 24 | `star-telescope` | กล้องดูดาว | 1×2 | decoration | s3 | — | big telescope on a tripod pointing up |
| 25 | `mini-dish` | จานรับสัญญาณเล็ก | 1×1 | facility | s3 | spin | small dish on a post that turns |
| 26 | `sensor-pole` | เสาเซ็นเซอร์ | 1×1 | facility | s3 | blink | tall pole with sensor boxes and a blinking light |
| 27 | `antenna` | เสาอากาศ | 1×1 | facility | s3 | — | thin antenna mast with cross bars |
| 28 | `rover-garage` | โรงจอดยานสำรวจ | 2×3 | building | s4 | window | curved hangar with a rover inside and a lit doorway |
| 29 | `cargo-lander` | ยานขนส่งลงจอด | 2×2 | vehicle | s4 | blink | boxy cargo lander with a ramp down and blinking lights |
| 30 | `moon-rover` | รถสำรวจ | 1×2 | vehicle | s4 | — | six-wheeled rover with a camera mast and a solar panel |
| 31 | `moon-buggy` | รถบักกี้ | 1×2 | vehicle | s4 | — | open moon buggy with big mesh wheels and a dish |
| 32 | `hover-sled` | ยานลอยตัว | 1×2 | vehicle | s4 | breathe | sleek hover sled with glowing pads underneath |
| 33 | `drone-pad` | ลานโดรน | 1×2 | facility | s4 | spin | pad with two drones, one with turning rotors |
| 34 | `cargo-robot` | หุ่นยนต์ขนของ | 1×2 | vehicle | s4 | — | tracked robot carrying a stack of crates |
| 35 | `rover-charger` | สถานีชาร์จรถ | 1×1 | facility | s4 | window | charging post with a lit screen and a cable |
| 36 | `robot-dog` | หุ่นยนต์สุนัข | 1×1 | animal | s4 | blink | cute robot dog with antenna ears and a blinking nose |
| 37 | `solar-farm` | ฟาร์มแผงโซลาร์ | 2×3 | facility | s5 | — | rows of tilted solar panels with a little control box |
| 38 | `mining-rig` | แท่นขุดแร่ | 2×3 | facility | s5 | spin | drilling rig with a turning drill and a pile of shiny ore |
| 39 | `water-recycler` | โรงรีไซเคิลน้ำ | 2×2 | facility | s5 | window | tanks and pipes around a lit control module |
| 40 | `solar-panel-row` | แถวแผงโซลาร์ | 1×2 | facility | s5 | — | three solar panels on stands |
| 41 | `battery-bank` | ชุดแบตเตอรี่ | 1×2 | facility | s5 | window | row of battery cabinets with glowing level bars |
| 42 | `ore-conveyor` | สายพานลำเลียงแร่ | 1×2 | facility | s5 | — | short conveyor carrying chunks of glittering ore |
| 43 | `trash-bot` | หุ่นยนต์เก็บขยะ | 1×1 | decoration | s5 | — | little bin-shaped robot with arms |
| 44 | `ice-block` | ก้อนน้ำแข็งดวงจันทร์ | 1×1 | nature | s5 | — | blue ice block dug out of the ground |
| 45 | `ice-crater` | หลุมน้ำแข็ง | 2×3 | nature | s6 | — | wide crater with frozen blue ice at the bottom and rocks on the rim |
| 46 | `big-crater` | หลุมอุกกาบาต | 2×2 | nature | s6 | — | round crater with a raised rim |
| 47 | `moon-rocks` | กองหินดวงจันทร์ | 2×2 | nature | s6 | — | cluster of grey and lilac boulders |
| 48 | `landing-lights` | แนวไฟนำร่อง | 1×2 | decoration | s6 | chase | row of ground lights that run in a line |
| 49 | `crystal-cluster` | ผลึกเรืองแสง | 1×1 | nature | s6 | breathe | cluster of glowing purple and cyan crystals |
| 50 | `moon-boulder` | ก้อนหินยักษ์ | 1×1 | nature | s6 | — | one big round boulder |
| 51 | `small-crater` | หลุมเล็ก | 1×1 | nature | s6 | — | small crater with a little rim |
| 52 | `meteorite` | อุกกาบาต | 1×1 | nature | s6 | breathe | dark meteorite in a small crater with a faint glowing crack |
| 53 | `greenhouse-dome` | โดมปลูกผัก | 2×3 | nature | s7 | window | big glass dome with green plants, lit at night |
| 54 | `robot-workshop` | โรงซ่อมหุ่นยนต์ | 2×2 | building | s7 | window | workshop module with a robot arm and spare parts |
| 55 | `ufo-visitor` | จานบินมาเยือน | 2×2 | vehicle | s7 | blink | friendly flying saucer landed on legs with blinking lights |
| 56 | `comms-tower` | เสาสื่อสาร | 2×2 | facility | s7 | blink | lattice tower with dishes and a blinking top light |
| 57 | `cargo-crane` | เครนยกของ | 1×2 | facility | s7 | — | small crane lifting a crate |
| 58 | `crate-stack` | กองตู้คาร์โก้ | 1×2 | decoration | s7 | — | stacked cargo containers in bright colours |
| 59 | `alien-buddy` | เพื่อนต่างดาว | 1×1 | animal | s7 | blink | small friendly green alien with big eyes and antennae that blink |
| 60 | `space-plant` | ต้นไม้อวกาศ | 1×1 | nature | s7 | breathe | alien plant with glowing bulb flowers |
