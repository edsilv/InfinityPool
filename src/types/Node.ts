export type Metadata = {
  [key: string]: string | undefined;
};

export type Node = {
  position?: [number, number, number];
  sourcePosition?: [number, number, number];
  targetPosition?: [number, number, number];
  layoutPosition?: [number, number, number];
  scale?: [number, number, number];
  sourceScale?: [number, number, number];
  targetScale?: [number, number, number];
  layoutScale?: [number, number, number];
  filteredOut?: boolean;
  thumbnail: {
    src: string;
    width: number;
    height?: number;
  };
  metadata?: Metadata;
};

export type NodeGroup = {
  position?: [number, number, number];
  scale?: [number, number, number];
  facet: string;
  nodes: Node[];
  labels: any[];
  // lines: any[];
  measurement?: [number, number, number];
};
