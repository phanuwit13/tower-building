import type { ItemModel } from '../models/contract';
import type { PaletteColor } from '../models/palette';

const COLORS: PaletteColor[] = ['wall', 'roof', 'grass', 'wood', 'stone', 'water', 'sun', 'sky', 'pink', 'white', 'roof', 'sun'];

function block(id: string, name: string, w: number, d: number, color: PaletteColor): ItemModel {
  const h = 0.4 + 0.2 * Math.max(w, d);
  return {
    id, name, category: 'decoration', footprint: { w, d },
    build: (kit) => kit.finish([kit.box([w * 0.9, h, d * 0.9], [0, h / 2, 0], color, { round: 0.08 })]),
  };
}

export function placeholderItems(): ItemModel[] {
  const spec: Array<[string, string, number, number]> = [
    ...['a', 'b', 'c', 'd'].map((s) => [`block-1x1-${s}`, `กล่อง 1×1 ${s}`, 1, 1] as [string, string, number, number]),
    ...['a', 'b', 'c', 'd'].map((s) => [`block-1x2-${s}`, `กล่อง 1×2 ${s}`, 1, 2] as [string, string, number, number]),
    ...['a', 'b', 'c'].map((s) => [`block-2x2-${s}`, `กล่อง 2×2 ${s}`, 2, 2] as [string, string, number, number]),
    ['block-2x3-a', 'กล่อง 2×3 a', 2, 3],
  ];
  return spec.map(([id, name, w, d], i) => block(id, name, w, d, COLORS[i]));
}
