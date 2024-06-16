import Visualisation from "../../visualisation";
import { suspend } from "suspend-react";
import { load } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import { applyLayout } from "@/lib/Layouts";

const IIIF = () => {
  const facet = useAppContext((state: AppState) => state.sort)!;
  const src = useAppContext((state: AppState) => state.src)!;
  const layout = useAppContext((state: AppState) => state.layout)!;
  const setNodes = useAppContext((state: AppState) => state.setNodes);
  const setFacets = useAppContext((state: AppState) => state.setFacets);

  suspend(async () => {
    const { nodes, facets } = await load(src.url);
    setNodes(nodes);
    setFacets(facets);
    applyLayout(layout, facet, nodes);
  }, [src]);

  return <Visualisation />;
};

export default IIIF;
