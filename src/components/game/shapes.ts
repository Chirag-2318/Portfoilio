export interface GameShape {
  id: string;
  name: string;
  path: string;
  evenodd?: boolean;
}

export const SHAPES: GameShape[] = [
  {
    id: "circle",
    name: "Circle",
    path: "M50 12 A38 38 0 1 1 49.99 12 Z",
  },
  {
    id: "square",
    name: "Square",
    path: "M16 16 H84 V84 H16 Z",
  },
  {
    id: "triangle",
    name: "Triangle",
    path: "M50 12 L90 82 H10 Z",
  },
  {
    id: "ring",
    name: "Ring",
    path: "M50 12 A38 38 0 1 1 49.99 12 Z M50 30 A20 20 0 1 0 50.01 30 Z",
    evenodd: true,
  },
  {
    id: "cross",
    name: "Cross",
    path: "M38 12 H62 V38 H88 V62 H62 V88 H38 V62 H12 V38 H38 Z",
  },
  {
    id: "rounded-rect",
    name: "Rounded Rectangle",
    path: "M22 24 H78 A10 10 0 0 1 88 34 V66 A10 10 0 0 1 78 76 H22 A10 10 0 0 1 12 66 V34 A10 10 0 0 1 22 24 Z",
  },
  {
    id: "glyph-c",
    name: "Glyph C",
    path: "M79.1 25.6 A38 38 0 1 0 79.1 74.4 L66.9 64.1 A22 22 0 1 1 66.9 35.9 Z",
  },
  {
    id: "glyph-p",
    name: "Glyph P",
    path: "M26 14 H58 A26 26 0 0 1 58 66 H44 V86 H26 Z M44 30 V50 H56 A10 10 0 0 0 56 30 Z",
    evenodd: true,
  },
];

export function getShapeForPrints(prints: number): GameShape {
  return SHAPES[prints % SHAPES.length];
}

