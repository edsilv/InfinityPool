import React from "react";
import { useEffect, useRef, useState } from "react";
import ThumbnailMaterial from "./thumbnail-material";
import { DataArrayTexture, InstancedMesh, Object3D } from "three";
import { Point } from "@/types/Point";
import axios, { CancelTokenSource } from "axios";
import { useAnimatedTransition } from "@/lib/Transition";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";

const o = new Object3D();

function* getThumbnailSrcsIterator(thumbnailSrcs: string[]) {
  for (let src of thumbnailSrcs) {
    yield src;
  }
}

function updateInstancedMeshMatrices({
  o,
  mesh,
  points,
}: {
  o: Object3D;
  mesh: InstancedMesh;
  points: Point[];
}) {
  if (!mesh) return;

  // set the transform matrix for each instance
  for (let i = 0; i < points.length; ++i) {
    const { position } = points[i];

    if (position) {
      o.position.set(position[0], position[1], position[2]);
      // o.rotation.set(0.5 * Math.PI, 0, 0); // cylinders face z direction
      // o.scale.set(scale[0], scale[1], scale[2]);
      o.updateMatrix();

      mesh.setMatrixAt(i, o.matrix);
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
}

function useThumbnails({
  instancesRef,
  thumbnailWidth,
  thumbnailHeight,
  padding,
  loadingPagedSize,
}: {
  instancesRef: InstancedMesh;
  thumbnailWidth: number;
  thumbnailHeight: number;
  padding: number;
  loadingPagedSize: number;
}) {
  const src = useAppContext((state: AppState) => state.src)!;
  const points = useAppContext((state: AppState) => state.points)!;
  const [texture, setTexture] = useState<any>(null);

  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    let count = points.length;

    if (count === 0) {
      return;
    }

    const thumbnailSrcs = points.map((point: Point) => point.thumbnail.src);
    const thumbnailSrcsGenerator = getThumbnailSrcsIterator(thumbnailSrcs);

    // Calculate the maximum number of thumbnails that can fit into a 4k x 4k texture
    const maxThumbnailsInRow = Math.floor(4096 / thumbnailWidth);
    const maxThumbnailsInColumn = Math.floor(4096 / thumbnailHeight);
    const maxThumbnailsInTexture = maxThumbnailsInRow * maxThumbnailsInColumn;

    // If there are more thumbnails than can fit into a 4k x 4k texture, limit the count
    // In this case, we can fit 2025 90x90px thumbnails within a 4096 x 4096 texture
    if (count > maxThumbnailsInTexture) {
      count = maxThumbnailsInTexture;
      console.warn(
        "Too many thumbnails to fit into a 4k x 4k texture. Limiting to",
        count
      );
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
      if (instancesRef?.instanceMatrix) {
        instancesRef.instanceMatrix.needsUpdate = true;
      }
    };

    const loadImages = async () => {
      console.log(`Loading ${count} images...`);
      let i = 0;
      for (let src of thumbnailSrcsGenerator) {
        // Create a new cancel token source for each image load
        cancelTokenSourceRef.current = axios.CancelToken.source();

        // console.log(`Loading image ${i + 1} of ${count}...`);

        const response = await axios.get(src, {
          responseType: "blob",
          cancelToken: cancelTokenSourceRef.current.token,
        });

        // console.log(`Image ${i + 1} loaded`);

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

      console.log("Images loaded");
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
  }, [src]);

  return { texture };
}

const InstancedPoints = ({
  thumbnailWidth = 100,
  thumbnailHeight = 100,
  padding = 18,
  loadingPagedSize = 4,
}: {
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  padding?: number;
  loadingPagedSize?: number;
}) => {
  const points = useAppContext((state: AppState) => state.points)!;

  const instancesRef = useRef<any>();

  const { texture } = useThumbnails({
    instancesRef: instancesRef.current,
    thumbnailWidth,
    thumbnailHeight,
    padding,
    loadingPagedSize,
  });

  useAnimatedTransition({
    onStart: () => {},
    onChange: () => {
      updateInstancedMeshMatrices({ o, mesh: instancesRef.current, points });
    },
    onRest: () => {},
  });

  return (
    <>
      <instancedMesh
        ref={instancesRef}
        args={[undefined, undefined, points.length]}
      >
        <planeGeometry args={[0.1, 0.1]} />
        <ThumbnailMaterial map={texture} brightness={1.4} contrast={0.75} />
      </instancedMesh>
    </>
  );
};

export default InstancedPoints;
