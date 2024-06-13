export type Facet = {
  value: string;
  total: number;
};

export type Facets = {
  [key: string]: Set<Facet>;
};
