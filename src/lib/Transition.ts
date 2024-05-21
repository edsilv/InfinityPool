import {
  interpolateSourceTargetPosition,
  resetSourcePositionScale,
  useSourceTargetLayout,
} from "@/lib/Layouts";
import { Point } from "@/types";
import { useSpring } from "@react-spring/core";

export function useAnimatedTransition({
  points,
  onChange,
  onRest,
  onStart,
}: {
  points: Point[];
  onChange: (state: any) => void;
  onRest: () => void;
  onStart: () => void;
}) {
  // compute layout remembering initial position, scale as source and
  // end position, scale as target
  useSourceTargetLayout({
    points,
  });

  const numPoints = points.length;

  const animProps = useSpring({
    from: { animationProgress: 0 },
    to: {
      animationProgress: 1,
    },
    reset: true,
    onStart: () => {
      onStart();
    },
    onChange: ({ value }) => {
      //console.log("onchange")
      const { animationProgress } = value;

      interpolateSourceTargetPosition(points, animationProgress);

      // callback to indicate data has updated
      onChange({ animationProgress });
    },
    onRest: () => {
      // reset
      for (let i = 0; i < numPoints; i++) {
        const point = points[i];
        resetSourcePositionScale(point);
      }

      onRest();
    },
  });

  return { animProps };
}
