import { useEffect } from "react";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { gridLayout } from "./GridLayout";
import { listLayout } from "./ListLayout";
import { Layout, Point, PointGroup } from "@/types";
import { AppState } from "@/Store";
import { groupBy } from "./utils";
import { Vector3 } from "three";

export function applyLayout(layout: Layout, facet: string, points: Point[]) {
  switch (layout.type) {
    case "list":
      listLayout(points, facet);
      break;
    case "grid":
    default: {
      gridLayout(points, facet);
    }
  }
}

export function useSourceTargetLayout() {
  const facet = useAppContext((state: AppState) => state.facet);
  const src = useAppContext((state: AppState) => state.src);
  const points = useAppContext((state: AppState) => state.points);
  const layout = useAppContext((state: AppState) => state.layout);

  let layoutProps;

  // prep for new animation by storing source
  useEffect(() => {
    // console.log("get source positions");
    for (let i = 0; i < points.length; ++i) {
      const point: Point = points[i];
      point.sourcePosition = { ...point.position! } || [0, 0, 0];
    }
  }, [src, layout, facet]);

  // run layout (get target positions)
  useEffect(() => {
    // console.log("apply layout");
    applyLayout(layout, facet, points);
  }, [src, layout, facet]);

  // store target positions
  useEffect(() => {
    // console.log("get target positions");
    for (let i = 0; i < points.length; ++i) {
      const point = points[i];
      point.targetPosition = { ...point.position! };
      // point.targetScale = point.filteredOut ? [0, 0, 0] : { ...point.scale };
    }
  }, [src, layout, facet]);

  return layoutProps;
}

export function interpolateSourceTargetPosition(
  points: Point[],
  progress: number
) {
  const numPoints = points.length;

  for (let i = 0; i < numPoints; i++) {
    const point = points[i];

    if (point.position) {
      point.position[0] =
        (1 - progress) * point.sourcePosition![0] +
        progress * point.targetPosition![0];
      point.position[1] =
        (1 - progress) * point.sourcePosition![1] +
        progress * point.targetPosition![1];
      point.position[2] =
        (1 - progress) * point.sourcePosition![2] +
        progress * point.targetPosition![2];
    }
  }
}

export function resetSourcePositionScale(point: Point) {
  if (point.position) {
    point.sourcePosition = { ...point.position };
  }
}

// utils
export const groupPointsByFacet = (
  points: Point[],
  facet: string
): PointGroup[] => {
  const groupedByFacet = groupBy(points, (n: Point) => n.metadata[facet]);
  const groups: PointGroup[] = [];

  // make each group an object
  Object.keys(groupedByFacet).forEach((key) => {
    groups.push({
      facet: key || "",
      points: groupedByFacet[key],
      labels: [],
      // lines: [],
    });
  });

  return groups;
};

export const getUnfilteredPoints = (points: Point[]) => {
  return points.filter((point) => !point.filteredOut);
};

// return the number of points in the largest facet
export const getFacetMaxPoints = (pointGroups: PointGroup[]) => {
  let maxPoints = 0;
  pointGroups.forEach((group) => {
    maxPoints = Math.max(maxPoints, group.points.length);
  });
  return maxPoints;
};

export const measurePointGroup = (pointGroup: PointGroup) => {
  // loop through each point's position
  // minus the groups's position
  // if the x, y, or z are greater than max, update max

  let max: [number, number, number] = [0, 0, 0];

  const groupPos = new Vector3().fromArray(pointGroup.position!);

  pointGroup.points.forEach((point) => {
    const pointPos = new Vector3().fromArray(point.position!);

    const delta = pointPos.sub(groupPos);

    if (delta.x > max[0]) {
      max[0] = delta.x;
    }

    if (delta.y > max[1]) {
      max[1] = delta.y;
    }

    if (delta.z > max[2]) {
      max[2] = delta.z;
    }
  });

  pointGroup.measurement = max;

  return max;
};

export const getMaxPointGroupSize = (pointGroups: PointGroup[]) => {
  const max: [number, number, number] = [0, 0, 0];

  pointGroups.forEach((group) => {
    const measurement = measurePointGroup(group);

    if (measurement[0] > max[0]) {
      max[0] = measurement[0];
    }

    if (measurement[1] > max[1]) {
      max[1] = measurement[1];
    }

    if (measurement[2] > max[2]) {
      max[2] = measurement[2];
    }
  });

  return max;
};

export const getPointGroupsBounds = (
  pointGroups: PointGroup[],
  axis: "x" | "y" | "z"
) => {
  const bounds: [number, number, number] = [0, 0, 0];

  pointGroups.forEach((pointGroup) => {
    measurePointGroup(pointGroup);

    switch (axis) {
      case "x": {
        bounds[0] += pointGroup.measurement![0];
        bounds[1] = Math.max(bounds[1], pointGroup.measurement![1]);
        bounds[2] = Math.max(bounds[2], pointGroup.measurement![2]);
        return;
      }
      case "y": {
        bounds[0] = Math.max(bounds[0], pointGroup.measurement![0]);
        bounds[1] += pointGroup.measurement![1];
        bounds[2] = Math.max(bounds[2], pointGroup.measurement![2]);
        return;
      }
      case "z": {
        bounds[0] = Math.max(bounds[0], pointGroup.measurement![0]);
        bounds[1] = Math.max(bounds[1], pointGroup.measurement![1]);
        bounds[2] += pointGroup.measurement![2];
        return;
      }
    }
  });

  return bounds;
};

export const sortPointsByDate = (points: Point[]) => {
  return points.sort((a, b) => {
    // @ts-ignore
    return new Date(a.metadata.date) - new Date(b.metadata.date);
  });
};

export const getPointsDateRange = (points: Point[]) => {
  const minDate = new Date(points[0].metadata.date);
  const maxDate = new Date(points[points.length - 1].metadata.date);
  return { minDate, maxDate };
};

export const getDecoratorsForPointGroups = (pointGroups: PointGroup[]) => {
  let labels: string[] = [];
  // let lines = [];

  pointGroups.forEach((group) => {
    labels = labels.concat(group.labels || []);
    // lines = lines.concat(group.lines || []);
  });

  return { labels };
};
