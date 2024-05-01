import { CameraControls } from '@react-three/drei';
import { Vector3 } from 'three';

export type CameraRefs = {
  controls: React.MutableRefObject<CameraControls | null>;
  position: React.MutableRefObject<Vector3 | null>;
  target: React.MutableRefObject<Vector3 | null>;
};
