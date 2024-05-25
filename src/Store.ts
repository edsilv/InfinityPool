import { create } from "zustand";
import { Layout, Point, SrcObj } from "./types";
import { createContext } from "react";
// import { mountStoreDevtool } from 'simple-zustand-devtools';

// https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
export interface RequiredAppProps {}

export interface AppProps extends RequiredAppProps {
  ambientLightIntensity: number;
  boundsEnabled: boolean;
  layout: Layout;
  orthographicEnabled: boolean;
  points: Point[];
  src: SrcObj;
  upVector: [number, number, number];
}

export interface AppState extends AppProps {
  setAmbientLightIntensity: (ambientLightIntensity: number) => void;
  setBoundsEnabled: (boundsEnabled: boolean) => void;
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
    boundsEnabled: false,
    layout: "grid",
    orthographicEnabled: false,
    points: [],
    src: undefined,
    upVector: [0, 1, 0],
  };
  return create<AppState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setAmbientLightIntensity: (ambientLightIntensity: number) =>
      set({
        ambientLightIntensity,
      }),

    setBoundsEnabled: (boundsEnabled: boolean) =>
      set({
        boundsEnabled,
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
      }),

    setUpVector: (upVector: [number, number, number]) =>
      set({
        upVector,
      }),
  }));
};

export const AppContext = createContext<AppStore | null>(null);
