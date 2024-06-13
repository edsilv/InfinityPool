import { config } from "@/Config";
import { Facet, Facets, Metadata, Node } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends keyof any>(
  arr: T[],
  resolver: (item: T) => K
): Record<K, T[]> {
  return arr.reduce(
    (memo, x) => {
      const key = resolver(x) || ("" as K);
      memo[key] = [...(memo[key] || []), x];
      return memo;
    },
    {} as Record<K, T[]>
  );
}

export function getNodeFacets(nodes: Node[], metadata: Metadata[]): Facets {
  const facets: Facets = {};

  const counts: Record<string, Record<string, number>> = {};

  nodes.forEach((node, idx) => {
    node.metadata = metadata[idx];

    Object.keys(node.metadata).forEach((key) => {
      if (!config.facetsIgnore.includes(key)) {
        if (!facets[key]) {
          facets[key] = new Set<Facet>();
          counts[key] = {};
        }

        const value = node.metadata![key]!;

        // Increment the count for this value
        counts[key][value] = (counts[key][value] || 0) + 1;

        let existingFacet = Array.from(facets[key]).find(
          (facet) => facet.value === value
        );

        if (existingFacet) {
          // If an object with this value already exists in the Set, increment its total
          existingFacet.total++;
        } else {
          // Otherwise, add a new object to the Set
          facets[key].add({
            value: value,
            total: counts[key][value],
          });
        }
      }
    });
  });

  return facets;
}
