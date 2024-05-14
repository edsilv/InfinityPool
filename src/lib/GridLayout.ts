import { PointsLayout } from "@/types/PointsLayout";
import { Camera, Clock, Object3D } from "three";

export const GridLayout: PointsLayout = (
  ref: any,
  count: number,
  o: Object3D,
  _camera: Camera,
  _clock: Clock,
  _delta: number
) => {
  const gridSize = Math.round(Math.sqrt(count));
  const spacing = 2; // Adjust this value to change the spacing
  for (let i = 0; i < count; i++) {
    const x = ((i % gridSize) - gridSize / 2 + 0.5) * spacing;
    const y =
      (gridSize - 1 - Math.floor(i / gridSize) - gridSize / 2 + 0.5) * spacing;
    o.position.set(x, y, 0);
    o.updateMatrix();
    ref.current.setMatrixAt(i, o.matrix);
  }
  ref.current!.instanceMatrix.needsUpdate = true;
};
