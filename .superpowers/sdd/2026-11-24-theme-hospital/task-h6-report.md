# Task h6 report (services batch)

Triangles (gallery): pharmacy-counter 1024, lab-bench 1816, supply-room 676, linen-cart 960, food-trolley 1108, cleaning-cart 1144, fire-extinguisher 468, wet-floor-sign 276. All inside budget.

- pharmacy-counter: long counter with glass panes, wall of colourful boxes, green plus in a white circle on top. Animation: window (glass panes glow). No pivot.
- lab-bench: bench with 2 microscopes, rack of 5 bright tubes, flasks, cupboard with bottles; open centrifuge. Animation: spin; pivot [CENT.x, 0.79, CENT.z], one shared SPIN object on the rotor plate, hub and 5 coloured tube holders.
- supply-room: light stone shelf (1.2 tall) with boxes, towels, bright boxes on top and a leaning ladder. Still.
- linen-cart: chrome cart with folded sheets and pillows. Still.
- food-trolley: two decks, covered trays, fruit bowl. Still.
- cleaning-cart: yellow mop bucket and mop, blue bucket, spray bottles, cloths. Still.
- fire-extinguisher: red extinguisher on stand, flame-and-extinguisher sign, no text. Still.
- wet-floor-sign: yellow A-frame with a blue water drop. Still.

## Fix round 1
1. Centrifuge: lid dome removed; open rotor (stone plate, yellow hub, five coloured tube holders) on one SPIN pivot, so the turn is visible from above.
2. Centrifuge moved to x -0.25 (drum x -0.52..0.02), clear of the cupboard front (x -0.57); rotor radius 0.2 stays inside the drum and clear of all still parts over a full turn.
3. Supply room: stone top and end panels, shelf 1.2, bright boxes on top, boxes, towels lower; ladder shortened.
4. Mop top 1.595 (<1.6); wheels lifted to y 0.07608 (bottom 0); pharmacy panes glow brass instead of windowWarm.
Shots: p1-day/p2-day/p1-night re-shot attempts failed at the end (dev page did not load, likely another agent mid-edit in src/render); earlier day/night shots showed the supply-room and lab changes; the final pane colour was not seen at night.
