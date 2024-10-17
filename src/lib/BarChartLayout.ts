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
  const visibleNodes: Node[] = getUnfilteredNodes(nodes);
  let visibleNodeGroups: NodeGroup[] = groupNodesByFacet(visibleNodes, facet);

  // Sort the groups by the number of nodes
  visibleNodeGroups = visibleNodeGroups.sort((a, b) => {
    const comparison = a.nodes.length - b.nodes.length;
    return options.orderBy === "ascending" ? comparison : -comparison;
  });

  // Position groups along the x-axis
  visibleNodeGroups.forEach((group, index) => {
    group.position = [index * config.nodeGroupSpacing, 0, 0];
    group.labels = [{ text: group.facet, position: group.position }];
    barChartLayout(group);
  });

  return { nodeGroups: visibleNodeGroups };
};

const barChartLayout = (nodeGroup: NodeGroup) => {
  // Position nodes vertically within each group
  const numNodes = nodeGroup.nodes.length;

  for (let i = 0; i < numNodes; i++) {
    const node = nodeGroup.nodes[i];
    node.position = [nodeGroup.position![0], i * config.nodeSpacing, 0];
    // it's visible
    node.scale = [1, 1, 1];
  }
};
