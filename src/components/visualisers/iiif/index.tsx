import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { IIIFLoader } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
// @ts-ignore
// import data from "./points";

const IIIF = () => {
  const src = useAppContext((state: AppState) => state.src);
  const setPoints = useAppContext((state: AppState) => state.setPoints);

  suspend(async () => {
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src.url);
    setPoints(points);
  }, [src]);

  return <InstancedPoints />;
};

export default IIIF;
