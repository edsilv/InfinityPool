import React from "react";
import { Suspense, useRef } from "react";
import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { IIIFLoader } from "./Loader";
// @ts-ignore
// import data from "./points";

const Points = React.memo(
  ({ src }: { src: string }) => {
    const pointsRef = useRef<Point[] | null>(null);

    pointsRef.current = suspend(async () => {
      const loader = new IIIFLoader();
      const points: Point[] = await loader.load(src);

      // todo: set loaded state to true, and trigger useAnimatedTransition

      return points;
    }, [src]);

    return <InstancedPoints src={src} points={pointsRef.current} />;
  },
  (prevProps, nextProps) => {
    // only re-render if src changes
    return prevProps.src === nextProps.src;
  }
);

const IIIF = React.memo(
  ({ src }: { src: string }) => {
    return (
      <Suspense fallback={null}>
        <Points src={src} />
      </Suspense>
    );
  },
  (prevProps, nextProps) => {
    // only re-render if src changes
    return prevProps.src === nextProps.src;
  }
);

export default IIIF;
