# s7 report
greenhouse-dome 936/3200 (window), robot-workshop 608/2400 (window), ufo-visitor 648/2400 (blink rim lights), comms-tower 700/2400 (blink top light), cargo-crane 200/1600 (still), crate-stack 528/1600 (still), alien-buddy 448/1200 (blink antenna tips), space-plant 284/1200 (breathe bulbs). No moving parts, so no pivots.

## Fix round 1
- ufo-visitor: 4 blink lights moved to the outer band face (radius 0.95); hidden pilot removed.
- greenhouse-dome: walls plain mint; glow only on 3 small deep-green panes per side, strip and bulbs deep leaf/own colours.
- alien-buddy: scaled by 0.55 (about 0.4 with antennae), bigger eyes, on a little rock base.
- space-plant: pink bulb now purple. robot-workshop: skylight teal glow. comms-tower: top light lowered (TOP_Y 1.85), orange bulb with red glow. crate-stack: 2x2 squarely stacked, no overhang or gap.
- Test: `npx vitest run src/themes/space/batches/s7.test.ts` -> Tests 3 passed (3); tsc: no errors in s7 files. Shots re-taken (day 1-2, night 1-2).
