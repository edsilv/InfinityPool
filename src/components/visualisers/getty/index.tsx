import Visualisation from "../../visualisation";
import { suspend } from "suspend-react";
import { load } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import { applyLayout } from "@/lib/Layouts";

const GETTY = () => {
  const facet = useAppContext((state: AppState) => state.sort)!;
  const src = useAppContext((state: AppState) => state.src)!;
  const layout = useAppContext((state: AppState) => state.layout)!;
  const setNodes = useAppContext((state: AppState) => state.setNodes);
  const setFacets = useAppContext((state: AppState) => state.setFacets);

  console.log("GETTY", src.url);

  suspend(
    async () => {
      console.log("GETTY suspend");
      const { nodes, facets } = await load(src.url);
      console.log("GETTY nodes", nodes);
      setNodes(nodes);
      setFacets(facets);
      applyLayout(layout, facet, nodes);
    },
    [src.url]
    // { lifespan: 1 } // don't cache the data so that it's reloaded each time the user navigates to the page
  );

  return <Visualisation />;
};

export default GETTY;
