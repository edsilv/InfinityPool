import { create } from "zustand";
import { Point } from "./types/Point";
// import { mountStoreDevtool } from 'simple-zustand-devtools';

type State = {
  ambientLightIntensity: number;
  boundsEnabled: boolean;
  loading: boolean;
  orthographicEnabled: boolean;
  points: Point[];
  upVector: [number, number, number];
  setAmbientLightIntensity: (ambientLightIntensity: number) => void;
  setBoundsEnabled: (boundsEnabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setOrthographicEnabled: (orthographicEnabled: boolean) => void;
  setPoints: (points: Point[]) => void;
  setUpVector: (upVector: [number, number, number]) => void;
};

const useStore = create<State>((set) => ({
  ambientLightIntensity: 1,
  boundsEnabled: false,
  loading: true,
  orthographicEnabled: false,
  points: [],
  upVector: [0, 1, 0],

  setAmbientLightIntensity: (ambientLightIntensity: number) =>
    set({
      ambientLightIntensity,
    }),

  setBoundsEnabled: (boundsEnabled: boolean) =>
    set({
      boundsEnabled,
    }),

  setLoading: (loading: boolean) =>
    set({
      loading,
    }),

  setOrthographicEnabled: (orthographicEnabled: boolean) =>
    set({
      orthographicEnabled,
    }),

  setPoints: (points: Point[]) =>
    set({
      points,
      loading: true,
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
