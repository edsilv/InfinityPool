export type Point = {
  position: [number, number, number];
  sourcePosition: [number, number];
  targetPosition: [number, number];
  thumbnail: {
    src: string;
    width: number;
    height: number;
  };
};
