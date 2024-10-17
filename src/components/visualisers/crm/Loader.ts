import { Label, Node } from "@/types";
import metadata from "./accounts-500.json";
import { Facets } from "@/types";
import { getNodeFacets } from "@/lib/utils";
// import { config } from "@/Config";
import { node } from "../../../lib/Node";
// import { generateAccounts } from "./genAccounts";

export async function load(_url: string): Promise<{
  nodes: Node[];
  facets: Facets;
}> {
  // generateAccounts();

  const nodes: Node[] = metadata.records.map((r) => {
    return {
      ...node,
      // thumbnail: {
      //   width: config.thumbnailWidth,
      // },
      metadata: {
        accountName: r["Account Name"],
        segmentation: r["Segmentation"],
        dealSize: r["Deal Size"],
        industry: r["Industry"],
        customerSegment: r["Customer Segment"],
        saleType: r["Sale Type"],
        serviceLine: r["Service Line"],
      },
      // metadata: {
      //   opportunityName: r["Opportunity Name"],
      //   stage: r["Stage"],
      //   closeDate: r["Close Date"],
      //   amount: r["Amount"],
      //   owner: r["Owner"],
      // },
    };
  });

  // const facets = getNodeFacets(nodes, metadata.records, ["Opportunity Name"]);
  const facets = getNodeFacets(nodes, metadata.records, []);

  return { nodes, facets };
}
