import { create } from "zustand";
import { Facets, Filters, Label, Layout, Node, SrcObj } from "./types";
import { createContext } from "react";
import { config } from "./Config";
import { filterNodes } from "./lib/utils";
import { Decorator } from "./types/Decorator";
// import { mountStoreDevtool } from 'simple-zustand-devtools';

// https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
export interface RequiredAppProps {}

export interface AppProps extends RequiredAppProps {
  ambientLightIntensity: number;
  decorators: Decorator[];
  facets: Facets;
  filters: Filters;
  layout: Layout;
  nodes: Node[];
  orthographicEnabled: boolean;
  sort: "none" | string;
  src: SrcObj | null;
  upVector: [number, number, number];
}

export interface AppState extends AppProps {
  setAmbientLightIntensity: (ambientLightIntensity: number) => void;
  setDecorators: (decorators: Decorator[]) => void;
  setFacets: (facets: Facets) => void;
  setFilters: (filters: Filters) => void;
  setLayout: (layout: Layout) => void;
  setNodes: (nodes: Node[]) => void;
  setOrthographicEnabled: (orthographicEnabled: boolean) => void;
  setSort: (sort: string) => void;
  setSrc: (src: SrcObj) => void;
  setUpVector: (upVector: [number, number, number]) => void;
}

export type AppStore = ReturnType<typeof createAppStore>;

export const createAppStore = (initProps?: Partial<AppProps>) => {
  const DEFAULT_PROPS: AppProps = {
    ambientLightIntensity: 1,
    decorators: [],
    facets: {},
    filters: [],
    layout: config.layouts[0],
    nodes: [],
    orthographicEnabled: true,
    sort: "none",
    src: null,
    upVector: [0, 1, 0],
  };
  return create<AppState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setAmbientLightIntensity: (ambientLightIntensity: number) =>
      set({
        ambientLightIntensity,
      }),

    setSort: (sort: string) =>
      set({
        sort,
      }),

    setFacets: (facets: Facets) =>
      set({
        facets,
      }),

    setFilters: (filters: Filters) => {
      set((state) => ({
        filters: filters,
        nodes: filterNodes(state.nodes, filters),
      }));
    },

    setDecorators: (decorators: Decorator[]) =>
      set({
        decorators,
      }),

    setLayout: (layout: Layout) =>
      set({
        layout,
      }),

    setNodes: (nodes: Node[]) =>
      set({
        nodes,
      }),

    setOrthographicEnabled: (orthographicEnabled: boolean) =>
      set({
        orthographicEnabled,
      }),

    setSrc: (src: SrcObj) =>
      set({
        src,
        facets: {},
        sort: "none",
        nodes: [],
      }),

    setUpVector: (upVector: [number, number, number]) =>
      set({
        upVector,
      }),
  }));
};

export const AppContext = createContext<AppStore | null>(null);
