import { Suspense, useRef } from "react";
import InstancedPoints from "../../instanced-points";
import { Point } from "@/types/Point";
import { suspend } from "suspend-react";
import { Object3D } from "three";
import { SrcObj } from "@/types";
import { IIIFLoader } from "./Loader";

function updateInstancedMeshMatrices({
  o,
  mesh,
  points,
}: {
  o: Object3D;
  mesh: THREE.InstancedMesh;
  points: Point[];
}) {
  if (!mesh) return;

  // set the transform matrix for each instance
  for (let i = 0; i < points.length; ++i) {
    const { position, scale } = points[i];

    if (position && scale) {
      o.position.set(position[0], position[1], position[2]);
      // o.rotation.set(0.5 * Math.PI, 0, 0); // cylinders face z direction
      o.scale.set(scale[0], scale[1], scale[2]);
      o.updateMatrix();

      mesh.setMatrixAt(i, o.matrix);
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
}

const Points = ({ src }: { src: string }) => {
  // const { layout } = useStore();

  const pointsRef = useRef<Point[] | null>(null);

  pointsRef.current = suspend(async () => {
    // console.log("load", url);
    const loader = new IIIFLoader();
    const points: Point[] = await loader.load(src);
    return points;
    // setPoints(points);
  }, [src]);

  return <InstancedPoints points={pointsRef.current} />;
};

const IIIF = ({ src }: { src: SrcObj }) => {
  return (
    <Suspense fallback={null}>
      <Points src={src.url} />
    </Suspense>
  );
};

export default IIIF;
