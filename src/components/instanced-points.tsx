import { useLayoutEffect, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import Shader from "./shader";
import {
  Camera,
  Clock,
  DataArrayTexture,
  ImageBitmapLoader,
  Object3D,
} from "three";
import { Point } from "./Point";

const o = new Object3D();

export default function InstancedPoints({
  points,
  layout,
}: {
  points: Point[];
  layout: (
    ref: any,
    camera: Camera,
    clock: Clock,
    delta: number,
    count: number,
    o: Object3D
  ) => void;
}) {
  const instancesRef = useRef<any>();

  const thumbnailSrcs = points.map((point) => point.thumbnail.src);

  const count = points.length;
  const thumbnails = useLoader(ImageBitmapLoader, thumbnailSrcs);
  const [img, setImg] = useState<any>(null);

  let width = 0;
  let height = 0;

  // set the width and height to the largest of all thumbnail widths and heights
  points.forEach((point: Point) => {
    const thumbnail = point.thumbnail;
    width = Math.max(width, thumbnail.width);
    height = Math.max(height, thumbnail.height);
  });

  useLayoutEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const imgsToData: any[] = [];

    thumbnails.forEach((img) => {
      // img.flipY = true;
      // img.needsUpdate = true;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, width, height);
      imgsToData.push(imgData);

      // texture atlas is 32 colums of 28 rows of 40x32px
      //   for (let i = 0; i < 32; i++) {
      //     for (let j = 0; j < 28; j++) {
      //       const imgData = ctx.getImageData(
      //         i * width,
      //         j * height,
      //         width,
      //         height
      //       );
      //       imgsToData.push(imgData);
      //     }
      //   }
      // we could also just use an array of textures of the same size instead of using
      // a precomputed atlas
    });

    const size = width * height;
    const data = new Uint8Array(4 * size * count);

    for (let i = 0; i < count; i++) {
      // thumbnails length
      const img = imgsToData[i % imgsToData.length];
      data.set(img.data, i * size * 4);
    }

    const texture = new DataArrayTexture(data, width, height, count);

    texture.needsUpdate = true;

    setImg(texture);

    instancesRef.current!.instanceMatrix.needsUpdate = true;

    return () => {
      texture.dispose();
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    layout(instancesRef, camera, clock, delta, count, o);
  });

  return (
    <>
      <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 1]} />
        <Shader map={img} />
      </instancedMesh>
    </>
  );
}
