import { Camera, Clock, Object3D } from "three";

export type PointsLayout = (
  ref: any,
  count: number,
  o: Object3D,
  camera: Camera,
  clock: Clock,
  delta: number
) => void;
