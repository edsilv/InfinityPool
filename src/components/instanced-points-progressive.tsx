import { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import ThumbnailMaterial from "./shader";
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
  thumbnailWidth = 90,
  thumbnailHeight = 90,
  loadingBatchSize,
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
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  loadingBatchSize?: number; // Optional prop
}) {
  const instancesRef = useRef<any>();

  const thumbnailSrcs = points.map((point) => point.thumbnail.src);
  const thumbnailSrcsGenerator = getThumbnailSrcsIterator(thumbnailSrcs);

  const count = points.length;

  // Adjust updateFrequency based on the number of images
  loadingBatchSize = loadingBatchSize || Math.ceil(count / 10);

  const [texture, setTexture] = useState<any>(null);

  useLayoutEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const imgsToData: ImageData[] = [];

    const size: number = thumbnailWidth * thumbnailHeight;
    const textureData: Uint8Array = new Uint8Array(4 * size * count);

    const updateTexture = () => {
      const t: DataArrayTexture = new DataArrayTexture(
        textureData,
        thumbnailWidth,
        thumbnailHeight,
        count
      );
      t.needsUpdate = true;
      setTexture(t);
      if (instancesRef.current?.instanceMatrix) {
        instancesRef.current.instanceMatrix.needsUpdate = true;
      }
    };

    const loadImages = async () => {
      let i = 0;
      for (let src of thumbnailSrcsGenerator) {
        const img: ImageBitmap = await new Promise<ImageBitmap>(
          (resolve, reject) => {
            const loader = new ImageBitmapLoader();
            loader.load(src, resolve, undefined, reject);
          }
        );
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(0, canvas.height);

        // Calculate the scale factor
        const scale = Math.min(
          thumbnailWidth / img.width,
          thumbnailHeight / img.height
        );

        // Calculate the scaled width and height
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate the position to center the image
        const posX = (thumbnailWidth - scaledWidth) / 2;
        const posY = (thumbnailHeight - scaledHeight) / 2;

        ctx.scale(1, -1);

        // Draw the image scaled and centered
        ctx.drawImage(
          img,
          posX,
          canvas.height - posY - scaledHeight,
          scaledWidth,
          scaledHeight
        );

        const imgData: ImageData = ctx.getImageData(
          0,
          0,
          thumbnailWidth,
          thumbnailHeight
        );
        imgsToData.push(imgData);

        // populate the data array with the image data
        for (let j = 0; j < imgsToData.length; j++) {
          const img: ImageData = imgsToData[j];
          textureData.set(img.data, j * size * 4);
        }

        // Update the texture after every 'updateFrequency' images
        if (i % loadingBatchSize === 0) {
          updateTexture();
        }

        i++;
      }

      // Final update to ensure all images are displayed
      updateTexture();
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
        <ThumbnailMaterial map={texture} brightness={1.4} contrast={0.75} />
      </instancedMesh>
    </>
  );
}
