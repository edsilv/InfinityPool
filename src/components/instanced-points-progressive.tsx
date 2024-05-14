import { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import ThumbnailMaterial from "./thumbnail-material";
import { DataArrayTexture, ImageBitmapLoader, Object3D } from "three";
import { Point } from "@/types/Point";
import { GridLayout } from "@/lib/GridLayout";
import { PointsLayout } from "@/types/PointsLayout";

const o = new Object3D();

function* getThumbnailSrcsIterator(thumbnailSrcs: string[]) {
  for (let src of thumbnailSrcs) {
    yield src;
  }
}

export default function InstancedPointsProgressive({
  points = [],
  layout = GridLayout,
  thumbnailWidth = 90,
  thumbnailHeight = 90,
  loadingBatchSize = 10,
}: {
  points: Point[];
  layout?: PointsLayout;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  loadingBatchSize?: number;
}) {
  const instancesRef = useRef<any>();

  const thumbnailSrcs = points.map((point) => point.thumbnail.src);
  const thumbnailSrcsGenerator = getThumbnailSrcsIterator(thumbnailSrcs);

  let count = points.length;

  // Calculate the maximum number of thumbnails that can fit into a 4k x 4k texture
  const maxThumbnailsInRow = Math.floor(4096 / thumbnailWidth); // 4096 / 90 = ~45.5, but we can only fit whole thumbnails, so we round down to 45
  const maxThumbnailsInColumn = Math.floor(4096 / thumbnailHeight); // 4096 / 90 = ~45.5, again we round down to 45
  const maxThumbnailsInTexture = maxThumbnailsInRow * maxThumbnailsInColumn; // 45 * 45 = 2025

  // If there are more thumbnails than can fit into a 4k x 4k texture, limit the count
  // In this case, we can fit 2025 90x90px thumbnails within a 4096 x 4096 texture
  if (count > maxThumbnailsInTexture) {
    count = maxThumbnailsInTexture;
  }

  // console.log("count", count);
  // console.log("thumbnailWidth", thumbnailWidth);
  // console.log("thumbnailHeight", thumbnailHeight);

  // Adjust loadingBatchSize based on the number of images
  // loadingBatchSize = loadingBatchSize || Math.ceil(count / 10);

  const [texture, setTexture] = useState<any>(null);

  useLayoutEffect(() => {
    if (count === 0) {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const imgsToData: ImageData[] = [];

    const size: number = thumbnailWidth * thumbnailHeight;
    const textureData: Uint8Array = new Uint8Array(4 * size * count).fill(128);

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

        // Update the texture after every 'loadingBatchSize' images
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
    layout(instancesRef, count, o, camera, clock, delta);
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
