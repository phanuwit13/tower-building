import * as THREE from 'three';
import { rotatedFootprint } from '../game/grid';
import type { Placement } from '../game/types';
import type { AppState, GhostState } from '../app/controller';
import type { StyleKit } from '../models/kit';
import type { ThemeDef } from '../themes/types';
import { chunkOf, createBatch, placementMatrix, placementTransform, planBatch, type BatchItem } from './batch';
import type { Stage } from './stage';

export { placementTransform }; // the gallery and tests place items with it

/**
 * Ghost tints. Valid is a pale mint "hologram": lighter than the grass and the leaf greens, so it
 * stands out on the default ground and next to real trees. Invalid is a strong red, drawn more
 * opaque: a see-through red over yellow-green grass or sand otherwise blends to orange.
 * The ✓/✗ markers use deeper shades so their white glyph stays readable.
 */
export const GHOST_VALID = 0x7ff5b5;
export const GHOST_INVALID = 0xff2a4d;
const MARK_VALID = 0x1f9a4c;
const MARK_INVALID = 0xc4162f;
const HOVER_OPACITY = { valid: { body: 0.3, fill: 0.2 }, invalid: { body: 0.4, fill: 0.4 } } as const;
const OPACITY = { valid: { body: 0.6, fill: 0.45 }, invalid: { body: 0.75, fill: 0.7 } } as const;

/** The ✓/✗ texture: a disc of radius MARK_R px with a MARK_LINE px white ring, on a MARK_PX square. */
const MARK_PX = 128;
const MARK_R = 58;
const MARK_LINE = 8;
/** The drawn disc's diameter (ring included) as a share of the marker's square. */
const MARK_DISC = (2 * MARK_R + MARK_LINE) / MARK_PX;
const MARK_SIZE = 2.4;

function markTexture(glyph: string, color: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = MARK_PX;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    g.beginPath();
    g.arc(MARK_PX / 2, MARK_PX / 2, MARK_R, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#ffffff';
    g.lineWidth = MARK_LINE;
    g.stroke();
    g.fillStyle = '#ffffff';
    g.font = 'bold 76px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(glyph, 64, 70);
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

export interface CityView {
  sync(s: AppState): void;
  /** World box (footprint x item height) of the visible ghost, for hit-testing; null when none is shown. */
  ghostBox(): THREE.Box3 | null;
  /** The ✓ over a valid ghost, as a tap target; null when none is shown (no ghost, the ✗, hidden for a screenshot). */
  checkMark(): CheckMark | null;
  /**
   * The faint mouse-hover preview of `itemId` at `p` (no marker, no shadow); null hides it.
   * Independent of the locked ghost; hidden too while a capture asked to hide the ghost.
   */
  setHover(h: { themeId: string; itemId: string; p: GhostState } | null): void;
  /** Hide/show the ghost, its outline and its marker (e.g. for a screenshot). Persists across sync. */
  setGhostVisible(v: boolean): void;
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
  const ghostMat = new THREE.MeshLambertMaterial({
    color: GHOST_VALID, transparent: true, opacity: OPACITY.valid.body, depthWrite: false,
  });
  const fillMat = new THREE.MeshBasicMaterial({
    color: GHOST_VALID, transparent: true, opacity: OPACITY.valid.fill, depthWrite: false,
  });
  const lineMat = new THREE.LineBasicMaterial({ color: GHOST_VALID });
  const okTex = markTexture('✓', MARK_VALID);
  const noTex = markTexture('✗', MARK_INVALID);
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

  // Hover preview: its own faint materials, model and group; same tint rule as the ghost.
  const hoverMat = new THREE.MeshLambertMaterial({ color: GHOST_VALID, transparent: true, opacity: HOVER_OPACITY.valid.body, depthWrite: false });
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
  let hoverKey = '';
  let hoverWanted = false;

  let wanted = false; // the game state wants a ghost on screen
  let valid = false; // ...and it can be placed where it is (the ✓, not the ✗)
  let suppressed = false; // ...but a capture asked to hide it
  const box = new THREE.Box3();
  const applyVisibility = (): void => {
    ghost.visible = wanted && !suppressed;
    sprite.visible = wanted && !suppressed;
    hover.visible = hoverWanted && !suppressed;
  };

  let ghostModel: THREE.Object3D | null = null;
  let ghostKey = '';
  const topOf = new Map<string, number>();

  const setGhostModel = (themeId: string, itemId: string): number => {
    const key = `${themeId}:${itemId}`;
    if (key !== ghostKey) {
      if (ghostModel) ghost.remove(ghostModel);
      ghostModel = null;
      ghostKey = key;
      const proto = prototype(themeId, itemId);
      if (proto) {
        const m = proto.clone();
        m.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const mesh = o as THREE.Mesh;
            mesh.material = ghostMat;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        ghost.add(m);
        ghostModel = m;
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
    const opacity = g.valid ? OPACITY.valid : OPACITY.invalid;
    ghostMat.color.setHex(color);
    ghostMat.opacity = opacity.body;
    fillMat.color.setHex(color);
    fillMat.opacity = opacity.fill;
    lineMat.color.setHex(color);
    spriteMat.map = g.valid ? okTex : noTex;
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
      hoverKey = key;
      const proto = prototype(h.themeId, h.itemId);
      if (proto) {
        const m = proto.clone();
        m.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const mesh = o as THREE.Mesh;
            mesh.material = hoverMat;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        hover.add(m);
        hoverModel = m;
      }
    }
    const color = h.p.valid ? GHOST_VALID : GHOST_INVALID;
    hoverMat.color.setHex(color);
    hoverFillMat.color.setHex(color);
    hoverLineMat.color.setHex(color);
    const op = h.p.valid ? HOVER_OPACITY.valid : HOVER_OPACITY.invalid;
    hoverMat.opacity = op.body;
    hoverFillMat.opacity = op.fill;
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
    setGhostVisible(v) {
      suppressed = !v;
      applyVisibility();
    },
    lastBuildMs: () => buildMs,
  };
}
