// @ts-nocheck

import { useLayoutEffect, useRef, useState, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import Shader from "./shader";
import { SrcObj } from "@/types";
import { suspend } from "suspend-react";
import { CanvasWorld } from "./CanvasWorld";
import { ViewingDirection } from "@iiif/vocabulary";
import { Canvas, LanguageMap, loadManifest, parseManifest } from "manifesto.js";

const useIIIFManifest = (src) => {
  const [data, setData] = useState<CanvasWorld | null>(null);
  const [error, setError] = useState(null);

  // return useMemo(async () => {
  suspend(async () => {
    try {
      const res = await fetch(src);
      const d = await res.json();

      const manifest = parseManifest(data);
      const sequence = manifest.getSequenceByIndex(0);
      const paged = manifest.isPagingEnabled();
      const canvases = sequence.getCanvases();
      const canvasWorld = new CanvasWorld(
        canvases,
        [],
        paged,
        ViewingDirection.LEFT_TO_RIGHT
      );
      setData(canvasWorld);
    } catch (error: any) {
      setError(err);
    }
  }, [src]);

  return {
    data,
    isLoading: !error && data == undefined,
    isError: error,
  };
  // }, [src]);
};

const o = new THREE.Object3D();

export default function IIIFCollection({
  src,
}: {
  src: string | SrcObj | SrcObj[];
}) {
  const instancedMeshRef = useRef();

  const { isLoading, isError, data } = useIIIFManifest(src);

  // const count = thumbnails.length;
  // const imgs = useLoader(THREE.ImageBitmapLoader, thumbnails);
  // const [img, setImg] = useState(null);

  // let width: number = 0;
  // let height: number = 0;

  useLayoutEffect(() => {
    if (isLoading) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const imgsToData: any[] = [];

    const contentResource = canvasWorld.contentResource(
      canvas.imageServiceIds[0]
    );
    const canvasBounds =
      canvasWorld.contentResourceToWorldCoordinates(contentResource);

    // set the width and height to the largest of all image widths and heights
    imgs.forEach((img) => {
      width = Math.max(width || 0, img.width);
      height = Math.max(height || 0, img.height);
    });

    // create the imgsToData array
    imgs.forEach((img) => {
      img.flipY = true;
      img.needsUpdate = true;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.translate(0, height);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, width, height);
      imgsToData.push(imgData);
    });

    const size: number = width * height;
    const data = new Uint8Array(4 * size * count);

    for (let i = 0; i < count; i++) {
      // thumbnails length
      const img = imgsToData[i];
      data.set(img.data, i * size * 4);
    }

    const texture = new THREE.DataArrayTexture(data, width, height, count);
    texture.needsUpdate = true;

    setImg(texture);

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    return () => {
      texture.dispose();
    };
  }, [isLoading, data]);

  useFrame(({ camera, clock }, delta) => {
    const gridSize = Math.round(Math.sqrt(count));
    const spacing = 2; // Adjust this value to change the spacing

    for (let i = 0; i < count; i++) {
      const x = ((i % gridSize) - gridSize / 2 + 0.5) * spacing;
      const y = (Math.floor(i / gridSize) - gridSize / 2 + 0.5) * spacing;
      o.position.set(x, y, 0);
      // o.lookAt(camera.position);
      o.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, o.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
        <planeGeometry args={[1, 1]} />
        <Shader map={img} />
      </instancedMesh>
    </>
  );
}
