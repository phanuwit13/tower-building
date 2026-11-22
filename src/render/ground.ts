import * as THREE from 'three';
import { GRID_SIZE, type GroundId } from '../game/types';
import type { Stage } from './stage';

/**
 * Map ground colours (sRGB hex), tone mapping softens them. Every master palette colour stays at
 * least CIE76 dE 12 away from every ground (ground.test.ts), so item parts never vanish into the
 * map: concrete is a warm mid grey (not stone), sand a golden sand (not the item `sand`), snow a
 * cool lilac white, the wood deck a weathered tan, the moon a pale lavender grey.
 */
export const GROUND_COLORS: Record<GroundId, number> = {
  grass: 0x7ccb52,
  dirt: 0x9b7b54,
  concrete: 0xa29d94,
  sand: 0xdcaa5a,
  snow: 0xe6e0f0,
  wood: 0xb8a386,
  moon: 0xd2c8e8,
};

const WET = 0.85;
const SURROUND = 0.78; // the land around the map is darker so the play area reads at a glance
const SLAB = 0.25; // the map is a low slab: its top is y = 0, its sides give a diorama edge
const GRID_OPACITY = 0.25; // a faint line: the ground darkened by 25 %
const GRID_HALF_WIDTH = 0.015; // world units
/**
 * The surround melts into the horizon colour between these distances from the map centre. Past
 * `end` it is pure horizon colour, the same as the sky dome behind it, so the plane can stop there.
 * The environment fades night stars in over the same band (see createStars).
 */
export const SURROUND_FADE = { start: 0.9 * GRID_SIZE, end: 3.2 * GRID_SIZE, y: -SLAB } as const;
const SURROUND_SIZE = 2 * SURROUND_FADE.end + GRID_SIZE * 1.6;

function scaleHex(hex: number, k: number): number {
  const ch = (shift: number) => Math.round(((hex >> shift) & 255) * k) << shift;
  return ch(16) | ch(8) | ch(0);
}

export function createGround(stage: Stage): { setGround(g: GroundId, wet: boolean): void } {
  const mapMaterial = new THREE.MeshLambertMaterial();
  const map = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, SLAB, GRID_SIZE), mapMaterial);
  map.position.set(GRID_SIZE / 2, -SLAB / 2, GRID_SIZE / 2);
  map.receiveShadow = true;

  // Grid lines are drawn in the map's own shader: a fixed world-space width (so they look the same
  // at any pixel ratio, unlike 1-px GL lines), anti-aliased, lit and shadowed like the ground, and
  // with no doubled darkening where lines cross. Only the top face (y = 0) gets them.
  mapMaterial.onBeforeCompile = (s) => {
    s.vertexShader = 'varying vec3 vGridPos;\n' + s.vertexShader.replace(
      '#include <fog_vertex>',
      '#include <fog_vertex>\nvGridPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    s.fragmentShader = 'varying vec3 vGridPos;\n' + s.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      if ( vGridPos.y > -0.001 ) {
        vec2 toLine = abs( fract( vGridPos.xz + 0.5 ) - 0.5 );
        vec2 aa = fwidth( vGridPos.xz );
        vec2 onLine = 1.0 - smoothstep( vec2( ${GRID_HALF_WIDTH} ) - aa, vec2( ${GRID_HALF_WIDTH} ) + aa, toLine );
        diffuseColor.rgb *= 1.0 - ${GRID_OPACITY.toFixed(2)} * max( onLine.x, onLine.y );
      }`);
  };

  const surroundMaterial = new THREE.MeshLambertMaterial();
  // Fade the surround into the fog (horizon) colour by distance from the map, so the map sits in a
  // soft vignette at every zoom level without fogging the map itself.
  surroundMaterial.onBeforeCompile = (s) => {
    s.vertexShader = 'varying vec2 vGroundXZ;\n' + s.vertexShader.replace(
      '#include <fog_vertex>',
      '#include <fog_vertex>\nvGroundXZ = ( modelMatrix * vec4( transformed, 1.0 ) ).xz;');
    s.fragmentShader = 'varying vec2 vGroundXZ;\n' + s.fragmentShader.replace(
      '#include <fog_fragment>',
      `#include <fog_fragment>
      #ifdef USE_FOG
        float edgeFade = smoothstep( ${SURROUND_FADE.start.toFixed(1)}, ${SURROUND_FADE.end.toFixed(1)}, distance( vGroundXZ, vec2( ${(GRID_SIZE / 2).toFixed(1)} ) ) );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, edgeFade );
      #endif`);
  };
  const surround = new THREE.Mesh(new THREE.PlaneGeometry(SURROUND_SIZE, SURROUND_SIZE).rotateX(-Math.PI / 2), surroundMaterial);
  surround.position.set(GRID_SIZE / 2, SURROUND_FADE.y, GRID_SIZE / 2);
  // Drawn first and without depth, so stars can show through where it has faded into the sky;
  // it is the lowest thing in the scene, so nothing else needs its depth.
  surroundMaterial.depthWrite = false;
  surround.renderOrder = -1;

  stage.scene.add(map, surround);

  return {
    setGround(g, wet) {
      const hex = wet ? scaleHex(GROUND_COLORS[g], WET) : GROUND_COLORS[g];
      mapMaterial.color.setHex(hex);
      surroundMaterial.color.setHex(scaleHex(hex, SURROUND));
    },
  };
}
