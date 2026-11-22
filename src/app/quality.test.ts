import { describe, expect, it } from 'vitest';
import { FpsMonitor, detectTier } from './quality';

const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36';

describe('detectTier', () => {
  it('picks smooth for a ChromeOS UA', () => {
    expect(detectTier({ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/120', hardwareConcurrency: 8, deviceMemory: 8 })).toBe('smooth');
  });
  it('picks smooth for iPadOS reporting a desktop Mac UA with touch', () => {
    expect(detectTier({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', maxTouchPoints: 5 })).toBe('smooth');
  });
  it('picks smooth for phones', () => {
    expect(detectTier({ userAgent: 'Mozilla/5.0 (Linux; Android 13) Mobile Chrome/120' })).toBe('smooth');
    expect(detectTier({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })).toBe('smooth');
  });
  it('picks pretty for a real Mac (no touch) and for a strong desktop', () => {
    expect(detectTier({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0, hardwareConcurrency: 8 })).toBe('pretty');
    expect(detectTier({ userAgent: DESKTOP, hardwareConcurrency: 8, deviceMemory: 8 })).toBe('pretty');
  });
  it('picks smooth for low memory or few cores', () => {
    expect(detectTier({ userAgent: DESKTOP, hardwareConcurrency: 8, deviceMemory: 4 })).toBe('smooth');
    expect(detectTier({ userAgent: DESKTOP, hardwareConcurrency: 4, deviceMemory: 8 })).toBe('smooth');
  });
  it('treats unknown hardware as capable', () => {
    expect(detectTier({ userAgent: DESKTOP })).toBe('pretty');
  });
});

/** Feed `fps` frames per second for `seconds`, starting at `start`; returns results and end time. */
function feed(m: FpsMonitor, fps: number, seconds: number, start = 0) {
  const results: Array<'ok' | 'drop'> = [];
  const step = 1000 / fps;
  const n = Math.round(fps * seconds);
  let t = start;
  for (let i = 0; i <= n; i++) {
    results.push(m.sample(t));
    t += step;
  }
  return { results, end: t - step };
}

describe('FpsMonitor', () => {
  it('drops exactly once for 20 fps over 5 s', () => {
    const { results } = feed(new FpsMonitor(), 20, 8);
    expect(results.filter((r) => r === 'drop')).toHaveLength(1);
  });
  it('never drops at 60 fps for 30 s', () => {
    expect(feed(new FpsMonitor(), 60, 30).results).not.toContain('drop');
  });
  it('does not drop for a single 3 s gap', () => {
    const m = new FpsMonitor();
    const a = feed(m, 60, 3);
    m.sample(a.end + 3000);
    const b = feed(m, 60, 6, a.end + 3000 + 16);
    expect([...a.results, ...b.results]).not.toContain('drop');
  });
  it('can drop again after reset', () => {
    const m = new FpsMonitor();
    expect(feed(m, 20, 8).results).toContain('drop');
    m.reset();
    expect(feed(m, 20, 8, 100000).results).toContain('drop');
  });
});
