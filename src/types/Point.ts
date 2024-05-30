export type Point = {
  position?: [number, number, number];
  sourcePosition?: [number, number, number];
  targetPosition?: [number, number, number];
  layoutPosition?: [number, number, number];
  scale?: [number, number, number];
  layoutScale?: [number, number, number];
  filteredOut?: boolean;
  thumbnail: {
    src: string;
    width: number;
    height?: number;
  };
  metadata?: any;
};

export type PointGroup = {
  position?: [number, number, number];
  scale?: [number, number, number];
  facet: string;
  points: Point[];
  labels: any[];
  // lines: any[];
  measurement?: [number, number, number];
};
