import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { load } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import { applyLayout } from "@/lib/Layouts";
// @ts-ignore
// import data from "./points";

const IIIF = () => {
  const src = useAppContext((state: AppState) => state.src)!;
  const layout = useAppContext((state: AppState) => state.layout)!;
  const setPoints = useAppContext((state: AppState) => state.setPoints);

  suspend(async () => {
    // const loader = new IIIFLoader();
    // const points: Point[] = await loader.load(src.url);
    const points: Point[] = await load(src.url);
    // run current layout on points
    applyLayout(layout, points);
    setPoints(points);
  }, [src]);

  return <InstancedPoints />;
};

export default IIIF;
