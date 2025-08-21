
export type Cell = [number, string]; // 0 for empty, string for color
export type Board = Cell[][];

export interface Piece {
  shape: number[][];
  color: string;
  pos: {
    x: number;
    y: number;
  };
  name: string;
}

export interface ScoreEntry {
    name: string;
    score: number;
}
