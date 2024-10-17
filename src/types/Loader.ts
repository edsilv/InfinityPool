import { Facets, Node } from ".";

export type Loader = (url?: string) => Promise<{
  nodes: Node[];
  facets: Facets;
}>;
