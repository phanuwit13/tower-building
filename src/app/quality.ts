import type { QualityTier } from '../game/types';

export interface DeviceInfo {
  userAgent: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
}

/** Pick the starting graphics tier: phones, tablets, Chromebooks and weak hardware start on smooth. */
export function detectTier(info: DeviceInfo): QualityTier {
  const ua = info.userAgent;
  if (/Android|iPhone|iPad|Mobile|CrOS/.test(ua)) return 'smooth';
  if (/Macintosh/.test(ua) && (info.maxTouchPoints ?? 0) > 1) return 'smooth'; // iPadOS posing as a Mac
  if (info.deviceMemory !== undefined && info.deviceMemory <= 4) return 'smooth';
  if (info.hardwareConcurrency !== undefined && info.hardwareConcurrency <= 4) return 'smooth';
  return 'pretty';
}

const MAX_GAP_MS = 1000;

/**
 * Sustained-low-FPS detector. Feed it one timestamp per frame; it answers 'drop' once, when the
 * average over a full window is below `minFps`. A long gap (hidden tab) restarts the window.
 */
export class FpsMonitor {
  private readonly minFps: number;
  private readonly windowMs: number;
  private start = -1;
  private last = -1;
  private frames = 0;
  private dropped = false;

  constructor(o: { minFps?: number; windowMs?: number } = {}) {
    this.minFps = o.minFps ?? 30;
    this.windowMs = o.windowMs ?? 5000;
  }

  sample(nowMs: number): 'ok' | 'drop' {
    if (this.dropped) return 'ok';
    if (this.start < 0 || nowMs - this.last > MAX_GAP_MS) {
      this.start = nowMs;
      this.last = nowMs;
      this.frames = 0;
      return 'ok';
    }
    this.last = nowMs;
    this.frames++;
    const elapsed = nowMs - this.start;
    if (elapsed < this.windowMs) return 'ok';
    const fps = (this.frames * 1000) / elapsed;
    if (fps < this.minFps) {
      this.dropped = true;
      return 'drop';
    }
    this.start = nowMs;
    this.frames = 0;
    return 'ok';
  }

  reset(): void {
    this.start = -1;
    this.last = -1;
    this.frames = 0;
    this.dropped = false;
  }
}
