import { Point } from "@/types";

export const gridLayout = (points: Point[]) => {
  const numPoints = points.length;
  const numCols = Math.ceil(Math.sqrt(numPoints));
  const spacing = 0.15;

  for (let i = 0; i < numPoints; i++) {
    const point: Point = points[i];

    const col = i % numCols;
    const row = Math.floor(i / numCols);

    point.position = [col * spacing, -row * spacing, 0];
  }
};
