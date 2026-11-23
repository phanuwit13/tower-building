# s2 report
habitat-dome 2116/3200 window; command-center 740/3200 window + spinning dish (pivot at stand); airlock-hub 1764/2400 window; space-cafe 2108/2400 window+breathe lamp; tube-corridor 984/1600 window; air-tanks 1008/1600 still; base-lamp 424/1200 breathe; supply-crate 300/1200 still; helper-robot 448/1200 blink antenna, window face.
Tests: s2.test.ts 3/3. Shots in shots/s2.

## Fix round 1
- command-center: big dish r 0.3, tilt 0.35, stand 0.2 -> rim low point = ROOF + 0.2 - 0.3*sin(0.35) = ROOF + 0.097 (above roof over the full turn; spin pivot at dish centre). Small dish r 0.2, tilt 0.5, stand 0.15 -> ROOF + 0.054. Mast tip 1.76. Control-room windows smaller (2 panes, h 0.2).
- helper-robot: chunkier yellow body (r 0.19), big screen face, orange arms with hands, blue feet; top about 0.51.
- space-cafe: removed hidden pane and breathe lamp; added glowing warm ring at dome foot and teal belt ring; bigger portholes.
- habitat-dome: domes squashed along z (0.74) and spaced (CZ 0.86) so the link tube shows. supply-crate: labels flush, red diamond moved onto the orange box face.
- Test: `npx vitest run src/themes/space/batches/s2.test.ts` -> Tests 3 passed (3); tsc clean for s2 files.
