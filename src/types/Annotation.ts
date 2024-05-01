import { Vector3 } from 'three';

export type Annotation = {
  cameraPosition: Vector3;
  cameraTarget: Vector3;
  description?: string;
  label?: string;
  normal: Vector3;
  position: Vector3;
};
