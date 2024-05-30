import { Point, PointGroup } from "@/types";
import { getUnfilteredPoints, groupPointsByFacet } from "./Layouts";
import { config } from "@/Config";

export const listLayout = (points: Point[], facet: string) => {
  const visiblePoints = getUnfilteredPoints(points);
  let visiblePointGroups = groupPointsByFacet(visiblePoints, facet);

  // Sort the groups by the number of points in ascending order
  visiblePointGroups = visiblePointGroups
    .sort((a, b) => a.points.length - b.points.length)
    .reverse();

  visiblePointGroups.forEach((group, i) => {
    group.position = [0, i * config.pointGroupSpacing, 0];
    layout(group);
  });

  return { pointGroups: visiblePointGroups };
};

const layout = (pointGroup: PointGroup) => {
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
