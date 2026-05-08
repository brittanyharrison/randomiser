export interface Item {
  id: string;
  name: string;
  image?: string;
}

export interface Reel {
  id: string;
  name: string;
  items: Item[];
  isColour?: boolean;
}

export interface SpinEntry {
  id: string;
  timestamp: number;
  results: { reelId: string; reelName: string; item: Item }[];
}
