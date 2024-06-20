import * as d3 from "d3";
import { Node } from "@/types";
import { getUnfilteredNodes } from "./Layouts";

interface ForceDirectedLayoutOptions {
  width: number;
  height: number;
  strength: number;
  distance: number;
  iterations: number;
}

export const forceDirectedLayout = (
  nodes: Node[],
  options: ForceDirectedLayoutOptions = {
    width: 0.6,
    height: 0.8,
    strength: -0.2,
    distance: 1,
    iterations: 5,
  }
) => {

  const visibleNodes = getUnfilteredNodes(nodes);
  console.log("visibleNodes", visibleNodes);

  // Initial positions around a center point
  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const radius = Math.min(options.width, options.height) / 4; // radius for initial circular arrangement

  visibleNodes.forEach((node: any, i: number) => {
    const angle = (i / visibleNodes.length) * 2 * Math.PI;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
  // Create a simulation with forces
  const simulation = d3.forceSimulation(visibleNodes as any)
    .force('charge', d3.forceManyBody().strength(options.strength))
    .force('center', d3.forceCenter(options.width / 2, options.height / 2))
    .force('collision', d3.forceCollide().radius(options.distance))
    .force('x', d3.forceX(options.width / 2).strength(0.1))
    .force('y', d3.forceY(options.height / 2).strength(0.1))
    .stop();

  // Run the simulation for a fixed number of iterations
  for (let i = 0; i < options.iterations; ++i) {
    simulation.tick();
  }

  // Update node positions
  visibleNodes.forEach((node: any) => {
    node.position = [node.x, node.y, 0];
    node.scale = [1, 1, 1];
  });

  return visibleNodes;
};
