import { Node } from "@/types";
import metadata from "./metadata.json";
import { Facets } from "@/types";
import { getNodeFacets } from "@/lib/utils";
import { config } from "@/Config";
import { node } from "../../../lib/Node";

export async function load(_url: string): Promise<{
  nodes: Node[];
  facets: Facets;
}> {
  const nodes: Node[] = metadata.records.map((r) => {
    return {
      ...node,
      // thumbnail: {
      //   width: config.thumbnailWidth,
      // },
      metadata: {
        opportunityName: r["Opportunity Name"],
        stage: r["Stage"],
        closeDate: r["Close Date"],
        amount: r["Amount"],
        owner: r["Owner"],
      },
    };
  });

  const facets = getNodeFacets(nodes, metadata.records, []);

  return { nodes, facets };
}
