export type Point = {
  position?: [number, number, number];
  sourcePosition?: [number, number, number];
  targetPosition?: [number, number, number];
  thumbnail: {
    src: string;
    width: number;
    height?: number;
  };
  metadata?: any;
};
