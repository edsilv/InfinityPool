import { Suspense, useRef } from "react";
import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { IIIFLoader } from "./Loader";

const Points = ({ src }: { src: string }) => {
  const pointsRef = useRef<Point[] | null>(null);

  pointsRef.current = suspend(async () => {
    // console.log("load", url);
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src);
    return points;
  }, [src]);

  return <InstancedPoints points={pointsRef.current} />;
};

const IIIF = ({ src }: { src: SrcObj }) => {
  return (
    <Suspense fallback={null}>
      <Points src={src.url} />
    </Suspense>
  );
};

export default IIIF;
