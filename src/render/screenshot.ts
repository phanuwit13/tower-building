import type { Stage } from './stage';

export interface ShareEnv {
  isTouch: boolean;
  canShare?: (d: ShareData) => boolean;
  share?: (d: ShareData) => Promise<void>;
  download(blob: Blob, name: string): void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `city-<theme>-<yyyy-mm-dd>.png`, using the local date. */
export function screenshotFilename(themeId: string, d: Date): string {
  return `city-${themeId}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.png`;
}

/**
 * PNG of exactly what the player sees (composer or plain render). The drawing buffer is not
 * preserved, so the frame is rendered and read back in the same task.
 */
export function captureCanvas(stage: Stage): Promise<Blob> {
  return new Promise((resolve, reject) => {
    stage.renderNow();
    stage.canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('screenshot: canvas produced no image'))), 'image/png');
  });
}

/** Share sheet on touch devices that can share files; otherwise (or if sharing breaks) download. */
export async function deliverImage(blob: Blob, name: string, env: ShareEnv): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], name, { type: 'image/png' });
  const data: ShareData = { files: [file] };
  if (env.isTouch && env.share && env.canShare?.(data)) {
    try {
      await env.share(data);
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  env.download(blob, name);
  return 'downloaded';
}

/** Real-browser `ShareEnv` built from `navigator` and `document`. */
export function createBrowserShareEnv(): ShareEnv {
  const nav = navigator;
  const isTouch = nav.maxTouchPoints > 0 || (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches);
  return {
    isTouch,
    canShare: typeof nav.canShare === 'function' ? (d) => nav.canShare(d) : undefined,
    share: typeof nav.share === 'function' ? (d) => nav.share(d) : undefined,
    download(blob, name) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    },
  };
}
