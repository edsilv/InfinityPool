import Visualisation from "../../visualisation";
import { suspend } from "suspend-react";
import { load } from "./Loader";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
// import { applyLayout } from "@/lib/Layouts";

const ScienceMuseum = () => {
  // const facet = useAppContext((state: AppState) => state.sort)!;
  const src = useAppContext((state: AppState) => state.src)!;
  // const layout = useAppContext((state: AppState) => state.layout)!;
  const setNodes = useAppContext((state: AppState) => state.setNodes);
  const setFacets = useAppContext((state: AppState) => state.setFacets);

  console.log("Science Museum", src.url);

  suspend(
    async () => {
      console.log("Science Museum suspend");
      const { nodes, facets } = await load(src.url);
      console.log("Science Museum nodes", nodes);
      setNodes(nodes);
      setFacets(facets);
      // applyLayout(layout, facet, nodes);
    },
    [src.url]
    // { lifespan: 1 } // don't cache the data so that it's reloaded each time the user navigates to the page
  );

  return <Visualisation />;
};

export default ScienceMuseum;
