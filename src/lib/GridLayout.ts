import { Node, NodeGroup } from "@/types";
import { getUnfilteredNodes, groupNodesByFacet } from "./Layouts";
import { config } from "@/Config";

interface GridLayoutOptions {
  orderBy: "ascending" | "descending";
}

export const layout = (
  nodes: Node[],
  facet: string,
  options: GridLayoutOptions = { orderBy: "ascending" }
) => {
  const visibleNodes = getUnfilteredNodes(nodes);
  let visibleNodeGroups = groupNodesByFacet(visibleNodes, facet);

  // Sort the groups by the number of nodes
  visibleNodeGroups = visibleNodeGroups.sort((a, b) => {
    const comparison = a.nodes.length - b.nodes.length;
    return options.orderBy === "ascending" ? comparison : -comparison;
  });

  // Calculate total number of rows first
  let totalRows = 0;
  visibleNodeGroups.forEach((group) => {
    const numNodes = group.nodes.length;
    const numRows = Math.ceil(numNodes / Math.ceil(Math.sqrt(numNodes)));
    totalRows += numRows;
  });

  // Position rows from bottom upwards
  visibleNodeGroups.forEach((group) => {
    const numNodes = group.nodes.length;
    const numRows = Math.ceil(numNodes / Math.ceil(Math.sqrt(numNodes)));
    group.position = [0, (totalRows - numRows) * config.nodeGroupSpacing, 0];
    totalRows -= numRows;
    gridLayout(group);
  });

  return { nodeGroups: visibleNodeGroups };
};

const gridLayout = (nodeGroup: NodeGroup) => {
  // reverse the order of the nodes
  const numNodes = nodeGroup.nodes.length;
  const numCols = Math.ceil(Math.sqrt(numNodes));
  const numRows = Math.ceil(numNodes / numCols);

  for (let i = 0; i < numNodes; i++) {
    const node = nodeGroup.nodes[i];
    const col = i % numCols;
    const row = Math.floor(i / numCols);

    node.position = [
      (col + nodeGroup.position![0]) * config.nodeSpacing,
      (numRows - 1 - row + nodeGroup.position![1]) * config.nodeSpacing,
      nodeGroup.position![2],
    ];

    // it's visible
    node.scale = [1, 1, 1];
  }
};
