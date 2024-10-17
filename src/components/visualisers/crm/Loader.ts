import { Loader, Node } from "@/types";
import metadata from "./accounts-500.json";
import { getNodeFacets } from "@/lib/utils";
// import { config } from "@/Config";
import { node } from "../../../lib/Node";
// import { generateAccounts } from "./genAccounts";

// Define the load function separately
const loadFunction = async () => {
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

  // Return the nodes or any other data as needed
  return { nodes, facets };
};

export const load: Loader = loadFunction;
