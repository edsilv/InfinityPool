import { Point, PointGroup } from "@/types";
import { getUnfilteredPoints, groupPointsByFacet } from "./Layouts";
import { config } from "@/Config";

interface GridLayoutOptions {
  orderBy: "ascending" | "descending";
}

export const layout = (
  points: Point[],
  facet: string,
  options: GridLayoutOptions = { orderBy: "ascending" }
) => {
  const visiblePoints = getUnfilteredPoints(points);
  let visiblePointGroups = groupPointsByFacet(visiblePoints, facet);

  // Sort the groups by the number of points
  visiblePointGroups = visiblePointGroups.sort((a, b) => {
    const comparison = a.points.length - b.points.length;
    return options.orderBy === "ascending" ? comparison : -comparison;
  });

  // Calculate total number of rows first
  let totalRows = 0;
  visiblePointGroups.forEach((group) => {
    const numPoints = group.points.length;
    const numRows = Math.ceil(numPoints / Math.ceil(Math.sqrt(numPoints)));
    totalRows += numRows;
  });

  // Position rows from bottom upwards
  visiblePointGroups.forEach((group) => {
    const numPoints = group.points.length;
    const numRows = Math.ceil(numPoints / Math.ceil(Math.sqrt(numPoints)));
    group.position = [0, (totalRows - numRows) * config.pointGroupSpacing, 0];
    totalRows -= numRows;
    gridLayout(group);
  });

  return { pointGroups: visiblePointGroups };
};

const gridLayout = (pointGroup: PointGroup) => {
  // reverse the order of the points
  const numPoints = pointGroup.points.length;
  const numCols = Math.ceil(Math.sqrt(numPoints));
  const numRows = Math.ceil(numPoints / numCols);

  for (let i = 0; i < numPoints; i++) {
    const point = pointGroup.points[i];
    const col = i % numCols;
    const row = Math.floor(i / numCols);

    point.position = [
      (col + pointGroup.position![0]) * config.pointSpacing,
      (numRows - 1 - row + pointGroup.position![1]) * config.pointSpacing,
      pointGroup.position![2],
    ];
  }
};
