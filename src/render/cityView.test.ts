// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { AppState } from '../app/controller';
import { demoFullGame } from '../game/demo';
import { newGame, placeCurrent } from '../game/game';
import { buildOccupancy, canPlace, rotatedFootprint } from '../game/grid';
import type { GameState } from '../game/types';
import { getStyleKit } from '../models/kit';
import { getCatalog, getTheme } from '../themes/registry';
import { CHUNKS_PER_SIDE } from './batch';
import { createCityView, GHOST_INVALID, HOVER_OPACITY, MARK_INK, OPACITY, rotateMarkAt, STEADY_TURN_TILES } from './city';
import { BLOOM, type Stage } from './stage';

const kit = getStyleKit();
const catalog = getCatalog('school')!;
const settings = { weather: 'sunny', time: 'day', ground: 'grass' } as const;

function setup() {
  const scene = new THREE.Scene();
  const invalidateShadows = vi.fn();
  const stage = { scene, invalidateShadows } as unknown as Stage;
  const view = createCityView(stage, kit, getTheme);
  const root = scene.getObjectByName('city')!;
  /** The merged item meshes (the ghost and its marker are separate children). */
  const chunkMeshes = () => root.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.name.startsWith('city-'));
  return { view, root, chunkMeshes, invalidateShadows };
}

const state = (game: GameState | null, ghost: AppState['ghost'] = null): AppState => ({
  screen: game ? (game.status === 'finished' ? 'finished' : 'playing') : 'theme-select',
  game, ghost, rotation: 0, quality: 'smooth', saveFailed: false,
  floor: { open: false, pick: 'eraser', tool: 'paint', preview: null }, cities: {},
});

/** Place the current item at the first spot it fits. */
function placeAnywhere(game: GameState): GameState {
  const occ = buildOccupancy(game.placements, catalog);
  const fp = catalog.items[game.current].footprint;
  for (const r of [0, 1] as const) {
    for (let z = 0; z < 20; z++) for (let x = 0; x < 20; x++) if (canPlace(occ, fp, r, x, z)) return placeCurrent(game, catalog, x, z, r)!;
  }
  throw new Error('no spot');
}

const vertices = (meshes: THREE.Mesh[]) => meshes.reduce((n, m) => n + m.geometry.attributes.position.count, 0);

describe('city view batching', () => {
  const full = demoFullGame(catalog, settings, 1);

  it('draws a full map (143 items) in at most one body and one glow mesh per chunk, every vertex kept', () => {
    const { view, chunkMeshes } = setup();
    view.sync(state(full));
    const meshes = chunkMeshes();
    expect(meshes.length).toBeLessThanOrEqual(2 * CHUNKS_PER_SIDE ** 2);
    expect(meshes.length).toBeGreaterThanOrEqual(CHUNKS_PER_SIDE ** 2); // every chunk has items
    let expected = 0;
    for (const p of full.placements) {
      getTheme('school')!.items.find((i) => i.id === p.itemId)!.build(kit)
        .traverse((o) => { if (o instanceof THREE.Mesh) expected += o.geometry.attributes.position.count; });
    }
    expect(vertices(meshes)).toBe(expected);
  });

  it('a placement re-merges only its own chunk and asks for one shadow update', () => {
    const { view, chunkMeshes, invalidateShadows } = setup();
    view.sync(state(full));
    const before = new Map(chunkMeshes().map((m) => [m.name, m.geometry]));
    invalidateShadows.mockClear();
    view.sync(state(placeAnywhere(full)));
    const changed = chunkMeshes().filter((m) => before.get(m.name) !== m.geometry);
    expect(changed.length).toBeGreaterThanOrEqual(1);
    expect(new Set(changed.map((m) => m.name.split('-')[1])).size).toBe(1); // one chunk (its body and maybe glow)
    expect(invalidateShadows).toHaveBeenCalledTimes(1);
    expect(view.lastBuildMs()).toBeGreaterThanOrEqual(0);
  });

  it('moving the ghost or changing the weather neither re-merges nor updates shadows', () => {
    const { view, chunkMeshes, invalidateShadows } = setup();
    view.sync(state(full));
    const geometries = chunkMeshes().map((m) => m.geometry);
    invalidateShadows.mockClear();
    view.sync(state(full, { x: 3, z: 3, rotation: 0, valid: false }));
    view.sync(state(full, { x: 4, z: 3, rotation: 1, valid: false }));
    view.sync(state({ ...full, settings: { ...settings, weather: 'rain', time: 'night' } }));
    expect(chunkMeshes().map((m) => m.geometry)).toEqual(geometries);
    expect(invalidateShadows).not.toHaveBeenCalled();
  });

  it('restart and clear remove every merged mesh, dispose their geometry and update shadows', () => {
    const { view, chunkMeshes, invalidateShadows } = setup();
    view.sync(state(full));
    let disposed = 0;
    for (const m of chunkMeshes()) m.geometry.addEventListener('dispose', () => disposed++);
    const count = chunkMeshes().length;
    invalidateShadows.mockClear();
    view.sync(state(newGame(catalog, settings, 5))); // restart: same theme, no placements
    expect(chunkMeshes()).toHaveLength(0);
    expect(disposed).toBe(count);
    expect(invalidateShadows).toHaveBeenCalledTimes(1);

    view.sync(state(placeAnywhere(newGame(catalog, settings, 5))));
    expect(chunkMeshes().length).toBeGreaterThan(0);
    view.sync(state(null)); // clear
    expect(chunkMeshes()).toHaveLength(0);
  });

  it('a reloaded save showing the same city keeps the batch', () => {
    const { view, chunkMeshes, invalidateShadows } = setup();
    view.sync(state(full));
    const geometries = chunkMeshes().map((m) => m.geometry);
    invalidateShadows.mockClear();
    view.sync(state(JSON.parse(JSON.stringify(full)) as GameState));
    expect(chunkMeshes().map((m) => m.geometry)).toEqual(geometries);
    expect(invalidateShadows).not.toHaveBeenCalled();
  });

  it('the ghost still shows the current item, built from its own prototype', () => {
    const { view, root } = setup();
    view.sync(state(full, { x: 0, z: 0, rotation: 0, valid: false }));
    const ghost = root.getObjectByName('ghost')!;
    expect(ghost.visible).toBe(true);
    expect(view.ghostBox()).not.toBeNull();
    let ghostMeshes = 0;
    ghost.traverse((o) => { if (o instanceof THREE.Mesh && o.material !== kit.materials.body && o.material !== kit.materials.glow) ghostMeshes++; });
    expect(ghostMeshes).toBeGreaterThan(1); // footprint fill + the item model in ghost material
  });

  it('a placeable ghost shows the item in its own colours, faded; a blocked one turns red', () => {
    const { view, root } = setup();
    const game = newGame(catalog, settings, 3);
    const ghost = () => root.getObjectByName('ghost')!;
    /** The item model's colour meshes (not the footprint, not the depth-only twins). */
    const colourMeshes = () => {
      const out: THREE.Mesh[] = [];
      ghost().children.find((c) => !(c instanceof THREE.Mesh) && !(c instanceof THREE.LineLoop))!
        .traverse((o) => { if (o instanceof THREE.Mesh && (o.material as THREE.Material).colorWrite !== false) out.push(o); });
      return out;
    };
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const meshes = colourMeshes();
    expect(meshes.length).toBeGreaterThan(0);
    for (const m of meshes) {
      const mat = m.material as THREE.MeshStandardMaterial;
      expect(mat.vertexColors).toBe(true); // the item's own palette colours
      expect(mat.color.getHex()).toBe(0xffffff); // untinted
      expect(mat.transparent).toBe(true);
      expect(mat.opacity).toBe(OPACITY.valid.body);
      expect(m.geometry.getAttribute('color')).toBeDefined();
      // A depth-only twin drawn first keeps the item's back walls from showing through its front.
      const twin = m.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh)!;
      expect(twin.geometry).toBe(m.geometry);
      expect((twin.material as THREE.Material).colorWrite).toBe(false);
      expect(twin.renderOrder).toBeLessThan(m.renderOrder);
    }

    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: false }));
    for (const m of colourMeshes()) {
      const mat = m.material as THREE.MeshLambertMaterial;
      expect(mat.vertexColors).toBe(false);
      expect(mat.color.getHex()).toBe(GHOST_INVALID);
    }
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    expect(colourMeshes().map((m) => m.material)).toEqual(meshes.map((m) => m.material));
  });

  it('a merge that throws leaves the view out of sync, so the next sync rebuilds in full', () => {
    let failOnce = true;
    const flaky = (id: string) => {
      const t = getTheme(id);
      if (!t) return t;
      return {
        ...t,
        items: t.items.map((it) => ({
          ...it,
          build: (k: typeof kit) => {
            if (failOnce) { failOnce = false; throw new Error('merge boom'); }
            return it.build(k);
          },
        })),
      };
    };
    const scene = new THREE.Scene();
    const stage = { scene, invalidateShadows: vi.fn() } as unknown as Stage;
    const view = createCityView(stage, kit, flaky);
    const meshes = () => scene.getObjectByName('city')!.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.name.startsWith('city-'));
    expect(() => view.sync(state(full))).toThrow('merge boom');
    view.sync(state(full)); // same placements: must not be skipped as 'same'
    const ref = setup();
    ref.view.sync(state(full));
    expect(vertices(meshes())).toBe(vertices(ref.chunkMeshes()));
    expect(meshes().length).toBeGreaterThan(0);
  });
});

describe('setHover', () => {
  const hoverAt = (valid: boolean, x = 3) => ({
    themeId: 'school', itemId: catalog.order[0], p: { x, z: 4, rotation: 0 as const, valid },
  });
  const meshes = (o: THREE.Object3D): THREE.Mesh[] => {
    const out: THREE.Mesh[] = [];
    o.traverse((c) => { if (c instanceof THREE.Mesh) out.push(c); });
    return out;
  };

  it('shows at the given spot and hides on null', () => {
    const { view, root } = setup();
    const hover = root.getObjectByName('hover')!;
    expect(hover.visible).toBe(false);
    const h = hoverAt(true);
    view.setHover(h);
    expect(hover.visible).toBe(true);
    expect(hover.position.x).toBeGreaterThan(h.p.x);
    expect(hover.position.z).toBeGreaterThan(h.p.z);
    view.setHover(null);
    expect(hover.visible).toBe(false);
  });

  it('is hidden while a capture suppresses the ghost, and returns after', () => {
    const { view, root } = setup();
    const hover = root.getObjectByName('hover')!;
    view.setHover(hoverAt(true));
    view.setGhostVisible(false);
    expect(hover.visible).toBe(false);
    view.setHover(hoverAt(true, 5));
    expect(hover.visible).toBe(false);
    view.setGhostVisible(true);
    expect(hover.visible).toBe(true);
  });

  it('casts and receives no shadows, and reuses its materials across calls', () => {
    const { view, root } = setup();
    const hover = root.getObjectByName('hover')!;
    view.setHover(hoverAt(true));
    const first = meshes(hover).map((m) => m.material);
    for (const m of meshes(hover)) {
      expect(m.castShadow).toBe(false);
      expect(m.receiveShadow).toBe(false);
    }
    view.setHover(hoverAt(false, 8));
    view.setHover(hoverAt(true, 2));
    const again = meshes(hover).map((m) => m.material);
    expect(again).toEqual(first);
    expect(first.length).toBeGreaterThan(0);
  });

  it('shows the item in its own colours, fainter than the ghost; red where it cannot go', () => {
    const { view, root } = setup();
    const colour = () => meshes(root.getObjectByName('hover')!)
      .filter((m) => (m.material as THREE.Material).colorWrite !== false && m.renderOrder === 4);
    view.setHover(hoverAt(true));
    expect(colour().length).toBeGreaterThan(0);
    for (const m of colour()) {
      const mat = m.material as THREE.MeshStandardMaterial;
      expect(mat.vertexColors).toBe(true);
      expect(mat.opacity).toBe(HOVER_OPACITY.valid.body);
      expect(mat.opacity).toBeLessThan(OPACITY.valid.body);
    }
    view.setHover(hoverAt(false, 8));
    for (const m of colour()) expect((m.material as THREE.MeshLambertMaterial).color.getHex()).toBe(GHOST_INVALID);
  });

  it('is fainter than the ghost, and never touches the locked ghost', () => {
    const { view, root } = setup();
    view.setHover(hoverAt(false));
    const mat = (meshes(root.getObjectByName('hover')!)[0].material as THREE.Material);
    expect(mat.opacity).toBeLessThan(0.75);
    expect(root.getObjectByName('ghost')!.visible).toBe(false);
  });
});

describe('checkMark (the ✓ as a tap target)', () => {
  const game = newGame(catalog, settings, 3);
  const fp = catalog.items[game.current].footprint;

  it('over a valid ghost: centred over its footprint, above the item, with a drawn size', () => {
    const { view, root } = setup();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const mark = view.checkMark();
    expect(mark).not.toBeNull();
    expect(mark!.center.x).toBeCloseTo(4 + fp.w / 2);
    expect(mark!.center.z).toBeCloseTo(6 + fp.d / 2);
    expect(mark!.center.y).toBeGreaterThan(view.ghostBox()!.max.y); // floats above the item
    expect(mark!.size).toBeGreaterThan(1);
    const sprite = root.children.find((c): c is THREE.Points => c instanceof THREE.Points)!;
    expect(mark!.center.equals(sprite.position)).toBe(true); // where the ✓ is drawn
    expect(mark!.size).toBeLessThanOrEqual((sprite.material as THREE.PointsMaterial).size);
  });

  it('stays put while a non-square ghost turns again and again (the rotate button never slips away); a move recentres it', () => {
    const { view } = setup();
    const id = catalog.order.find((i) => { const f = catalog.items[i].footprint; return f.w * f.d === 6; })!;
    const g0: GameState = { ...newGame(catalog, settings, 3), current: id };
    const fp = catalog.items[id].footprint;
    type G = NonNullable<AppState['ghost']>;
    // The controller's turn (controller.ts rotateGhost): the pivot tile stays, the corner moves.
    const turn = (p: G): G => {
      const old = rotatedFootprint(fp, p.rotation);
      const px = p.x + Math.floor((old.w - 1) / 2);
      const pz = p.z + Math.floor((old.d - 1) / 2);
      const r = ((p.rotation + 1) % 4) as G['rotation'];
      const nw = rotatedFootprint(fp, r);
      return { x: px - Math.floor((nw.w - 1) / 2), z: pz - Math.floor((nw.d - 1) / 2), rotation: r, valid: true };
    };
    const centre = (p: G) => { const { w, d } = rotatedFootprint(fp, p.rotation); return { x: p.x + w / 2, z: p.z + d / 2 }; };
    let p: G = { x: 6, z: 6, rotation: 0, valid: true };
    view.sync(state(g0, p));
    const at = view.checkMark()!.center.clone();
    let shifted = 0;
    for (let i = 0; i < 4; i++) {
      p = turn(p);
      const c = centre(p);
      if (Math.hypot(c.x - at.x, c.z - at.z) > 0.1) shifted++;
      expect(Math.hypot(c.x - at.x, c.z - at.z)).toBeLessThanOrEqual(STEADY_TURN_TILES);
      view.sync(state(g0, p));
      expect(view.checkMark()!.center.equals(at)).toBe(true);
    }
    expect(shifted).toBeGreaterThan(0); // the item's centre really moves on a turn
    p = turn(p);
    view.sync(state(g0, p));
    view.sync(state({ ...g0 }, p)); // another state change, same ghost: still put
    expect(view.checkMark()!.center.equals(at)).toBe(true);
    p = { ...p, x: p.x + 1 }; // moved: back over the centre
    view.sync(state(g0, p));
    const c = centre(p);
    expect(view.checkMark()!.center.x).toBeCloseTo(c.x);
    expect(view.checkMark()!.center.z).toBeCloseTo(c.z);
  });

  it('a turn that lands far away (pushed in at the map edge) recentres instead', () => {
    const { view } = setup();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const before = view.checkMark()!.center.clone();
    view.sync(state(game, { x: 7, z: 6, rotation: 1, valid: true }));
    const { w, d } = rotatedFootprint(fp, 1);
    expect(view.checkMark()!.center.x).toBeCloseTo(7 + w / 2);
    expect(view.checkMark()!.center.z).toBeCloseTo(6 + d / 2);
    expect(view.checkMark()!.center.equals(before)).toBe(false);
  });

  it('a rotate button floats beside it, over a placeable and a blocked ghost alike; none without a ghost', () => {
    const { view, root } = setup();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 300);
    camera.position.set(24, 22, 24);
    camera.lookAt(10, 0, 10);
    camera.updateMatrixWorld(true);
    expect(view.rotateMark(camera)).toBeNull();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const check = view.checkMark()!;
    const rot = view.rotateMark(camera)!;
    expect(rot).not.toBeNull();
    expect(rot.size).toBeLessThan(check.size); // placing stays the main button
    // On screen: left of the ✓, level with it, the two discs not overlapping.
    const px = (p: THREE.Vector3) => { const v = p.clone().project(camera); return { x: (v.x + 1) * 400, y: (1 - v.y) * 400, depth: p.clone().applyMatrix4(camera.matrixWorldInverse).z * -1 }; };
    const a = px(check.center);
    const b = px(rot.center);
    expect(b.x).toBeLessThan(a.x);
    expect(Math.abs(b.y - a.y)).toBeLessThan(2);
    const radius = (size: number, depth: number) => (size * 800) / 4 / depth;
    expect(a.x - b.x).toBeGreaterThan(radius(check.size, a.depth) + radius(rot.size, b.depth));

    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: false }));
    expect(view.checkMark()).toBeNull(); // the ✗ cannot be tapped...
    expect(view.rotateMark(camera)).not.toBeNull(); // ...but turning may make it fit
    view.setGhostVisible(false);
    expect(view.rotateMark(camera)).toBeNull();
    expect(root.getObjectByName('rotate-mark')!.visible).toBe(false);
    view.setGhostVisible(true);
    expect(root.getObjectByName('rotate-mark')!.visible).toBe(true);
    view.sync(state(game, null));
    expect(view.rotateMark(camera)).toBeNull();
  });

  it('keeps the same screen gap to the ✓ at any distance, and turns with the view', () => {
    const anchor = new THREE.Vector3(10, 2, 10);
    const gapPx = (distance: number, azimuth: number) => {
      const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 300);
      camera.position.set(10 + distance * Math.sin(azimuth), 2 + distance * 0.8, 10 + distance * Math.cos(azimuth));
      camera.lookAt(anchor);
      camera.updateMatrixWorld(true);
      const a = anchor.clone().project(camera);
      const b = rotateMarkAt(anchor, camera).project(camera);
      return { dx: (a.x - b.x) * 400 * (distance / 20), dy: Math.abs(a.y - b.y) * 400 };
    };
    // Points shrink with distance just as the gap does: the gap in disc sizes stays the same.
    const near = gapPx(20, 0.3);
    const far = gapPx(40, 0.3);
    expect(far.dx).toBeCloseTo(near.dx, 0);
    expect(gapPx(20, 2.1).dx).toBeCloseTo(near.dx, 0); // left of the ✓ from any side
    expect(near.dy).toBeLessThan(1);
  });

  it('darkens the rotate button, not the ✓, while the mouse is on it', () => {
    const { view, root } = setup();
    const rot = root.getObjectByName('rotate-mark') as THREE.Points;
    const sprite = root.children.find((c): c is THREE.Points => c instanceof THREE.Points && c.name !== 'rotate-mark')!;
    const map = (p: THREE.Points) => (p.material as THREE.PointsMaterial).map;
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const rotNormal = map(rot);
    const checkNormal = map(sprite);
    view.setMarkHover('rotate');
    expect(map(rot)).not.toBe(rotNormal);
    expect(map(sprite)).toBe(checkNormal);
    view.setMarkHover('check');
    expect(map(rot)).toBe(rotNormal);
    expect(map(sprite)).not.toBe(checkNormal);
  });

  it('draws its ring and glyph just under the standard bloom threshold: crisp, and still white on the disc', () => {
    const ink = new THREE.Color(MARK_INK); // linear, as the bloom pass measures it
    const luminance = 0.299 * ink.r + 0.587 * ink.g + 0.114 * ink.b;
    expect(luminance).toBeLessThan(BLOOM.threshold);
    expect(luminance).toBeGreaterThan(0.75);
  });

  it('turns darker while the mouse is on it, and back after; the ✗ never changes', () => {
    const { view, root } = setup();
    const sprite = root.children.find((c): c is THREE.Points => c instanceof THREE.Points)!;
    const map = () => (sprite.material as THREE.PointsMaterial).map;
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    const normal = map();
    view.setMarkHover('check');
    const hovered = map();
    expect(hovered).not.toBe(normal);
    view.sync(state(game, { x: 5, z: 6, rotation: 0, valid: true })); // a sync keeps the hover look
    expect(map()).toBe(hovered);
    view.sync(state(game, { x: 5, z: 6, rotation: 0, valid: false }));
    const cross = map();
    expect(cross).not.toBe(hovered);
    expect(cross).not.toBe(normal);
    view.setMarkHover(null);
    expect(map()).toBe(cross);
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    expect(map()).toBe(normal);
  });

  it('the ✗ (invalid ghost), no ghost, a hidden ghost (screenshot) and a finished round have none', () => {
    const { view } = setup();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: false }));
    expect(view.checkMark()).toBeNull();
    view.sync(state(game, null));
    expect(view.checkMark()).toBeNull();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    view.setGhostVisible(false);
    expect(view.checkMark()).toBeNull();
    view.setGhostVisible(true);
    expect(view.checkMark()).not.toBeNull();
    view.sync({ ...state(game, { x: 4, z: 6, rotation: 0, valid: true }), screen: 'finished' });
    expect(view.checkMark()).toBeNull();
  });

  it('returns a copy: moving it does not move the ✓', () => {
    const { view } = setup();
    view.sync(state(game, { x: 4, z: 6, rotation: 0, valid: true }));
    view.checkMark()!.center.set(0, 0, 0);
    expect(view.checkMark()!.center.x).toBeCloseTo(4 + fp.w / 2);
  });
});
