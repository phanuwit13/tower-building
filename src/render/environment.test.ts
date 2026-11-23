import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { GRID_SIZE, TIME_IDS, WEATHER_IDS } from '../game/types';
import { getStyleKit } from '../models/kit';
import { advanceMotion, glslFloat, motionUniforms } from '../models/motion';
import { acesFilmic, createEnvironment, envPreset, MOON, SKY_FROM } from './environment';
import { CAMERA, type Stage } from './stage';
import { SURROUND_FADE } from './ground';

const ALL = TIME_IDS.flatMap((time) => WEATHER_IDS.map((weather) => ({ time, weather })));

function saturation(hex: number): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function luma(hex: number): number {
  return 0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255);
}

/** Red minus blue: how warm (orange) rather than cool (blue) a colour is. */
function warmth(hex: number): number {
  return ((hex >> 16) & 255) - (hex & 255);
}

const TIERS = ['smooth', 'pretty'] as const;

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
    for (const { time, weather } of ALL) for (const nightGlow of [1, 1.5, 2]) {
      const p = envPreset(time, weather, nightGlow);
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

describe('envPreset: a theme\'s city night (nightGlow)', () => {
  it('is exactly today\'s look at the default factor 1, for every time, weather and tier (the other themes)', () => {
    for (const { time, weather } of ALL) expect(envPreset(time, weather, 1), `${time} ${weather}`).toEqual(envPreset(time, weather));
    for (const { time, weather } of ALL) for (const tier of TIERS) {
      expect(envPreset(time, weather, 1, tier), `${time} ${weather} ${tier}`).toEqual(envPreset(time, weather));
    }
    // the hand-tuned night itself, so the default can never drift
    expect(envPreset('night', 'sunny')).toMatchObject({
      sky: 0x121a44, fog: 0x2b3874, hemiSky: 0x5f6fd8, hemiGround: 0x2e2a52, hemiIntensity: 0.9, sunColor: 0xaab8ff, sunIntensity: 0.8, glowStrength: 1,
    });
  });

  it('never makes a night darker: a factor below 1 is the standard look', () => {
    for (const { time, weather } of ALL) expect(envPreset(time, weather, 0.5), `${time} ${weather}`).toEqual(envPreset(time, weather));
  });

  it('holds a factor above 2 to 2 (a theme cannot over-light its night)', () => {
    for (const { time, weather } of ALL) expect(envPreset(time, weather, 9), `${time} ${weather}`).toEqual(envPreset(time, weather, 2));
  });

  it('leaves day and dawn exactly as they are, on either tier', () => {
    for (const time of ['dawn', 'day'] as const) {
      for (const weather of WEATHER_IDS) for (const tier of TIERS) {
        expect(envPreset(time, weather, 1.5, tier), `${time} ${weather} ${tier}`).toEqual(envPreset(time, weather));
      }
    }
  });

  it('at night lifts the fill light with warm city light and lightens the horizon, and it is still night', () => {
    const night = envPreset('night', 'sunny');
    const city = envPreset('night', 'sunny', 1.5);
    expect(city.hemiIntensity).toBeGreaterThan(night.hemiIntensity * 1.2);
    expect(luma(city.hemiGround)).toBeGreaterThan(luma(night.hemiGround)); // light bouncing up from the lit street
    expect(warmth(city.hemiGround)).toBeGreaterThan(warmth(night.hemiGround));
    expect(warmth(city.hemiSky)).toBeGreaterThan(warmth(night.hemiSky));
    expect(luma(city.fog)).toBeGreaterThan(luma(night.fog)); // city light pollution at the horizon
    expect(luma(city.fog)).toBeLessThan(luma(envPreset('dusk', 'sunny').fog)); // a glow, not a sunset
    // the deep blue sky overhead, the moon, the stars and the moonlight's strength stay
    expect(city).toMatchObject({ sky: night.sky, sunIntensity: night.sunIntensity, moon: 1, stars: true });
  });

  it('takes the moonlit blue out of a city night\'s light, so painted colours (reds, yellows, greens) read as themselves', () => {
    const blueCast = (hex: number) => -warmth(hex);
    for (const weather of WEATHER_IDS) {
      const night = envPreset('night', weather);
      const city = envPreset('night', weather, 1.5);
      // the fill's sky colour (it lights roofs and the street) keeps at most a hint of the blue
      expect(blueCast(city.hemiSky), weather).toBeLessThan(blueCast(night.hemiSky) / 3);
      expect(saturation(city.hemiSky), weather).toBeLessThan(saturation(night.hemiSky) / 2);
      // the light bounced up from the lit street is warm, not violet
      expect(warmth(city.hemiGround), weather).toBeGreaterThan(0);
      // the moonlight loses about half its blue but none of its brightness
      expect(blueCast(city.sunColor), weather).toBeLessThan(0.6 * blueCast(night.sunColor));
      expect(Math.abs(luma(city.sunColor) - luma(night.sunColor)), weather).toBeLessThan(2);
    }
  });

  it('leaves dusk\'s setting sun alone (only the moonlight is cooled at night)', () => {
    for (const weather of WEATHER_IDS) expect(envPreset('dusk', weather, 1.5).sunColor, weather).toBe(envPreset('dusk', weather).sunColor);
  });

  it('only ever adds light: no colour of a city dusk or night is darker than the standard one', () => {
    for (const time of ['dusk', 'night'] as const) {
      for (const weather of WEATHER_IDS) {
        const base = envPreset(time, weather);
        const city = envPreset(time, weather, 1.5);
        for (const k of ['fog', 'hemiSky', 'hemiGround'] as const) expect(luma(city[k]), `${time} ${weather} ${k}`).toBeGreaterThanOrEqual(luma(base[k]));
      }
    }
  });

  it('on smooth (no bloom) strengthens the glowing parts with the factor, and less at dusk', () => {
    const night = envPreset('night', 'sunny', 1.5, 'smooth').glowStrength;
    expect(night).toBeCloseTo(1.6);
    expect(envPreset('night', 'rain', 1.5, 'smooth').glowStrength).toBe(night);
    expect(envPreset('night', 'sunny', 2, 'smooth').glowStrength).toBeGreaterThan(night);
    const dusk = envPreset('dusk', 'sunny', 1.5, 'smooth').glowStrength;
    expect(dusk).toBeGreaterThan(0.6);
    expect(dusk / 0.6).toBeLessThan(night);
  });

  it('on pretty keeps any night\'s glow: bloom already spreads it, and more would wash the neon and windows white', () => {
    for (const { time, weather } of ALL) for (const f of [1.5, 2]) {
      expect(envPreset(time, weather, f, 'pretty').glowStrength, `${time} ${weather} ${f}`).toBe(envPreset(time, weather).glowStrength);
    }
    expect(envPreset('night', 'sunny', 1.5).glowStrength).toBe(1); // pretty is the default tier
  });

  it('lights a city night the same on both tiers apart from the glow', () => {
    for (const { time, weather } of ALL) {
      const { glowStrength: _s, ...smooth } = envPreset(time, weather, 1.5, 'smooth');
      const { glowStrength: _p, ...pretty } = envPreset(time, weather, 1.5, 'pretty');
      expect(smooth, `${time} ${weather}`).toEqual(pretty);
    }
  });

  it('lifts dusk less than night, and more for a bigger factor', () => {
    const lift = (time: 'dusk' | 'night', f: number) => envPreset(time, 'sunny', f).hemiIntensity / envPreset(time, 'sunny').hemiIntensity;
    expect(lift('dusk', 1.5)).toBeGreaterThan(1);
    expect(lift('dusk', 1.5)).toBeLessThan(lift('night', 1.5));
    expect(lift('night', 1.25)).toBeLessThan(lift('night', 1.5));
    expect(lift('night', 1.5)).toBeLessThan(lift('night', 2));
    expect(luma(envPreset('night', 'sunny', 1.25).fog)).toBeLessThan(luma(envPreset('night', 'sunny', 1.5).fog));
  });

  it('rain still greys and dims a city night', () => {
    const sunny = envPreset('night', 'sunny', 1.5);
    const rain = envPreset('night', 'rain', 1.5);
    expect(rain.hemiIntensity).toBeCloseTo(sunny.hemiIntensity * 0.7);
    expect(saturation(rain.fog)).toBeLessThan(saturation(sunny.fog));
    expect(rain.hemiIntensity).toBeGreaterThan(envPreset('night', 'rain').hemiIntensity);
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

  /** The default camera tilted down to the lowest angle the controls allow (stage.ts maxPolarAngle), at a given distance. */
  const tiltedCamera = (distance: number) => {
    const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
    const flat = new THREE.Vector3(CAMERA.direction.x, 0, CAMERA.direction.z).normalize();
    const polar = 1.25;
    const dir = flat.multiplyScalar(Math.sin(polar)).setY(Math.cos(polar));
    const cam = new THREE.PerspectiveCamera(CAMERA.fov, 1280 / 800, 0.1, 300);
    cam.position.copy(centre).addScaledVector(dir, distance);
    cam.lookAt(centre);
    cam.updateMatrixWorld();
    return cam;
  };
  const project = (cam: THREE.PerspectiveCamera, dir: THREE.Vector3) => cam.position.clone().addScaledVector(dir, MOON.distance).project(cam);
  /** How far from the map centre the moon's line of sight meets the ground (Infinity if it never does). */
  const landHit = (cam: THREE.PerspectiveCamera) => {
    const [dx, dy, dz] = MOON.dir;
    if (dy >= 0) return Infinity;
    const t = (SURROUND_FADE.y - cam.position.y) / dy;
    return Math.hypot(cam.position.x + dx * t - GRID_SIZE / 2, cam.position.z + dz * t - GRID_SIZE / 2);
  };

  it('is in the sky, so the steep default view (which shows no sky) does not show it', () => {
    expect(MOON.dir[1]).toBeGreaterThan(Math.sin(-0.2)); // within about 11° of the horizon, not down in the land
    expect(project(defaultCamera(), new THREE.Vector3(...MOON.dir)).y).toBeGreaterThan(1); // above the top of the view
  });

  it('rises over the far side of the city when the camera is tilted towards the horizon, halo and all on screen', () => {
    for (const distance of [CAMERA.distance, CAMERA.maxDistance]) {
      const cam = tiltedCamera(distance);
      const dir = new THREE.Vector3(...MOON.dir);
      const c = project(cam, dir);
      expect(c.z, `${distance}`).toBeLessThan(1); // in front of the camera, inside the far plane
      expect(c.y, `${distance}`).toBeGreaterThan(0.2); // the upper part of the screen, where the sky is
      expect(Math.abs(c.x), `${distance}`).toBeLessThan(0.5); // not under the corner buttons
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      expect(project(cam, dir.clone().addScaledVector(up, MOON.haloRadius).normalize()).y, `${distance}`).toBeLessThan(1);
      expect(landHit(cam), `${distance}`).toBeGreaterThan(SURROUND_FADE.end); // past the land: in clear sky
    }
  });

  it('is covered by the land when zoomed right in (its line of sight meets the map)', () => {
    expect(landHit(tiltedCamera(CAMERA.minDistance))).toBeLessThan(SKY_FROM);
  });

  it('shows the moon and stars only over land that has melted into the sky', () => {
    expect(SKY_FROM).toBeGreaterThan(SURROUND_FADE.start);
    expect(SKY_FROM).toBeLessThan(SURROUND_FADE.end);
    // the steep default view's top edge meets the ground well inside SKY_FROM: no stars over the green there
    const cam = defaultCamera();
    const top = new THREE.Vector3(0, 1, 0.5).unproject(cam).sub(cam.position).normalize();
    const t = (SURROUND_FADE.y - cam.position.y) / top.y;
    const far = Math.hypot(cam.position.x + top.x * t - GRID_SIZE / 2, cam.position.z + top.z * t - GRID_SIZE / 2);
    expect(far).toBeLessThan(SKY_FROM);
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

  it('a theme\'s night glow brightens the fill light and the glowing parts, not how night it is (water)', () => {
    const stage = { scene: new THREE.Scene(), onFrame: () => {}, renderer: { toneMappingExposure: 1.4 }, invalidateShadows: () => {} } as unknown as Stage;
    const kit = getStyleKit();
    const env = createEnvironment(stage, kit);
    const hemi = stage.scene.children.find((c): c is THREE.HemisphereLight => c instanceof THREE.HemisphereLight)!;
    const night = { weather: 'sunny', time: 'night', ground: 'concrete' } as const;
    env.apply(night, 'smooth');
    expect(hemi.intensity).toBe(envPreset('night', 'sunny').hemiIntensity);
    expect(kit.getGlowStrength()).toBe(1);
    env.apply(night, 'smooth', 1.5);
    expect(hemi.intensity).toBe(envPreset('night', 'sunny', 1.5).hemiIntensity);
    expect(hemi.groundColor.getHex()).toBe(envPreset('night', 'sunny', 1.5).hemiGround);
    expect(kit.getGlowStrength()).toBe(envPreset('night', 'sunny', 1.5, 'smooth').glowStrength);
    expect(kit.getGlowStrength()).toBeGreaterThan(1);
    expect(motionUniforms.uNight.value).toBe(1);
    env.apply(night, 'pretty', 1.5); // the tier picks the glow: bloom does the rest on pretty
    expect(kit.getGlowStrength()).toBe(envPreset('night', 'sunny', 1.5, 'pretty').glowStrength);
    expect(hemi.intensity).toBe(envPreset('night', 'sunny', 1.5).hemiIntensity);
    env.apply({ ...night, time: 'dusk' }, 'smooth', 1.5);
    expect(motionUniforms.uNight.value).toBe(0.6); // water dims by the time of day alone
    env.apply({ ...night, time: 'day' }, 'smooth', 1.5);
    expect(kit.getGlowStrength()).toBe(0);
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
