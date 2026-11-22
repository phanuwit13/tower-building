import { describe, expect, it } from 'vitest';
import { GRID_SIZE, TIME_IDS, WEATHER_IDS } from '../game/types';
import { acesFilmic, envPreset } from './environment';
import { CAMERA } from './stage';

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
