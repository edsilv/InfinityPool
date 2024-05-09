import { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import Shader from "./shader";
import {
  Camera,
  Clock,
  DataArrayTexture,
  ImageBitmapLoader,
  Object3D,
} from "three";
import { Point } from "@/lib/Point";

const o = new Object3D();

function* getThumbnailSrcsIterator(thumbnailSrcs: string[]) {
  for (let src of thumbnailSrcs) {
    yield src;
  }
}

export default function InstancedPointsProgressive({
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
  const thumbnailSrcsGenerator = getThumbnailSrcsIterator(thumbnailSrcs);

  const count = points.length;
  // const thumbnails = useLoader(ImageBitmapLoader, thumbnailSrcs);
  const [texture, setTexture] = useState<any>(null);

  let width = 0;
  let height = 0;

  // set the width and height to the largest of all thumbnail widths and heights
  points.forEach((point: Point) => {
    const thumbnail = point.thumbnail;
    width = Math.max(width, thumbnail.width);
    height = Math.max(height, thumbnail.height);
  });

  height = width;

  useLayoutEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const imgsToData: ImageData[] = [];

    const loadImages = async () => {
      for (let src of thumbnailSrcsGenerator) {
        const img = await new Promise<ImageBitmap>((resolve, reject) => {
          // setTimeout(() => {
          const loader = new ImageBitmapLoader();
          loader.load(src, resolve, undefined, reject);
          // }, 0);
        });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0);

        const imgData: ImageData = ctx.getImageData(0, 0, width, height);
        imgsToData.push(imgData);

        const size: number = width * height;
        const textureData: Uint8Array = new Uint8Array(4 * size * count);

        // populate the data array with the image data
        for (let i = 0; i < imgsToData.length; i++) {
          const img: ImageData = imgsToData[i];
          textureData.set(img.data, i * size * 4);
        }

        // create the DataArrayTexture
        const t: DataArrayTexture = new DataArrayTexture(
          textureData,
          width,
          height,
          count
        );

        // apply the texture to the shader
        t.needsUpdate = true;
        setTexture(t);

        // update the instanceMatrix
        if (instancesRef.current?.instanceMatrix) {
          instancesRef.current.instanceMatrix.needsUpdate = true;
        }
      }
    };

    loadImages();

    return () => {
      texture?.dispose();
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    layout(instancesRef, camera, clock, delta, count, o);
  });

  return (
    <>
      <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[1, 1]} />
        <Shader map={texture} />
      </instancedMesh>
    </>
  );
}
