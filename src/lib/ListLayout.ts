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

  const totalGroups = visibleNodeGroups.length;

  visibleNodeGroups.forEach((group, i) => {
    group.position = [0, (totalGroups - 1 - i) * config.nodeGroupSpacing, 0];
    listLayout(group);
  });

  return { nodeGroups: visibleNodeGroups };
};

const listLayout = (nodeGroup: NodeGroup) => {
  const numNodes = nodeGroup.nodes.length;

  for (let i = 0; i < numNodes; i++) {
    const node = nodeGroup.nodes[i];
    node.position = [
      i * config.nodeSpacing,
      nodeGroup.position![1] * config.nodeSpacing,
      nodeGroup.position![2],
    ];
    // it's visible
    node.scale = [1, 1, 1];
  }
};
