import { describe, expect, it, vi } from 'vitest';
import { deliverImage, isTabletLike, screenshotFilename, type ShareEnv } from './screenshot';

const blob = new Blob(['x'], { type: 'image/png' });

function env(over: Partial<ShareEnv> = {}): ShareEnv {
  return { isTouch: true, canShare: () => true, share: vi.fn(async () => {}), download: vi.fn(), ...over };
}

describe('screenshotFilename', () => {
  it('uses the local date', () => {
    expect(screenshotFilename('school', new Date(2026, 0, 5))).toBe('city-school-2026-01-05.png');
  });
});

describe('deliverImage', () => {
  it('shares on touch when files can be shared', async () => {
    const e = env();
    expect(await deliverImage(blob, 'a.png', e)).toBe('shared');
    expect(e.share).toHaveBeenCalledTimes(1);
    const data = (e.share as ReturnType<typeof vi.fn>).mock.calls[0][0] as ShareData;
    expect(data.files?.[0].name).toBe('a.png');
    expect(data.files?.[0].type).toBe('image/png');
    expect(e.download).not.toHaveBeenCalled();
  });

  it('does nothing more when the share sheet is cancelled', async () => {
    const e = env({ share: vi.fn(async () => { throw new DOMException('', 'AbortError'); }) });
    expect(await deliverImage(blob, 'a.png', e)).toBe('cancelled');
    expect(e.download).not.toHaveBeenCalled();
  });

  it('downloads when sharing fails for another reason', async () => {
    const e = env({ share: vi.fn(async () => { throw new Error('boom'); }) });
    expect(await deliverImage(blob, 'a.png', e)).toBe('downloaded');
    expect(e.download).toHaveBeenCalledWith(blob, 'a.png');
  });

  it('downloads on non-touch even when canShare is true', async () => {
    const e = env({ isTouch: false });
    expect(await deliverImage(blob, 'a.png', e)).toBe('downloaded');
    expect(e.share).not.toHaveBeenCalled();
  });

  it('downloads when canShare is missing', async () => {
    const e = env({ canShare: undefined });
    expect(await deliverImage(blob, 'a.png', e)).toBe('downloaded');
    expect(e.share).not.toHaveBeenCalled();
  });

  it('downloads when canShare is false or share is missing', async () => {
    expect(await deliverImage(blob, 'a.png', env({ canShare: () => false }))).toBe('downloaded');
    expect(await deliverImage(blob, 'a.png', env({ share: undefined }))).toBe('downloaded');
  });
});

describe('isTabletLike', () => {
  const win = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';
  const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/16.0 Safari/605.1.15';
  it('touchscreen Windows/ChromeOS laptop with a fine pointer is not a tablet', () => {
    expect(isTabletLike({ coarsePointer: false, userAgent: win, maxTouchPoints: 10 })).toBe(false);
  });
  it('iPadOS with a desktop user agent and touch is a tablet', () => {
    expect(isTabletLike({ coarsePointer: false, userAgent: mac, maxTouchPoints: 5 })).toBe(true);
  });
  it('Android tablet (coarse pointer) is a tablet', () => {
    expect(isTabletLike({ coarsePointer: true, userAgent: 'Mozilla/5.0 (Linux; Android 13)', maxTouchPoints: 5 })).toBe(true);
  });
  it('a mouse-only desktop (also a Mac) is not', () => {
    expect(isTabletLike({ coarsePointer: false, userAgent: win, maxTouchPoints: 0 })).toBe(false);
    expect(isTabletLike({ coarsePointer: false, userAgent: mac, maxTouchPoints: 0 })).toBe(false);
  });
});

describe('deliverImage share errors', () => {
  it('warns about a non-abort share error before downloading', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const e = env({ share: vi.fn(async () => { throw new Error('boom'); }) });
    await deliverImage(blob, 'a.png', e);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
