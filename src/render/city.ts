import * as THREE from 'three';
import { rotatedFootprint } from '../game/grid';
import type { Placement } from '../game/types';
import type { AppState, GhostState } from '../app/controller';
import type { StyleKit } from '../models/kit';
import type { ThemeDef } from '../themes/types';
import { ICONS } from '../ui/icons';
import { chunkOf, createBatch, placementMatrix, placementTransform, planBatch, type BatchItem } from './batch';
import type { Stage } from './stage';

export { placementTransform }; // the gallery and tests place items with it

/**
 * Ghost looks. Where the item can go it shows in its own colours, faded, over a pale mint footprint
 * (lighter than the grass and the leaf greens, so it stands out on the default ground). Where it
 * cannot, the whole item turns a strong red, drawn more opaque: a see-through red over yellow-green
 * grass or sand otherwise blends to orange. The ✓/✗ markers use deeper shades so their white glyph
 * stays readable; the ✓ darkens further while the mouse is on it (it can be clicked).
 * Beside the ✓/✗ floats a blue rotate button (also on a ghost that cannot go there: turning it may
 * make it fit), darker blue under the mouse.
 */
export const GHOST_VALID = 0x7ff5b5;
export const GHOST_INVALID = 0xff2a4d;
const MARK_VALID = 0x1f9a4c;
export const MARK_HOVER = 0x0a5a26;
const MARK_INVALID = 0xc4162f;
export const HOVER_OPACITY = { valid: { body: 0.35, fill: 0.2 }, invalid: { body: 0.4, fill: 0.4 } } as const;
export const OPACITY = { valid: { body: 0.65, fill: 0.45 }, invalid: { body: 0.75, fill: 0.7 } } as const;
/** Draw order inside the transparent pass: footprint fill, outline, then the model's depth, then its colour. */
const ORDER = { depth: 3, model: 4 } as const;

/** The item's own vertex colours, see-through (the kit's lit look without its motion/glow shaders). */
function fadedLook(opacity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0, transparent: true, opacity, depthWrite: false,
  });
}

/**
 * A see-through copy of a built item. Each mesh gets a depth-only twin drawn just before it, so only
 * the item's front surfaces show (its own back walls and inner parts never shine through).
 * Returns the copy and its colour meshes, whose material the caller swaps between looks.
 */
function seeThroughCopy(proto: THREE.Object3D, look: THREE.Material, depth: THREE.Material): { model: THREE.Object3D; meshes: THREE.Mesh[] } {
  const model = proto.clone();
  const meshes: THREE.Mesh[] = [];
  model.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
  for (const mesh of meshes) {
    mesh.material = look;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = ORDER.model;
    const twin = new THREE.Mesh(mesh.geometry, depth);
    twin.renderOrder = ORDER.depth;
    mesh.add(twin);
  }
  return { model, meshes };
}

/** The ✓/✗ texture: a disc of radius MARK_R px with a MARK_LINE px light ring, on a MARK_PX square. */
const MARK_PX = 128;
/**
 * The ring and glyph: off-white, so on the pretty tier the standard bloom (threshold 0.85, linear
 * luminance) leaves the marker crisp. Pure white bloomed into a pale haze that hid the disc's
 * colour (the darker ✓ under the mouse looked the same) and washed out the ghost below it.
 * A nightGlow theme's dusk/night bloom (threshold down to CITY_BLOOM_FLOOR, at lower strength)
 * still gives the ink a soft glow there, which suits its neon night.
 */
export const MARK_INK = 0xe6e6e6;
const MARK_R = 58;
const MARK_LINE = 8;
/** The drawn disc's diameter (ring included) as a share of the marker's square. */
const MARK_DISC = (2 * MARK_R + MARK_LINE) / MARK_PX;
const MARK_SIZE = 2.4;
/** The rotate button: a little smaller than the ✓ (placing stays the main action), blue = an action that is not placing. */
const ROT_SIZE = 2;
export const ROT_COLOR = 0x2f6fde;
export const ROT_HOVER = 0x1b4aa6;
/** Centre to centre, ✓ to rotate button, in Points size units: the two radii plus a small gap. */
const ROT_OFFSET = ((MARK_SIZE + ROT_SIZE) * MARK_DISC) / 2 + 0.3;
/** Icon scale on the marker canvas: the 24-unit icon grid drawn 60 px wide inside the 116 px disc. */
const ICON_SCALE = 2.5;

type Ink = (g: CanvasRenderingContext2D, ink: string) => void;
const glyph = (text: string): Ink => (g, ink) => {
  g.fillStyle = ink;
  g.font = 'bold 76px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 64, 70);
};
const lineArt = (paths: readonly string[]): Ink => (g, ink) => {
  g.save();
  g.translate(MARK_PX / 2 - 12 * ICON_SCALE, MARK_PX / 2 - 12 * ICON_SCALE);
  g.scale(ICON_SCALE, ICON_SCALE);
  g.strokeStyle = ink;
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const d of paths) g.stroke(new Path2D(d));
  g.restore();
};

/**
 * Where the rotate button is drawn: beside the ✓/✗ at `anchor`, on its left as `camera` sees it,
 * the same screen gap at any distance (a Points size of s spans s × tan(fov / 2) world units).
 */
export function rotateMarkAt(anchor: THREE.Vector3, camera: THREE.Camera, out = new THREE.Vector3()): THREE.Vector3 {
  const persp = camera as THREE.PerspectiveCamera;
  const unit = persp.isPerspectiveCamera ? Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2) / persp.zoom : 1;
  const right = cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
  return out.copy(anchor).addScaledVector(right, -ROT_OFFSET * unit);
}
const cameraRight = new THREE.Vector3();

function markTexture(color: number, draw: Ink): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = MARK_PX;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    g.beginPath();
    g.arc(MARK_PX / 2, MARK_PX / 2, MARK_R, 0, Math.PI * 2);
    g.fill();
    const ink = `#${MARK_INK.toString(16).padStart(6, '0')}`;
    g.strokeStyle = ink;
    g.lineWidth = MARK_LINE;
    g.stroke();
    draw(g, ink);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Where the ✓ is drawn: a camera-facing disc at `center` (world). `size` is its diameter in
 * PointsMaterial size units: on screen it is size × (canvas height / 2) / depth px across.
 */
export interface CheckMark { center: THREE.Vector3; size: number }
/** The two buttons floating over the ghost. */
export type GhostMark = 'check' | 'rotate';

export interface CityView {
  sync(s: AppState): void;
  /** World box (footprint x item height) of the visible ghost, for hit-testing; null when none is shown. */
  ghostBox(): THREE.Box3 | null;
  /** The ✓ over a valid ghost, as a tap target; null when none is shown (no ghost, the ✗, hidden for a screenshot). */
  checkMark(): CheckMark | null;
  /** The rotate button beside the ✓/✗ as `camera` sees it, as a tap target; null when no ghost is shown. */
  rotateMark(camera: THREE.Camera): CheckMark | null;
  /**
   * The faint mouse-hover preview of `itemId` at `p` (no marker, no shadow); null hides it.
   * Independent of the locked ghost; hidden too while a capture asked to hide the ghost.
   */
  setHover(h: { themeId: string; itemId: string; p: GhostState } | null): void;
  /** Hide/show the ghost, its outline and its marker (e.g. for a screenshot). Persists across sync. */
  setGhostVisible(v: boolean): void;
  /** The mouse is on the ✓ or the rotate button (or neither): draw that one darker, as a button under the pointer. */
  setMarkHover(mark: GhostMark | null): void;
  /** How long the last change to the placed items took to apply (ms); undefined before the first. */
  lastBuildMs(): number | undefined;
}

export function createCityView(
  stage: Stage,
  kit: StyleKit,
  getTheme: (id: string) => ThemeDef | undefined,
): CityView {
  const root = new THREE.Group();
  root.name = 'city';
  stage.scene.add(root);

  const built = new Map<string, THREE.Object3D>(); // `${themeId}:${itemId}` -> shared prototype (merge source, ghost)
  // Placed items are drawn merged per map chunk (see batch.ts); `shown` is what the batch holds.
  const batch = createBatch(root, kit.materials);
  let shown: readonly Placement[] = [];
  let shownTheme: string | null = null;

  const prototype = (themeId: string, itemId: string): THREE.Object3D | null => {
    const key = `${themeId}:${itemId}`;
    let p = built.get(key);
    if (!p) {
      const item = getTheme(themeId)?.items.find((i) => i.id === itemId);
      if (!item) return null;
      p = item.build(kit);
      built.set(key, p);
    }
    return p;
  };

  // Ghost: materials owned here, created once and reused.
  const ghostLook = fadedLook(OPACITY.valid.body);
  const ghostBad = new THREE.MeshLambertMaterial({
    color: GHOST_INVALID, transparent: true, opacity: OPACITY.invalid.body, depthWrite: false,
  });
  // In the transparent pass (after every solid thing is drawn), so it hides nothing behind the ghost.
  // Pushed a hair back so the colour pass (another program) always passes the depth test on it.
  const depthOnly = new THREE.MeshBasicMaterial({
    colorWrite: false, transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  const fillMat = new THREE.MeshBasicMaterial({
    color: GHOST_VALID, transparent: true, opacity: OPACITY.valid.fill, depthWrite: false,
  });
  const lineMat = new THREE.LineBasicMaterial({ color: GHOST_VALID });
  const okTex = markTexture(MARK_VALID, glyph('✓'));
  const noTex = markTexture(MARK_INVALID, glyph('✗'));
  const okHoverTex = markTexture(MARK_HOVER, glyph('✓'));
  const rotTex = markTexture(ROT_COLOR, lineArt(ICONS.rotateItem));
  const rotHoverTex = markTexture(ROT_HOVER, lineArt(ICONS.rotateItem));
  // A one-vertex Points billboard rather than a Sprite: GTAOPass hides Points but renders Sprites as dark quads.
  const spriteMat = new THREE.PointsMaterial({
    map: okTex, size: MARK_SIZE, sizeAttenuation: true, depthTest: false, depthWrite: false, transparent: true,
  });

  const ghost = new THREE.Group();
  ghost.name = 'ghost';
  ghost.visible = false;
  const footFill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), fillMat);
  footFill.position.y = 0.03;
  footFill.renderOrder = 1;
  const footLine = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 0, -0.5),
      new THREE.Vector3(0.5, 0, 0.5), new THREE.Vector3(-0.5, 0, 0.5),
    ]),
    lineMat,
  );
  footLine.position.y = 0.04;
  footLine.renderOrder = 2;
  const sprite = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
    spriteMat,
  );
  sprite.frustumCulled = false;
  sprite.renderOrder = 10;
  ghost.add(footFill, footLine);
  root.add(ghost);
  root.add(sprite);
  sprite.visible = false;
  // The rotate button: placed each frame beside the ✓ as the drawing camera sees it (it turns with the view).
  const rotMat = new THREE.PointsMaterial({
    map: rotTex, size: ROT_SIZE, sizeAttenuation: true, depthTest: false, depthWrite: false, transparent: true,
  });
  const rotSprite = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
    rotMat,
  );
  rotSprite.name = 'rotate-mark';
  rotSprite.frustumCulled = false;
  rotSprite.renderOrder = 10;
  rotSprite.visible = false;
  rotSprite.onBeforeRender = (_r, _s, camera) => {
    rotateMarkAt(sprite.position, camera, rotSprite.position);
    rotSprite.updateMatrixWorld();
  };
  root.add(rotSprite);

  // Hover preview: its own fainter materials, model and group; same looks as the ghost.
  const hoverLook = fadedLook(HOVER_OPACITY.valid.body);
  const hoverBad = new THREE.MeshLambertMaterial({ color: GHOST_INVALID, transparent: true, opacity: HOVER_OPACITY.invalid.body, depthWrite: false });
  const hoverFillMat = new THREE.MeshBasicMaterial({ color: GHOST_VALID, transparent: true, opacity: HOVER_OPACITY.valid.fill, depthWrite: false });
  const hoverLineMat = new THREE.LineBasicMaterial({ color: GHOST_VALID, transparent: true, opacity: 0.5 });
  const hover = new THREE.Group();
  hover.name = 'hover';
  hover.visible = false;
  const hoverFill = new THREE.Mesh(footFill.geometry, hoverFillMat);
  hoverFill.position.y = 0.03;
  hoverFill.renderOrder = 1;
  const hoverLine = new THREE.LineLoop(footLine.geometry, hoverLineMat);
  hoverLine.position.y = 0.04;
  hoverLine.renderOrder = 2;
  hover.add(hoverFill, hoverLine);
  root.add(hover);
  let hoverModel: THREE.Object3D | null = null;
  let hoverMeshes: THREE.Mesh[] = [];
  let hoverKey = '';
  let hoverWanted = false;

  let wanted = false; // the game state wants a ghost on screen
  let valid = false; // ...and it can be placed where it is (the ✓, not the ✗)
  let suppressed = false; // ...but a capture asked to hide it
  let markHover: GhostMark | null = null; // the mouse is on the ✓ or the rotate button
  const applyMark = (): void => {
    spriteMat.map = !valid ? noTex : markHover === 'check' ? okHoverTex : okTex;
    rotMat.map = markHover === 'rotate' ? rotHoverTex : rotTex;
  };
  const box = new THREE.Box3();
  const applyVisibility = (): void => {
    ghost.visible = wanted && !suppressed;
    sprite.visible = wanted && !suppressed;
    rotSprite.visible = wanted && !suppressed;
    hover.visible = hoverWanted && !suppressed;
  };

  let ghostModel: THREE.Object3D | null = null;
  let ghostMeshes: THREE.Mesh[] = [];
  let ghostKey = '';
  const topOf = new Map<string, number>();

  const setGhostModel = (themeId: string, itemId: string): number => {
    const key = `${themeId}:${itemId}`;
    if (key !== ghostKey) {
      if (ghostModel) ghost.remove(ghostModel);
      ghostModel = null;
      ghostMeshes = [];
      ghostKey = key;
      const proto = prototype(themeId, itemId);
      if (proto) {
        const copy = seeThroughCopy(proto, ghostLook, depthOnly);
        ghost.add(copy.model);
        ghostModel = copy.model;
        ghostMeshes = copy.meshes;
        topOf.set(key, new THREE.Box3().setFromObject(proto).max.y);
      }
    }
    return topOf.get(key) ?? 1;
  };

  let buildMs: number | undefined;

  /** Merge placements into their chunks, one re-merge per chunk touched. */
  const addToBatch = (themeId: string, list: readonly Placement[]): void => {
    const byChunk = new Map<number, BatchItem[]>();
    for (const pl of list) {
      const model = prototype(themeId, pl.itemId);
      const fp = getTheme(themeId)?.items.find((i) => i.id === pl.itemId)?.footprint;
      if (!model || !fp) continue;
      const chunk = chunkOf(fp, pl.x, pl.z, pl.rotation);
      const items = byChunk.get(chunk) ?? [];
      items.push({ model, matrix: placementMatrix(fp, pl.x, pl.z, pl.rotation) });
      byChunk.set(chunk, items);
    }
    for (const [chunk, items] of byChunk) batch.add(chunk, items);
  };

  /** Bring the merged meshes in line with the game's placements; true when anything was redrawn. */
  const syncPlaced = (themeId: string | null, placements: readonly Placement[]): boolean => {
    const plan = themeId === shownTheme ? planBatch(shown, placements) : { kind: 'rebuild' as const };
    if (plan.kind === 'same') return false;
    const empty = shown.length === 0;
    try {
      if (plan.kind === 'append' && themeId) {
        addToBatch(themeId, plan.added);
      } else {
        batch.clear();
        if (themeId) addToBatch(themeId, placements);
      }
    } catch (e) {
      // The batch may hold a partial merge: forget what is shown so the next sync rebuilds in full.
      shown = [];
      shownTheme = null;
      throw e;
    }
    shown = placements;
    shownTheme = themeId;
    return plan.kind === 'append' && themeId ? true : !(empty && placements.length === 0);
  };

  function sync(s: AppState): void {
    const game = s.game;
    const t0 = performance.now();
    if (syncPlaced(game?.themeId ?? null, game?.placements ?? [])) {
      buildMs = performance.now() - t0;
      stage.invalidateShadows(); // the only shadow casters that ever change (the ghost casts none)
    }

    const g = s.ghost;
    const item = game && s.screen === 'playing' ? getTheme(game.themeId)?.items.find((i) => i.id === game.current) : undefined;
    if (!g || !game || !item) {
      wanted = false;
      applyVisibility();
      return;
    }
    const top = setGhostModel(game.themeId, item.id);
    valid = g.valid;
    const color = g.valid ? GHOST_VALID : GHOST_INVALID;
    const look = g.valid ? ghostLook : ghostBad;
    for (const mesh of ghostMeshes) mesh.material = look;
    fillMat.color.setHex(color);
    fillMat.opacity = (g.valid ? OPACITY.valid : OPACITY.invalid).fill;
    lineMat.color.setHex(color);
    applyMark();
    const { w, d } = rotatedFootprint(item.footprint, g.rotation);
    ghost.position.set(g.x + w / 2, 0, g.z + d / 2);
    // Model rotates with the placement; the footprint plane/outline use world-aligned size.
    if (ghostModel) ghostModel.rotation.y = -g.rotation * (Math.PI / 2);
    footFill.scale.set(w, 1, d);
    footLine.scale.set(w, 1, d);
    sprite.position.set(g.x + w / 2, top + 0.7, g.z + d / 2);
    box.set(new THREE.Vector3(g.x, 0, g.z), new THREE.Vector3(g.x + w, top, g.z + d));
    wanted = true;
    applyVisibility();
  }

  const setHover: CityView['setHover'] = (h) => {
    const item = h ? getTheme(h.themeId)?.items.find((i) => i.id === h.itemId) : undefined;
    if (!h || !item) {
      if (hoverWanted) { hoverWanted = false; applyVisibility(); }
      return;
    }
    const key = `${h.themeId}:${h.itemId}`;
    if (key !== hoverKey) {
      if (hoverModel) hover.remove(hoverModel);
      hoverModel = null;
      hoverMeshes = [];
      hoverKey = key;
      const proto = prototype(h.themeId, h.itemId);
      if (proto) {
        const copy = seeThroughCopy(proto, hoverLook, depthOnly);
        hover.add(copy.model);
        hoverModel = copy.model;
        hoverMeshes = copy.meshes;
      }
    }
    const color = h.p.valid ? GHOST_VALID : GHOST_INVALID;
    const look = h.p.valid ? hoverLook : hoverBad;
    for (const mesh of hoverMeshes) mesh.material = look;
    hoverFillMat.color.setHex(color);
    hoverLineMat.color.setHex(color);
    hoverFillMat.opacity = (h.p.valid ? HOVER_OPACITY.valid : HOVER_OPACITY.invalid).fill;
    const { w, d } = rotatedFootprint(item.footprint, h.p.rotation);
    hover.position.set(h.p.x + w / 2, 0, h.p.z + d / 2);
    if (hoverModel) hoverModel.rotation.y = -h.p.rotation * (Math.PI / 2);
    hoverFill.scale.set(w, 1, d);
    hoverLine.scale.set(w, 1, d);
    hoverWanted = true;
    applyVisibility();
  };

  return {
    sync,
    setHover,
    ghostBox: () => (wanted ? box.clone() : null),
    checkMark: () => (wanted && valid && !suppressed ? { center: sprite.position.clone(), size: MARK_SIZE * MARK_DISC } : null),
    rotateMark: (camera) => (wanted && !suppressed ? { center: rotateMarkAt(sprite.position, camera), size: ROT_SIZE * MARK_DISC } : null),
    setGhostVisible(v) {
      suppressed = !v;
      applyVisibility();
    },
    setMarkHover(mark) {
      if (mark === markHover) return;
      markHover = mark;
      applyMark();
    },
    lastBuildMs: () => buildMs,
  };
}
