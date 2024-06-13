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
  const nodes = useAppContext((state: AppState) => state.nodes);
  const layout = useAppContext((state: AppState) => state.layout);
  const facet = useAppContext((state: AppState) => state.facet);
  const filters = useAppContext((state: AppState) => state.filters);

  // compute layout remembering initial position, scale as source and
  // end position, scale as target
  useSourceTargetLayout();

  const numNodes = nodes.length;

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

        interpolateSourceTargetPosition(nodes, animationProgress);

        // callback to indicate data has updated
        onChange({ animationProgress });
      },
      onRest: () => {
        // reset
        for (let i = 0; i < numNodes; i++) {
          const node = nodes[i];
          resetSourcePositionScale(node);
        }

        onRest();
      },
    },
    [nodes, layout, facet, filters]
  );

  return { animProps };
}
