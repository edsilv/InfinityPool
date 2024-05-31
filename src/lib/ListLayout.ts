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

  const totalGroups = visiblePointGroups.length;

  visiblePointGroups.forEach((group, i) => {
    group.position = [0, (totalGroups - 1 - i) * config.pointGroupSpacing, 0];
    listLayout(group);
  });

  return { pointGroups: visiblePointGroups };
};

const listLayout = (pointGroup: PointGroup) => {
  const numPoints = pointGroup.points.length;

  for (let i = 0; i < numPoints; i++) {
    const point = pointGroup.points[i];
    point.position = [
      i * config.pointSpacing,
      pointGroup.position![1] * config.pointSpacing,
      pointGroup.position![2],
    ];
  }
};
