import { SrcObj } from "@/types";
import { Suspense } from "react";
import InstancedPointsProgressive from "./instanced-points-progressive";
import { Point } from "@/types/Point";
import { IIIFLoader } from "@/lib/IIIFLoader";
import { GridLayout } from "@/lib/GridLayout";
import { suspend } from "suspend-react";

export const IIIF = ({ src }: { src: SrcObj }) => {
  const points = suspend(async () => {
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src.url);
    return points;
  }, [src]);

  return (
    <Suspense fallback={null}>
      <InstancedPointsProgressive points={points} layout={GridLayout} />
    </Suspense>
  );
};
