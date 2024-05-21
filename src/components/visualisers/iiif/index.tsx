import { Suspense, useRef, memo, useMemo } from "react";
import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { IIIFLoader } from "./Loader";
import { SrcObj } from "@/types";

const Points = memo(({ src }: { src: string }) => {
  const pointsRef = useRef<Point[] | null>(null);

  pointsRef.current = suspend(async () => {
    // console.log("load", url);
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src);
    return points;
  }, [src]);

  const memoizedPoints = useMemo(() => pointsRef.current, [pointsRef.current]);

  return <InstancedPoints points={memoizedPoints as Point[]} />;
});

const IIIF = ({ src }: { src: SrcObj }) => {
  return (
    <Suspense fallback={null}>
      <Points src={src.url} />
    </Suspense>
  );
};

export default IIIF;
