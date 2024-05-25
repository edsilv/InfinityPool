import {
  interpolateSourceTargetPosition,
  resetSourcePositionScale,
  useSourceTargetLayout,
} from "@/lib/Layouts";
import { useSpring } from "@react-spring/core";
import { useAppContext } from "./hooks/use-app-context";
import { AppState } from "@/Store";

export function useAnimatedTransition({
  onChange,
  onRest,
  onStart,
}: {
  onChange: (state: any) => void;
  onRest: () => void;
  onStart: () => void;
}) {
  const points = useAppContext((state: AppState) => state.points);
  const layout = useAppContext((state: AppState) => state.layout);

  // compute layout remembering initial position, scale as source and
  // end position, scale as target
  useSourceTargetLayout();

  const numPoints = points.length;

  const animProps = useSpring(
    {
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
    },
    [points, layout]
  );

  return { animProps };
}
