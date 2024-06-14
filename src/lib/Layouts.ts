import { useEffect } from "react";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { layout as barChartLayout } from "./BarChartLayout";
import { layout as gridLayout } from "./GridLayout";
import { layout as listLayout } from "./ListLayout";
import { Layout, Node, NodeGroup } from "@/types";
import { AppState } from "@/Store";
import { groupBy } from "./utils";
import { Vector3 } from "three";

export function applyLayout(layout: Layout, facet: string, nodes: Node[]) {
  switch (layout.type) {
    case "barchart":
      barChartLayout(nodes, facet);
      break;
    case "list":
      listLayout(nodes, facet);
      break;
    case "grid":
    default: {
      gridLayout(nodes, facet);
    }
  }
}

export function useSourceTargetLayout() {
  const facet = useAppContext((state: AppState) => state.sort);
  const src = useAppContext((state: AppState) => state.src);
  const nodes = useAppContext((state: AppState) => state.nodes);
  const layout = useAppContext((state: AppState) => state.layout);
  const filters = useAppContext((state: AppState) => state.filters);

  let layoutProps;

  // prep for new animation by storing source
  useEffect(() => {
    // console.log("get source positions");
    for (let i = 0; i < nodes.length; ++i) {
      const node: Node = nodes[i];
      node.sourcePosition = { ...node.position! } || [0, 0, 0];
      node.sourceScale = { ...node.scale! } || [1, 1, 1];
    }
  }, [src, layout, facet, filters]);

  // run layout (get target positions)
  useEffect(() => {
    // console.log("apply layout");
    applyLayout(layout, facet, nodes);
  }, [src, layout, facet, filters]);

  // store target positions
  useEffect(() => {
    // console.log("get target positions");
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      node.targetPosition = { ...node.position! };
      node.targetScale = node.filteredOut ? [0, 0, 0] : { ...node.scale! };
    }
  }, [src, layout, facet, filters]);

  return layoutProps;
}

export function interpolateSourceTargetPosition(
  nodes: Node[],
  progress: number
) {
  const numNodes = nodes.length;

  for (let i = 0; i < numNodes; i++) {
    const node = nodes[i];

    if (node.position) {
      node.position[0] =
        (1 - progress) * node.sourcePosition![0] +
        progress * node.targetPosition![0];
      node.position[1] =
        (1 - progress) * node.sourcePosition![1] +
        progress * node.targetPosition![1];
      node.position[2] =
        (1 - progress) * node.sourcePosition![2] +
        progress * node.targetPosition![2];
    }

    if (node.scale) {
      node.scale[0] =
        (1 - progress) * node.sourceScale![0] + progress * node.targetScale![0];
      node.scale[1] =
        (1 - progress) * node.sourceScale![1] + progress * node.targetScale![1];
      node.scale[2] =
        (1 - progress) * node.sourceScale![2] + progress * node.targetScale![2];
    }
  }
}

export function resetSourcePositionScale(node: Node) {
  if (node.position) {
    node.sourcePosition = { ...node.position };
  }
  if (node.scale) {
    node.sourceScale = { ...node.scale };
  }
}

// utils
export const groupNodesByFacet = (
  nodes: Node[],
  facet: string
): NodeGroup[] => {
  if (facet === "none") {
    return [
      {
        facet: "none",
        nodes,
        labels: [],
      },
    ];
  }

  const groupedByFacet = groupBy(nodes, (n: Node) => n.metadata![facet]!);
  const groups: NodeGroup[] = [];

  // make each group an object
  Object.keys(groupedByFacet).forEach((key) => {
    groups.push({
      facet: key || "",
      nodes: groupedByFacet[key],
      labels: [],
      // lines: [],
    });
  });

  return groups;
};

export const getUnfilteredNodes = (nodes: Node[]) => {
  return nodes.filter((node) => !node.filteredOut);
};

// return the number of nodes in the largest facet
export const getFacetMaxNodes = (nodeGroups: NodeGroup[]) => {
  let maxNodes = 0;
  nodeGroups.forEach((group) => {
    maxNodes = Math.max(maxNodes, group.nodes.length);
  });
  return maxNodes;
};

export const measureNodeGroup = (nodeGroup: NodeGroup) => {
  // loop through each node's position
  // minus the groups's position
  // if the x, y, or z are greater than max, update max

  let max: [number, number, number] = [0, 0, 0];

  const groupPos = new Vector3().fromArray(nodeGroup.position!);

  nodeGroup.nodes.forEach((node) => {
    const nodePos = new Vector3().fromArray(node.position!);

    const delta = nodePos.sub(groupPos);

    if (delta.x > max[0]) {
      max[0] = delta.x;
    }

    if (delta.y > max[1]) {
      max[1] = delta.y;
    }

    if (delta.z > max[2]) {
      max[2] = delta.z;
    }
  });

  nodeGroup.measurement = max;

  return max;
};

export const getMaxNodeGroupSize = (nodeGroups: NodeGroup[]) => {
  const max: [number, number, number] = [0, 0, 0];

  nodeGroups.forEach((group) => {
    const measurement = measureNodeGroup(group);

    if (measurement[0] > max[0]) {
      max[0] = measurement[0];
    }

    if (measurement[1] > max[1]) {
      max[1] = measurement[1];
    }

    if (measurement[2] > max[2]) {
      max[2] = measurement[2];
    }
  });

  return max;
};

export const getNodeGroupsBounds = (
  nodeGroups: NodeGroup[],
  axis: "x" | "y" | "z"
) => {
  const bounds: [number, number, number] = [0, 0, 0];

  nodeGroups.forEach((nodeGroup) => {
    measureNodeGroup(nodeGroup);

    switch (axis) {
      case "x": {
        bounds[0] += nodeGroup.measurement![0];
        bounds[1] = Math.max(bounds[1], nodeGroup.measurement![1]);
        bounds[2] = Math.max(bounds[2], nodeGroup.measurement![2]);
        return;
      }
      case "y": {
        bounds[0] = Math.max(bounds[0], nodeGroup.measurement![0]);
        bounds[1] += nodeGroup.measurement![1];
        bounds[2] = Math.max(bounds[2], nodeGroup.measurement![2]);
        return;
      }
      case "z": {
        bounds[0] = Math.max(bounds[0], nodeGroup.measurement![0]);
        bounds[1] = Math.max(bounds[1], nodeGroup.measurement![1]);
        bounds[2] += nodeGroup.measurement![2];
        return;
      }
    }
  });

  return bounds;
};

export const sortNodesByDate = (nodes: Node[]) => {
  return nodes.sort((a, b) => {
    // @ts-ignore
    return new Date(a.metadata.date) - new Date(b.metadata.date);
  });
};

export const getNodesDateRange = (nodes: Node[]) => {
  const minDate = new Date(nodes[0].metadata!.date!);
  const maxDate = new Date(nodes[nodes.length - 1].metadata!.date!);
  return { minDate, maxDate };
};

export const getDecoratorsForNodeGroups = (nodeGroups: NodeGroup[]) => {
  let labels: string[] = [];
  // let lines = [];

  nodeGroups.forEach((group) => {
    labels = labels.concat(group.labels || []);
    // lines = lines.concat(group.lines || []);
  });

  return { labels };
};
