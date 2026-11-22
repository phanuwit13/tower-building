export const GRID_SIZE = 10;
export type Rotation = 0 | 1 | 2 | 3; // quarter turns
export interface Footprint { w: number; d: number } // tiles along x / z at rotation 0
export interface ItemSpec { id: string; footprint: Footprint }
export interface Catalog { themeId: string; order: readonly string[]; items: Readonly<Record<string, ItemSpec>> }
export interface Placement { uid: number; itemId: string; x: number; z: number; rotation: Rotation } // x,z = min-corner tile of the rotated footprint
export type WeatherId = 'sunny' | 'rain';
export type TimeId = 'dawn' | 'day' | 'dusk' | 'night';
export type GroundId = 'grass' | 'dirt' | 'concrete' | 'sand' | 'snow' | 'wood' | 'moon';
export type QualityTier = 'pretty' | 'smooth';
export interface SceneSettings { weather: WeatherId; time: TimeId; ground: GroundId }
export interface GameState {
  themeId: string; settings: SceneSettings; placements: Placement[];
  bag: string[]; // ids still to draw; next draw = bag[0]
  rng: number; // uint32 PRNG state
  current: string; next: string;
  status: 'playing' | 'finished'; nextUid: number;
}
export interface FillStats { items: number; tilesUsed: number; percent: number } // percent = Math.round(tilesUsed) (100 tiles)
