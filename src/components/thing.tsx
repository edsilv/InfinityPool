// @ts-nocheck

import { useLayoutEffect, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import ThumbnailMaterial from "./shader";

const o = new THREE.Object3D();

export default function Thing() {
  // TODO
  // web worker to convert bitmap to arraybuffer in offscreencanvas

  const ref = useRef();
  const count = 32;
  const imgs = useLoader(THREE.ImageBitmapLoader, ["/pokemons.png"]);
  const [img, set] = useState(null);

  // TODO: Change to external hook and move computation to offscreen canvas web worker
  useLayoutEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const width = 40;
    const height = 30;
    const imgsToData: any[] = [];
    imgs.forEach((img) => {
      img.flipY = true;
      img.needsUpdate = true;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0);
      // texture atlas is 32 colums of 28 rows of 40x32px
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 28; j++) {
          const imgData = ctx.getImageData(
            i * width,
            j * height,
            width,
            height
          );
          imgsToData.push(imgData);
        }
      }
      // we could also just use an array of textures of the same size instead of using
      // a precomputed atlas
    });
    const size = width * height;
    const data = new Uint8Array(4 * size * count * count);

    for (let i = 0; i < count * count; i++) {
      // pokemons length
      const img = imgsToData[i % imgsToData.length];
      data.set(img.data, i * size * 4);
    }

    const texture = new THREE.DataArrayTexture(
      data,
      width,
      height,
      count * count
    );
    texture.needsUpdate = true;
    set(texture);

    let i = 0;
    for (let x = 0; x < count; x++)
      for (let y = 0; y < count; y++) {
        const id = i++;
        o.position.set(count / 2 - x, 0, count / 2 - y);
        // o.rotation.x = Math.PI / 2
        o.updateMatrix();
        ref.current.setMatrixAt(id, o.matrix);
      }
    ref.current.instanceMatrix.needsUpdate = true;

    return () => {
      texture.dispose();
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    let i = 0;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const id = i++;
        o.position.set(
          count / 2 - x,
          0, //Math.sin(i + clock.elapsedTime * 5) / 25,
          count / 2 - y
        );
        o.lookAt(camera.position);
        //o.scale.set(1, 1.5 + Math.sin(i + clock.elapsedTime * 5) / 12, 1);
        o.updateMatrix();
        ref.current.setMatrixAt(id, o.matrix);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={ref} args={[null, null, count * count]}>
        <planeGeometry args={[0.5, 0.5]} />
        <ThumbnailMaterial map={img} />
      </instancedMesh>
    </>
  );
}
