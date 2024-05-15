import { useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import ThumbnailMaterial from "./thumbnail-material";
import { DataArrayTexture, Object3D } from "three";
import { Point } from "@/types/Point";
import { GridLayout } from "@/lib/GridLayout";
import { PointsLayout } from "@/types/PointsLayout";
import axios, { CancelTokenSource } from "axios";

const o = new Object3D();

function* getThumbnailSrcsIterator(thumbnailSrcs: string[]) {
  for (let src of thumbnailSrcs) {
    yield src;
  }
}

export default function InstancedPointsProgressive({
  points = [],
  layout = GridLayout,
  thumbnailWidth = 100,
  thumbnailHeight = 100,
  padding = 18,
  loadingPagedSize = 4,
}: {
  points: Point[];
  layout?: PointsLayout;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  padding?: number;
  loadingPagedSize?: number;
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
    console.warn(
      "Too many thumbnails to fit into a 4k x 4k texture. Limiting to",
      count
    );
  }

  // console.log("count", count);
  // console.log("thumbnailWidth", thumbnailWidth);
  // console.log("thumbnailHeight", thumbnailHeight);

  // Adjust loadingPagedSize based on the number of images
  // loadingPagedSize = loadingPagedSize || Math.ceil(count / 10);

  const [texture, setTexture] = useState<any>(null);

  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  useLayoutEffect(() => {
    if (count === 0) {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    thumbnailWidth = thumbnailWidth - padding;
    thumbnailHeight = thumbnailHeight - padding;

    const size: number = thumbnailWidth * thumbnailHeight;
    const textureData: Uint8Array = new Uint8Array(4 * size * count).fill(128);
    const imgsToData: ImageData[] = [];

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
      console.log(`Loading ${count} images...`);
      let i = 0;
      for (let src of thumbnailSrcsGenerator) {
        // Create a new cancel token source for each image load
        cancelTokenSourceRef.current = axios.CancelToken.source();

        const response = await axios.get(src, {
          responseType: "blob",
          cancelToken: cancelTokenSourceRef.current.token,
        });

        const img = await createImageBitmap(response.data);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(0, canvas.height);

        // Determine the longest edge of the image
        const longestEdge = Math.max(img.width, img.height);

        // Calculate the scale factor to fit the longest edge of the image within the thumbnail
        const scale = Math.min(
          thumbnailWidth / longestEdge,
          thumbnailHeight / longestEdge
        );

        // Calculate the dimensions of the image after scaling
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Calculate the position to center the image within the thumbnail, taking into account the offset
        const posX = (thumbnailWidth - scaledWidth) / 2;
        const posY = (thumbnailHeight - scaledHeight) / 2;

        ctx.scale(1, -1);

        // Draw the image scaled and centered within the thumbnail, taking into account the offset
        ctx.drawImage(
          img,
          posX,
          canvas.height - posY - scaledHeight,
          scaledWidth,
          scaledHeight
        );

        // Draw a white border around the image
        // ctx.strokeStyle = "white";
        // ctx.lineWidth = 2; // Adjust border thickness here
        // ctx.strokeRect(
        //   posX,
        //   canvas.height - posY - scaledHeight,
        //   scaledWidth,
        //   scaledHeight
        // );

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

        // Update the texture after every 'loadingPagedSize' images
        if (i % loadingPagedSize === 0) {
          updateTexture();
        }

        i++;
      }

      // Final update to ensure all images are displayed
      updateTexture();
    };

    loadImages().catch((error) => {
      if (axios.isCancel(error)) {
        console.log("Image load cancelled");
      } else {
        // Handle the error
      }
    });

    return () => {
      texture?.dispose();
      // Cancel the image load
      cancelTokenSourceRef.current?.cancel();
      count = 0;
    };
  }, [points]);

  useFrame(({ camera, clock }, delta) => {
    layout(instancesRef, count, o, camera, clock, delta);
  });

  return (
    <>
      <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[0.1, 0.1]} />
        <ThumbnailMaterial map={texture} brightness={1.4} contrast={0.75} />
      </instancedMesh>
    </>
  );
}
