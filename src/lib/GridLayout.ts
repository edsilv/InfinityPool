import { Point, PointGroup } from "@/types";
import { getUnfilteredPoints, groupPointsByFacet } from "./Layouts";
import { config } from "@/Config";

export const gridLayout = (points: Point[], facet: string) => {
  let totalRows = 0;
  const visiblePoints = getUnfilteredPoints(points);
  let visiblePointGroups = groupPointsByFacet(visiblePoints, facet);

  // Sort the groups by the number of points in ascending order
  visiblePointGroups = visiblePointGroups
    .sort((a, b) => a.points.length - b.points.length)
    .reverse();

  visiblePointGroups.forEach((group) => {
    group.position = [0, totalRows * config.pointGroupSpacing, 0];
    totalRows = layout(group, totalRows);
  });

  return { pointGroups: visiblePointGroups };
};

const layout = (pointGroup: PointGroup, totalRows: number) => {
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

  return totalRows + numRows;
};

// const layout = (pointGroup: PointGroup) => {
//   const numPoints = pointGroup.points.length;
//   const numCols = Math.ceil(Math.sqrt(numPoints));
//   const colWidth = 1 + 1 / numCols;

//   for (let i = 0; i < numPoints; i++) {
//     const point = pointGroup.points[i];
//     const col = i % numCols;
//     const row = numCols - 1 - Math.floor(i / numCols);

//     point.position = [
//       (col * colWidth + pointGroup.position![0]) * config.pointSpacing,
//       (row * colWidth + pointGroup.position![1]) * config.pointSpacing,
//       pointGroup.position![2],
//     ];
//   }
// };
