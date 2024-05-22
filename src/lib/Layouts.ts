/* eslint-disable */
// @ts-nocheck
import { useEffect, useMemo } from "react";
import { gridLayout } from "./GridLayout";
import { listLayout } from "./ListLayout";
import { Point } from "@/types";
import useStore from "@/Store";

const useLayout = ({ points }: { points: Point[] }) => {
  const { layout } = useStore();

  // get all "visible" points, i.e. ones that have data
  const visiblePoints = useMemo(
    () => points.filter((d) => d.visible),
    [points]
  );

  // set the scale to 0 for all filtered out points
  //console.log("hideFilteredOutPoints")
  //hideFilteredOutPoints(points);

  let layoutProps;

  // layouts take the points array, calculate all new point scales and positions, and decorators (labels, lines).
  // these scales/positions can be used to measure the needed space, before running the layout again to fit within those bounds.
  // only the date layout needs a measurement pass right now.
  // then we loop through the final points scales/positions and set them for each point.
  useEffect(() => {
    console.log("layout");

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
  }, [layout]);
};

export function useSourceTargetLayout({ points }) {
  const { layout } = useStore();

  // prep for new animation by storing source
  useEffect(() => {
    console.log("source positions");
    for (let i = 0; i < points.length; ++i) {
      const point: Point = points[i];
      point.sourcePosition = { ...point.position } || [0, 0, 0];
      // point.sourceScale = { ...point.scale } || [1, 1, 1];
    }
  }, [layout]);

  // run layout (get target positions and scales)
  useLayout({
    points,
  });

  // store target positions and scales
  useEffect(() => {
    console.log("target positions");
    for (let i = 0; i < points.length; ++i) {
      const point = points[i];
      point.targetPosition = { ...point.position };
      // point.targetScale = point.filteredOut ? [0, 0, 0] : { ...point.scale };
    }
  }, [layout]);
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
        (1 - progress) * point.sourcePosition[0] +
        progress * point.targetPosition[0];
      point.position[1] =
        (1 - progress) * point.sourcePosition[1] +
        progress * point.targetPosition[1];
      point.position[2] =
        (1 - progress) * point.sourcePosition[2] +
        progress * point.targetPosition[2];
    }

    // if (point.scale) {
    //   point.scale[0] =
    //     (1 - progress) * point.sourceScale[0] + progress * point.targetScale[0];
    //   point.scale[1] =
    //     (1 - progress) * point.sourceScale[1] + progress * point.targetScale[1];
    //   point.scale[2] =
    //     (1 - progress) * point.sourceScale[2] + progress * point.targetScale[2];
    // }
  }
}

export function resetSourcePositionScale(point: Point) {
  if (point.scale) {
    point.sourceScale = { ...point.scale };
  }
  if (point.position) {
    point.sourcePosition = { ...point.position };
  }
}
