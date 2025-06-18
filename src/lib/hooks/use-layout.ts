import { useEffect, useState } from "react";
import { useAppContext } from "./use-app-context";
import { AppState } from "@/Store";
import { Node } from "@/types";

export const useLayout = () => {
  const nodes = useAppContext((state: AppState) => state.nodes);
  const layout = useAppContext((state: AppState) => state.layout);
  const [processedNodes, setProcessedNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (!layout || !nodes.length) {
      setProcessedNodes(nodes);
      return;
    }

    // Apply layout-specific processing
    const processed = nodes.map((node) => {
      // Convert position arrays to Vector3 if needed
      if (Array.isArray(node.position) && node.position.length === 3) {
        return {
          ...node,
          position: node.position as [number, number, number], // Ensure proper typing
        };
      }
      return node;
    });

    setProcessedNodes(processed);
  }, [nodes, layout]);

  return {
    nodes: processedNodes,
    layout,
  };
};
