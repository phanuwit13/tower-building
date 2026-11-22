export const GRID_SIZE = 20;
export type Rotation = 0 | 1 | 2 | 3; // quarter turns
export interface Footprint { w: number; d: number } // tiles along x / z at rotation 0
export interface ItemSpec { id: string; footprint: Footprint }
export interface Catalog { themeId: string; order: readonly string[]; items: Readonly<Record<string, ItemSpec>> }
export interface Placement { uid: number; itemId: string; x: number; z: number; rotation: Rotation } // x,z = min-corner tile of the rotated footprint
export const WEATHER_IDS = ['sunny', 'rain'] as const;
export const TIME_IDS = ['dawn', 'day', 'dusk', 'night'] as const;
export const GROUND_IDS = ['grass', 'dirt', 'concrete', 'sand', 'snow', 'wood', 'moon'] as const;
export const QUALITY_TIERS = ['pretty', 'smooth'] as const;
export const STATUSES = ['playing', 'finished'] as const;
export type WeatherId = (typeof WEATHER_IDS)[number];
export type TimeId = (typeof TIME_IDS)[number];
export type GroundId = (typeof GROUND_IDS)[number];
export type QualityTier = (typeof QUALITY_TIERS)[number];
export type GameStatus = (typeof STATUSES)[number];
export interface SceneSettings { weather: WeatherId; time: TimeId; ground: GroundId }
export interface GameState {
  themeId: string; settings: SceneSettings; placements: Placement[];
  bag: string[]; // ids still to draw; next draw = bag[0]
  rng: number; // uint32 PRNG state
  current: string; next: string;
  status: GameStatus; nextUid: number;
}
export interface FillStats { items: number; tilesUsed: number; percent: number } // percent = round(tilesUsed / GRID_SIZE^2 * 100)
