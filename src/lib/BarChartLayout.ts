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

  // Position groups along the x-axis
  visiblePointGroups.forEach((group, index) => {
    group.position = [index * config.pointGroupSpacing, 0, 0];
    barChartLayout(group);
  });

  return { pointGroups: visiblePointGroups };
};

const barChartLayout = (pointGroup: PointGroup) => {
  // Position points vertically within each group
  const numPoints = pointGroup.points.length;

  for (let i = 0; i < numPoints; i++) {
    const point = pointGroup.points[i];
    point.position = [pointGroup.position![0], i * config.pointSpacing, 0];
  }
};
