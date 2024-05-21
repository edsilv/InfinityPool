import { Point } from "@/types";

export const listLayout = (points: Point[]) => {
  const numPoints = points.length;
  const numCols = Math.ceil(Math.sqrt(numPoints));
  const numRows = numCols;
  const spacing = 0.3;

  for (let i = 0; i < numPoints; i++) {
    const point: Point = points[i];

    const col = (i % numCols) - numCols / 2;
    const row = Math.floor(i / numCols) - numRows / 2;

    point.position = [col * spacing, row * spacing, 0];
  }
};
