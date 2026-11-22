import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { GRID_SIZE, TIME_IDS, WEATHER_IDS } from '../game/types';
import { getStyleKit } from '../models/kit';
import { advanceMotion, glslFloat, motionUniforms } from '../models/motion';
import { acesFilmic, createEnvironment, envPreset, MOON } from './environment';
import { CAMERA, type Stage } from './stage';

const ALL = TIME_IDS.flatMap((time) => WEATHER_IDS.map((weather) => ({ time, weather })));

function saturation(hex: number): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

describe('envPreset', () => {
  it('glows fully at night and not at all by day', () => {
    expect(envPreset('night', 'sunny').glowStrength).toBe(1);
    expect(envPreset('day', 'sunny').glowStrength).toBe(0);
  });

  it('sets glow by time of day: dawn 0.3, dusk 0.6, whatever the weather', () => {
    for (const weather of WEATHER_IDS) {
      expect(envPreset('dawn', weather).glowStrength).toBe(0.3);
      expect(envPreset('day', weather).glowStrength).toBe(0);
      expect(envPreset('dusk', weather).glowStrength).toBe(0.6);
      expect(envPreset('night', weather).glowStrength).toBe(1);
    }
  });

  it('dims the sun when it rains', () => {
    expect(envPreset('day', 'rain').sunIntensity).toBeLessThan(envPreset('day', 'sunny').sunIntensity);
  });

  it('rain scales sun ×0.5, sky light ×0.7 and fog distance ×0.6 for every time', () => {
    for (const time of TIME_IDS) {
      const sunny = envPreset(time, 'sunny');
      const rain = envPreset(time, 'rain');
      expect(rain.sunIntensity).toBeCloseTo(sunny.sunIntensity * 0.5);
      expect(rain.hemiIntensity).toBeCloseTo(sunny.hemiIntensity * 0.7);
      expect(rain.fogFar).toBeCloseTo(sunny.fogFar * 0.6);
      expect(rain.fogNear).toBe(sunny.fogNear);
    }
  });

  it('greys the sky when it rains', () => {
    for (const time of TIME_IDS) {
      expect(saturation(envPreset(time, 'rain').sky)).toBeLessThan(saturation(envPreset(time, 'sunny').sky));
      expect(saturation(envPreset(time, 'rain').fog)).toBeLessThan(saturation(envPreset(time, 'sunny').fog));
    }
  });

  it('shows stars only on a clear night', () => {
    for (const { time, weather } of ALL) {
      expect(envPreset(time, weather).stars).toBe(time === 'night' && weather === 'sunny');
    }
  });

  it('never fogs out the far corner of the map, even zoomed out as far as allowed', () => {
    const farCorner = CAMERA.maxDistance + (GRID_SIZE * Math.SQRT2) / 2;
    for (const { time, weather } of ALL) expect(envPreset(time, weather).fogFar, `${time} ${weather}`).toBeGreaterThan(farCorner);
  });

  it('keeps every preset usable: fog ends after it starts, lights on, sun above the horizon', () => {
    for (const { time, weather } of ALL) {
      const p = envPreset(time, weather);
      expect(p.fogNear).toBeGreaterThan(0);
      expect(p.fogFar).toBeGreaterThan(p.fogNear + 5);
      expect(p.sunIntensity).toBeGreaterThan(0);
      expect(p.hemiIntensity).toBeGreaterThan(0);
      expect(p.sunDir[1]).toBeGreaterThan(0);
      for (const c of [p.sky, p.fog, p.hemiSky, p.hemiGround, p.sunColor]) {
        expect(Number.isInteger(c) && c >= 0 && c <= 0xffffff).toBe(true);
      }
    }
  });

  it('shows the moon fully at night, faintly at dusk and dawn, never by day or in rain', () => {
    expect(envPreset('night', 'sunny').moon).toBe(1);
    expect(envPreset('dusk', 'sunny').moon).toBeCloseTo(0.35);
    expect(envPreset('dawn', 'sunny').moon).toBeCloseTo(0.35);
    expect(envPreset('day', 'sunny').moon).toBe(0);
    for (const time of TIME_IDS) expect(envPreset(time, 'rain').moon, time).toBe(0);
  });

  it('returns a fresh object each call', () => {
    const a = envPreset('day', 'sunny');
    a.sunDir[0] = 99;
    a.sunIntensity = 99;
    expect(envPreset('day', 'sunny').sunDir[0]).not.toBe(99);
    expect(envPreset('day', 'sunny').sunIntensity).not.toBe(99);
  });
});

describe('acesFilmic', () => {
  it('maps black to black and stays inside [0, 1]', () => {
    expect(acesFilmic([0, 0, 0]).every((v) => Math.abs(v) < 1e-3)).toBe(true);
    for (const v of acesFilmic([20, 5, 0.5])) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is monotonic for greys', () => {
    let prev = -1;
    for (const x of [0.01, 0.1, 0.3, 0.6, 1, 2, 4]) {
      const [r] = acesFilmic([x, x, x]);
      expect(r).toBeGreaterThan(prev);
      prev = r;
    }
  });
});

describe('moon placement', () => {
  /** The default camera of a 1280 x 800 window (stage.ts). */
  const defaultCamera = () => {
    const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
    const cam = new THREE.PerspectiveCamera(CAMERA.fov, 1280 / 800, 0.1, 300);
    cam.position.copy(centre).addScaledVector(CAMERA.direction, CAMERA.distance);
    cam.lookAt(centre);
    cam.updateMatrixWorld();
    return cam;
  };

  it('hangs near the top of the default view, halo and all on screen, clear of the corners', () => {
    const cam = defaultCamera();
    const at = (dir: THREE.Vector3) => cam.position.clone().addScaledVector(dir, MOON.distance).project(cam);
    const dir = new THREE.Vector3(...MOON.dir);
    const c = at(dir);
    expect(c.z).toBeLessThan(1); // in front of the camera, inside the far plane
    expect(c.y).toBeGreaterThan(0.6);
    expect(Math.abs(c.x)).toBeLessThan(0.5); // not under the corner buttons
    // the halo's top and side edges stay on screen
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const edge = (v: THREE.Vector3) => at(dir.clone().addScaledVector(v, MOON.haloRadius).normalize());
    expect(edge(up).y).toBeLessThan(1);
    expect(Math.abs(edge(right).x)).toBeLessThan(1);
    expect(Math.abs(edge(right.clone().negate()).x)).toBeLessThan(1);
  });

  it('sits on the night light\'s compass line, across the map from the default camera', () => {
    const [sx, , sz] = envPreset('night', 'sunny').sunDir;
    const [mx, , mz] = MOON.dir;
    expect(Math.hypot(...MOON.dir)).toBeCloseTo(1);
    expect(sx * mz - sz * mx).toBeCloseTo(0); // same compass line
    expect(sx * mx + sz * mz).toBeLessThan(0); // the far side of the map
  });

  it('is a disc with a wider soft halo, drawn in front of the far plane and behind the whole map', () => {
    expect(MOON.haloRadius).toBeGreaterThan(2 * MOON.discRadius);
    expect(MOON.distance).toBeLessThan(300); // the camera's far plane
    expect(MOON.distance).toBeGreaterThan(CAMERA.maxDistance + GRID_SIZE * 2);
  });
});

describe('createEnvironment', () => {
  const fakeStage = () => ({
    scene: new THREE.Scene(), onFrame: () => {}, renderer: { toneMappingExposure: 1.4 }, invalidateShadows: () => {},
  }) as unknown as Stage;
  const moonOf = (stage: Stage) => stage.scene.getObjectByName('moon') as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  // three calls a scene's onBeforeRender with (renderer, scene, camera, renderTarget) at the start of each render
  const beforeRender = (stage: Stage) => (stage.scene.onBeforeRender as (...a: unknown[]) => void)(null, stage.scene, null, null);

  it('adds one moon: a sky picture that casts no shadow, ignores fog and is never frustum-culled', () => {
    const stage = fakeStage();
    createEnvironment(stage, getStyleKit());
    const moon = moonOf(stage);
    expect(moon).toBeInstanceOf(THREE.Mesh);
    expect(stage.scene.children.filter((c) => c.name === 'moon')).toHaveLength(1);
    expect(moon.castShadow).toBe(false);
    expect(moon.receiveShadow).toBe(false);
    expect(moon.frustumCulled).toBe(false);
    expect(moon.material.fog).toBe(false);
    expect(moon.material.depthWrite).toBe(false);
    expect(moon.material.transparent).toBe(true);
    expect(moon.renderOrder).toBeLessThan(0); // first of the see-through things: everything nearer draws over it
  });

  it('the moon face is dimmer on pretty (bloom would whiten it) and no star shows through it', () => {
    const stage = fakeStage();
    const env = createEnvironment(stage, getStyleKit());
    const moon = moonOf(stage);
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'smooth');
    const smooth = moon.material.uniforms.faceGain.value;
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'pretty');
    expect(moon.material.uniforms.faceGain.value).toBeLessThan(smooth);
    expect(smooth).toBeLessThanOrEqual(1);
    const stars = stage.scene.children.find((c) => c instanceof THREE.Points) as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
    const shader = { vertexShader: THREE.ShaderLib.points.vertexShader, fragmentShader: THREE.ShaderLib.points.fragmentShader };
    stars.material.onBeforeCompile(shader as never, null as never);
    expect(shader.vertexShader).toContain(`vec3( ${MOON.dir.map(glslFloat).join(', ')} )`); // stars in line with the moon fade out
    getStyleKit().setGlowStrength(0);
  });

  it('shows the moon at night, faintly at dusk, and hides it by day and in rain (no draw call then)', () => {
    const stage = fakeStage();
    const env = createEnvironment(stage, getStyleKit());
    const moon = moonOf(stage);
    const shown = () => { beforeRender(stage); return moon.visible; };
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'smooth');
    expect(shown()).toBe(true);
    expect(moon.material.uniforms.visibility.value).toBe(1);
    env.apply({ weather: 'sunny', time: 'dusk', ground: 'grass' }, 'smooth');
    expect(shown()).toBe(true);
    expect(moon.material.uniforms.visibility.value).toBeCloseTo(0.35);
    env.apply({ weather: 'sunny', time: 'day', ground: 'grass' }, 'smooth');
    expect(shown()).toBe(false);
    env.apply({ weather: 'rain', time: 'night', ground: 'grass' }, 'smooth');
    expect(shown()).toBe(false);
    getStyleKit().setGlowStrength(0);
  });

  it('leaves the moon out of override passes (the AO normal pass), so it costs one draw call', () => {
    const stage = fakeStage();
    const env = createEnvironment(stage, getStyleKit());
    const moon = moonOf(stage);
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'pretty');
    stage.scene.overrideMaterial = new THREE.MeshNormalMaterial();
    beforeRender(stage);
    expect(moon.visible).toBe(false);
    stage.scene.overrideMaterial = null;
    beforeRender(stage);
    expect(moon.visible).toBe(true);
    getStyleKit().setGlowStrength(0);
  });

  it('draws its own halo on smooth and leaves most of it to bloom on pretty', () => {
    const stage = fakeStage();
    const env = createEnvironment(stage, getStyleKit());
    const halo = () => moonOf(stage).material.uniforms.halo.value as number;
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'smooth');
    const smooth = halo();
    env.apply({ weather: 'sunny', time: 'night', ground: 'grass' }, 'pretty');
    expect(smooth).toBe(1);
    expect(halo()).toBeGreaterThan(0);
    expect(halo()).toBeLessThan(smooth);
    getStyleKit().setGlowStrength(0);
  });

  it('asks for a shadow update on every apply: time and weather move the sun, the tier resizes its map', () => {
    const invalidateShadows = vi.fn();
    const stage = { scene: new THREE.Scene(), onFrame: () => {}, renderer: { toneMappingExposure: 1.4 }, invalidateShadows } as unknown as Stage;
    const env = createEnvironment(stage, getStyleKit());
    env.apply({ weather: 'sunny', time: 'day', ground: 'grass' }, 'pretty');
    env.apply({ weather: 'sunny', time: 'dusk', ground: 'grass' }, 'pretty');
    env.apply({ weather: 'rain', time: 'dusk', ground: 'grass' }, 'smooth');
    expect(invalidateShadows).toHaveBeenCalledTimes(3);
    const sun = stage.scene.children.find((c): c is THREE.DirectionalLight => c instanceof THREE.DirectionalLight)!;
    expect(sun.shadow.mapSize.x).toBe(2048); // smooth
    getStyleKit().setGlowStrength(0);
  });

  it('drives the motion uniforms: rain blows harder, night follows the time of day', () => {
    const stage = { scene: new THREE.Scene(), onFrame: () => {}, renderer: { toneMappingExposure: 1.4 }, invalidateShadows: () => {} } as unknown as Stage;
    const env = createEnvironment(stage, getStyleKit());
    env.apply({ weather: 'sunny', time: 'day', ground: 'grass' }, 'smooth');
    expect(motionUniforms.uWind.value).toBe(1);
    expect(motionUniforms.uNight.value).toBe(0);
    env.apply({ weather: 'rain', time: 'night', ground: 'grass' }, 'smooth');
    expect(motionUniforms.uWind.value).toBe(1); // the wind eases in with the frames, it does not jump
    for (let i = 0; i < 120; i++) advanceMotion(16);
    expect(motionUniforms.uWind.value).toBeGreaterThan(1.5);
    expect(motionUniforms.uNight.value).toBe(1);
    env.apply({ weather: 'sunny', time: 'dusk', ground: 'grass' }, 'smooth');
    for (let i = 0; i < 120; i++) advanceMotion(16);
    expect(motionUniforms.uWind.value).toBeCloseTo(1, 1);
    expect(motionUniforms.uNight.value).toBe(0.6);
    env.apply({ weather: 'sunny', time: 'day', ground: 'grass' }, 'smooth');
    getStyleKit().setGlowStrength(0);
  });

  it('drives the moonlight on water: full on a clear night, faint at dusk, none by day or in rain', () => {
    const stage = { scene: new THREE.Scene(), onFrame: () => {}, renderer: { toneMappingExposure: 1.4 }, invalidateShadows: () => {} } as unknown as Stage;
    const env = createEnvironment(stage, getStyleKit());
    const moon = (time: 'day' | 'dusk' | 'night', weather: 'sunny' | 'rain') => {
      env.apply({ weather, time, ground: 'grass' }, 'smooth');
      return motionUniforms.uMoon.value;
    };
    expect(moon('night', 'sunny')).toBe(1);
    expect(moon('dusk', 'sunny')).toBeCloseTo(0.35);
    expect(moon('night', 'rain')).toBe(0);
    expect(moon('day', 'sunny')).toBe(0);
    getStyleKit().setGlowStrength(0);
  });
});
