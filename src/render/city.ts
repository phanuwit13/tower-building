import * as THREE from 'three';
import { rotatedFootprint } from '../game/grid';
import type { Footprint, Rotation } from '../game/types';
import type { AppState } from '../app/controller';
import type { StyleKit } from '../models/kit';
import type { ThemeDef } from '../themes/types';
import type { Stage } from './stage';

export const GHOST_VALID = 0x4caf50;
export const GHOST_INVALID = 0xe53935;
const GHOST_OPACITY = 0.55;

/** World transform of an item whose rotated footprint's min-corner tile is (x, z). Models are centred on the footprint. */
export function placementTransform(fp: Footprint, x: number, z: number, r: Rotation): { x: number; y: number; z: number; rotY: number } {
  const { w, d } = rotatedFootprint(fp, r);
  return { x: x + w / 2, y: 0, z: z + d / 2, rotY: -r * (Math.PI / 2) };
}

function applyTransform(o: THREE.Object3D, fp: Footprint, x: number, z: number, r: Rotation): void {
  const t = placementTransform(fp, x, z, r);
  o.position.set(t.x, t.y, t.z);
  o.rotation.y = t.rotY;
}

function markTexture(glyph: string, color: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    g.beginPath();
    g.arc(64, 64, 58, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#ffffff';
    g.lineWidth = 8;
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

export interface CityView {
  sync(s: AppState): void;
  /** World box (footprint x item height) of the visible ghost, for hit-testing; null when none is shown. */
  ghostBox(): THREE.Box3 | null;
  /** Hide/show the ghost, its outline and its marker (e.g. for a screenshot). Persists across sync. */
  setGhostVisible(v: boolean): void;
}

export function createCityView(
  stage: Stage,
  kit: StyleKit,
  getTheme: (id: string) => ThemeDef | undefined,
): CityView {
  void kit;
  const root = new THREE.Group();
  root.name = 'city';
  stage.scene.add(root);

  const built = new Map<string, THREE.Object3D>(); // `${themeId}:${itemId}` -> shared prototype
  const placed = new Map<number, THREE.Object3D>();
  let placedTheme: string | null = null;

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
    color: GHOST_VALID, transparent: true, opacity: GHOST_OPACITY, depthWrite: false,
  });
  const fillMat = new THREE.MeshBasicMaterial({
    color: GHOST_VALID, transparent: true, opacity: 0.3, depthWrite: false,
  });
  const lineMat = new THREE.LineBasicMaterial({ color: GHOST_VALID });
  const okTex = markTexture('✓', GHOST_VALID);
  const noTex = markTexture('✗', GHOST_INVALID);
  // A one-vertex Points billboard rather than a Sprite: GTAOPass hides Points but renders Sprites as dark quads.
  const spriteMat = new THREE.PointsMaterial({
    map: okTex, size: 2.4, sizeAttenuation: true, depthTest: false, depthWrite: false, transparent: true,
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

  let wanted = false; // the game state wants a ghost on screen
  let suppressed = false; // ...but a capture asked to hide it
  const box = new THREE.Box3();
  const applyVisibility = (): void => {
    ghost.visible = wanted && !suppressed;
    sprite.visible = wanted && !suppressed;
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

  function sync(s: AppState): void {
    const game = s.game;
    const themeId = game?.themeId ?? null;
    if (themeId !== placedTheme) {
      for (const o of placed.values()) root.remove(o); // clones share geometry; nothing to dispose
      placed.clear();
      placedTheme = themeId;
    }
    if (game) {
      const live = new Set<number>();
      for (const pl of game.placements) {
        live.add(pl.uid);
        if (placed.has(pl.uid)) continue;
        const proto = prototype(game.themeId, pl.itemId);
        const fp = getTheme(game.themeId)?.items.find((i) => i.id === pl.itemId)?.footprint;
        if (!proto || !fp) continue;
        const o = proto.clone();
        applyTransform(o, fp, pl.x, pl.z, pl.rotation);
        root.add(o);
        placed.set(pl.uid, o);
      }
      for (const [uid, o] of placed) {
        if (!live.has(uid)) { root.remove(o); placed.delete(uid); }
      }
    }

    const g = s.ghost;
    const item = game && s.screen === 'playing' ? getTheme(game.themeId)?.items.find((i) => i.id === game.current) : undefined;
    if (!g || !game || !item) {
      wanted = false;
      applyVisibility();
      return;
    }
    const top = setGhostModel(game.themeId, item.id);
    const color = g.valid ? GHOST_VALID : GHOST_INVALID;
    ghostMat.color.setHex(color);
    fillMat.color.setHex(color);
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

  return {
    sync,
    ghostBox: () => (wanted ? box.clone() : null),
    setGhostVisible(v) {
      suppressed = !v;
      applyVisibility();
    },
  };
}
