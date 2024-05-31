import { create } from "zustand";
import { Facets, Layout, Point, SrcObj } from "./types";
import { createContext } from "react";
import { config } from "./Config";
// import { mountStoreDevtool } from 'simple-zustand-devtools';

// https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
export interface RequiredAppProps {}

export interface AppProps extends RequiredAppProps {
  ambientLightIntensity: number;
  facet: "none" | string;
  facets: Facets;
  layout: Layout;
  orthographicEnabled: boolean;
  points: Point[];
  src: SrcObj | null;
  upVector: [number, number, number];
}

export interface AppState extends AppProps {
  setAmbientLightIntensity: (ambientLightIntensity: number) => void;
  setFacet: (facets: string) => void;
  setFacets: (facets: Facets) => void;
  setLayout: (layout: Layout) => void;
  setOrthographicEnabled: (orthographicEnabled: boolean) => void;
  setPoints: (points: Point[]) => void;
  setSrc: (src: SrcObj) => void;
  setUpVector: (upVector: [number, number, number]) => void;
}

export type AppStore = ReturnType<typeof createAppStore>;

export const createAppStore = (initProps?: Partial<AppProps>) => {
  const DEFAULT_PROPS: AppProps = {
    ambientLightIntensity: 1,
    facet: "none",
    facets: {},
    layout: config.layouts[0],
    orthographicEnabled: true,
    points: [],
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

    setFacet: (facet: string) =>
      set({
        facet,
      }),

    setFacets: (facets: Facets) =>
      set({
        facets,
      }),

    setLayout: (layout: Layout) =>
      set({
        layout,
      }),

    setPoints: (points: Point[]) =>
      set({
        points,
      }),

    setOrthographicEnabled: (orthographicEnabled: boolean) =>
      set({
        orthographicEnabled,
      }),

    setSrc: (src: SrcObj) =>
      set({
        src,
        facets: {},
        facet: "none",
        points: [],
      }),

    setUpVector: (upVector: [number, number, number]) =>
      set({
        upVector,
      }),
  }));
};

export const AppContext = createContext<AppStore | null>(null);
