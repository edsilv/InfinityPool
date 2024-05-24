import { useRef } from "react";
import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { IIIFLoader } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
// @ts-ignore
// import data from "./points";

const IIIF = () => {
  const src = useAppContext((state: AppState) => state.src)!;
  const pointsRef = useRef<Point[] | null>(null);

  pointsRef.current = suspend(async () => {
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src.url);

    // todo: set loaded state to true, and trigger useAnimatedTransition

    return points;
  }, [src]);

  return <InstancedPoints src={src.url} points={pointsRef.current} />;
};

export default IIIF;
