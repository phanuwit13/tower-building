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

/**
 * The pavement round an indoor theme's room (ThemeDef.indoor): a light warm grey of its own, the same
 * whatever floor is inside, and at least CIE76 dE 12 from every ground and palette colour
 * (ground.test.ts), so the floor never seems to run on outside the walls.
 */
export const PAVEMENT_COLOR = 0xd2cabd;

const WET = 0.85;
const SURROUND = 0.78; // the land around the map is darker so the play area reads at a glance
const SLAB = 0.25; // the map is a low slab: its top is y = 0, its sides give a diorama edge
const GRID_OPACITY = 0.25; // a faint line: the ground darkened by 25 %
const GRID_HALF_WIDTH = 0.015; // world units
const JOINT_OPACITY = 0.12; // the pavement's slab joints: fainter than the map's grid
const JOINT_HALF_WIDTH = 0.012;
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

/**
 * The map slab and the land round it. `setGround(g, wet, indoor)`: the map shows ground `g`; rain
 * (`wet`) darkens it and the surround. With `indoor` (the café) the surround is a pavement with slab
 * joints instead, darkened in rain, and the map (the room's floor) is never wet.
 */
export function createGround(stage: Stage): { setGround(g: GroundId, wet: boolean, indoor?: boolean): void } {
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
  const paving = { value: 0 }; // 1: an indoor theme's pavement, with slab joints
  // Fade the surround into the fog (horizon) colour by distance from the map, so the map sits in a
  // soft vignette at every zoom level without fogging the map itself. A pavement gets faint slab
  // joints on a 1-unit grid, drawn like the map's grid lines and faded out in the distance (where a
  // slab is only a few pixels across), so they never shimmer.
  surroundMaterial.onBeforeCompile = (s) => {
    s.uniforms.uPaving = paving;
    s.vertexShader = 'varying vec2 vGroundXZ;\n' + s.vertexShader.replace(
      '#include <fog_vertex>',
      '#include <fog_vertex>\nvGroundXZ = ( modelMatrix * vec4( transformed, 1.0 ) ).xz;');
    s.fragmentShader = 'uniform float uPaving;\nvarying vec2 vGroundXZ;\n' + s.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      if ( uPaving > 0.5 ) {
        vec2 toJoint = abs( fract( vGroundXZ + 0.5 ) - 0.5 );
        vec2 aa = fwidth( vGroundXZ );
        vec2 onJoint = 1.0 - smoothstep( vec2( ${JOINT_HALF_WIDTH} ) - aa, vec2( ${JOINT_HALF_WIDTH} ) + aa, toJoint );
        float jointFade = 1.0 - smoothstep( 0.05, 0.2, max( aa.x, aa.y ) );
        diffuseColor.rgb *= 1.0 - ${JOINT_OPACITY.toFixed(2)} * jointFade * max( onJoint.x, onJoint.y );
      }`).replace(
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
    setGround(g, wet, indoor = false) {
      const hex = wet && !indoor ? scaleHex(GROUND_COLORS[g], WET) : GROUND_COLORS[g];
      mapMaterial.color.setHex(hex);
      const pavement = wet ? scaleHex(PAVEMENT_COLOR, WET) : PAVEMENT_COLOR;
      surroundMaterial.color.setHex(indoor ? pavement : scaleHex(hex, SURROUND));
      paving.value = indoor ? 1 : 0;
    },
  };
}
