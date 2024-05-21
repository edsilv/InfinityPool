import { Point } from "@/types";

export const listLayout = (points: Point[]) => {
  const numPoints = points.length;
  const spacing = 0.15;

  for (let i = 0; i < numPoints; i++) {
    const point: Point = points[i];

    const col = i; // Set col to the index of the point
    const row = 0; // Set row to 0

    point.position = [col * spacing, row * spacing, 0];
  }
};
