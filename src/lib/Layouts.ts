import { useEffect } from "react";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { gridLayout } from "./GridLayout";
import { listLayout } from "./ListLayout";
import { Point } from "@/types";
import { AppState } from "@/Store";

export function useSourceTargetLayout({ points }: { points: Point[] }) {
  const src = useAppContext((state: AppState) => state.src)!;
  const layout = useAppContext((state: AppState) => state.layout)!;

  let layoutProps;

  // prep for new animation by storing source
  useEffect(() => {
    console.log("get source positions");
    for (let i = 0; i < points.length; ++i) {
      const point: Point = points[i];
      point.sourcePosition = { ...point.position! } || [0, 0, 0];
    }
  }, [src, layout]);

  // run layout (get target positions)
  useEffect(() => {
    console.log("apply layout");

    if (layout) {
      switch (layout) {
        case "list":
          layoutProps = listLayout(points);
          break;
        case "grid":
        default: {
          layoutProps = gridLayout(points);
        }
      }
    }
  }, [src, layout]);

  // store target positions
  useEffect(() => {
    console.log("get target positions");
    for (let i = 0; i < points.length; ++i) {
      const point = points[i];
      point.targetPosition = { ...point.position! };
      // point.targetScale = point.filteredOut ? [0, 0, 0] : { ...point.scale };
    }
  }, [src, layout]);

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
