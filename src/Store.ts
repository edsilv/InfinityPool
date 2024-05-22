import { create } from "zustand";
import { Layout } from "./types";
// import { mountStoreDevtool } from 'simple-zustand-devtools';

type State = {
  ambientLightIntensity: number;
  boundsEnabled: boolean;
  layout: Layout;
  orthographicEnabled: boolean;
  upVector: [number, number, number];
  setAmbientLightIntensity: (ambientLightIntensity: number) => void;
  setBoundsEnabled: (boundsEnabled: boolean) => void;
  setLayout: (layout: Layout) => void;
  setOrthographicEnabled: (orthographicEnabled: boolean) => void;
  setUpVector: (upVector: [number, number, number]) => void;
};

const useStore = create<State>((set) => ({
  ambientLightIntensity: 1,
  boundsEnabled: false,
  layout: "grid",
  orthographicEnabled: false,
  upVector: [0, 1, 0],

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

  setOrthographicEnabled: (orthographicEnabled: boolean) =>
    set({
      orthographicEnabled,
    }),

  setUpVector: (upVector: [number, number, number]) =>
    set({
      upVector,
    }),
}));

// if (process.env.NODE_ENV === 'development') {
//   console.log('zustand devtools');
//   mountStoreDevtool('Store', useStore);
// }

export default useStore;
