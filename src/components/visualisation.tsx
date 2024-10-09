import { useEffect, useRef, useState, useCallback } from "react";
import ThumbnailMaterial from "./thumbnail-material";
import { DataArrayTexture, InstancedMesh, Object3D } from "three";
import { Node } from "@/types/Node";
import axios, { CancelTokenSource } from "axios";
import { useAnimatedTransition } from "@/lib/Transition";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import { config } from "@/Config";

const o = new Object3D();
const imageCache: { [key: string]: ImageBitmap } = {};

function* getThumbnailSrcsIterator(thumbnailSrcs: (string | undefined)[]) {
  for (let src of thumbnailSrcs) {
    yield src;
  }
}

function updateInstancedMeshMatrices({
  o,
  mesh,
  nodes,
}: {
  o: Object3D;
  mesh: InstancedMesh;
  nodes: Node[];
}) {
  if (!mesh) return;

  // set the transform matrix for each instance
  for (let i = 0; i < nodes.length; ++i) {
    const { position, scale } = nodes[i];

    if (position) {
      o.position.set(position[0], position[1], position[2]);
      // o.rotation.set(0.5 * Math.PI, 0, 0); // cylinders face z direction
      o.scale.set(scale![0], scale![1], scale![2]);
      o.updateMatrix();

      mesh.setMatrixAt(i, o.matrix);
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
}

function useImagesTexture({
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
  const src = useAppContext((state: AppState) => state.src);
  const nodes = useAppContext((state: AppState) => state.nodes);
  const [texture, setTexture] = useState<any>(null);

  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const loadImages = useCallback(async () => {
    let count = nodes.length;

    if (count === 0) {
      return;
    }

    const thumbnailSrcs: (string | undefined)[] = nodes.map((node: Node) => {
      return node.thumbnail?.src;
    });

    const thumbnailSrcsGenerator = getThumbnailSrcsIterator(thumbnailSrcs);

    // Calculate the maximum number of thumbnails that can fit into a 4k x 4k texture
    const maxThumbnailsInRow = Math.floor(
      config.maxTextureSize / thumbnailWidth
    );
    const maxThumbnailsInColumn = Math.floor(
      config.maxTextureSize / thumbnailHeight
    );
    const maxThumbnailsInTexture = maxThumbnailsInRow * maxThumbnailsInColumn;

    // If there are more thumbnails than can fit into a 4k x 4k texture, limit the count
    if (count > maxThumbnailsInTexture) {
      count = maxThumbnailsInTexture;
      console.warn(
        `Too many thumbnails to fit into ${config.maxTextureSize} x ${config.maxTextureSize} texture. Limiting to`,
        count
      );
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { willReadFrequently: true })!;
    }
    const ctx = ctxRef.current;

    thumbnailWidth = thumbnailWidth - padding;
    thumbnailHeight = thumbnailHeight - padding;

    const size: number = thumbnailWidth * thumbnailHeight;
    const textureData: Uint8Array = new Uint8Array(4 * size * count); //.fill(128);
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

    let i = 0;

    for (let src of thumbnailSrcsGenerator) {
      let img: ImageBitmap;

      if (src === undefined) {
        if (!imageCache[config.placeholderImage]) {
          // Load the placeholder image only once and cache it
          const response = await axios.get(config.placeholderImage, {
            responseType: "blob",
          });
          imageCache[config.placeholderImage] = await createImageBitmap(
            response.data
          );
        }
        img = imageCache[config.placeholderImage];
      } else if (imageCache[src]) {
        // Use cached image if available
        img = imageCache[src];
      } else {
        // Create a new cancel token source for each image load
        cancelTokenSourceRef.current = axios.CancelToken.source();

        const response = await axios.get(src, {
          responseType: "blob",
          cancelToken: cancelTokenSourceRef.current.token,
        });

        img = await createImageBitmap(response.data);
        // Cache the loaded image
        imageCache[src] = img;
      }

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
  }, [
    nodes,
    config,
    thumbnailWidth,
    thumbnailHeight,
    padding,
    loadingPagedSize,
    instancesRef,
  ]);

  useEffect(() => {
    loadImages().catch((error) => {
      if (axios.isCancel(error)) {
        // console.log("Image load cancelled");
      } else {
        // Handle the error
      }
    });

    return () => {
      texture?.dispose();
      // Cancel the image load
      cancelTokenSourceRef.current?.cancel();
    };
  }, [src]);

  return { texture };
}

interface VisualisationProps {
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  padding?: number;
  loadingPagedSize?: number;
}

const Visualisation = ({
  thumbnailWidth = config.thumbnailWidth,
  thumbnailHeight = config.thumbnailHeight,
  padding = config.padding,
  loadingPagedSize = config.loadingPagedSize,
}: VisualisationProps) => {
  const nodes = useAppContext((state: AppState) => state.nodes);

  const instancesRef = useRef<any>();

  const { texture } = useImagesTexture({
    instancesRef: instancesRef.current,
    thumbnailWidth,
    thumbnailHeight,
    padding,
    loadingPagedSize,
  });

  useAnimatedTransition({
    onStart: () => {},
    onChange: () => {
      updateInstancedMeshMatrices({
        o,
        mesh: instancesRef.current,
        nodes: nodes,
      });
    },
    onRest: () => {},
  });

  return (
    <>
      <instancedMesh
        ref={instancesRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <ThumbnailMaterial map={texture} brightness={1.4} contrast={0.75} />
      </instancedMesh>
    </>
  );
};

export default Visualisation;
