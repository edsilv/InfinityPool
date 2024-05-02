// @ts-nocheck

import { useLayoutEffect, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import Shader from "./shader";

const o = new THREE.Object3D();

export default function IIIFCollection() {
  const ref = useRef();

  const thumbnails = [
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-44%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-45%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-48%20W-O.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-48%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-50%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-53%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-56%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-44%20W.tif/full/77,100/0/default.jpg",
    "https://culturedigital.brighton.ac.uk:8183/iiif/2/31-45%20W.tif/full/77,100/0/default.jpg",
  ];

  const count = thumbnails.length;
  const imgs = useLoader(THREE.ImageBitmapLoader, thumbnails);
  const [img, set] = useState(null);
  const width = 77;
  const height = 100;

  useLayoutEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
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
    const data = new Uint8Array(4 * size * count * count);

    for (let i = 0; i < count * count; i++) {
      // thumbnails length
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

    // for (let x = 0; x < count; x++) {
    //   // for (let y = 0; y < count; y++) {
    //   const id = i++;
    //   o.position.set(count / 2 - x, 0, 0);
    //   // o.rotation.x = Math.PI / 2
    //   o.updateMatrix();
    //   ref.current.setMatrixAt(id, o.matrix);
    //   // }
    // }

    // for (let d = 0; d < imgsToData.length; d++) {
    //   // const id = i++;
    //   const id = d;
    //   o.position.set(d * width, 0, 0);
    //   o.updateMatrix();
    //   ref.current.setMatrixAt(id, o.matrix);
    // }

    ref.current.instanceMatrix.needsUpdate = true;

    return () => {
      texture.dispose();
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const gridSize = Math.round(Math.sqrt(count));
    const spacing = 2; // Adjust this value to change the spacing
    for (let i = 0; i < count; i++) {
      const x = ((i % gridSize) - gridSize / 2 + 0.5) * spacing;
      const y = (Math.floor(i / gridSize) - gridSize / 2 + 0.5) * spacing;
      o.position.set(x, y, 0);
      o.lookAt(camera.position);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={ref} args={[null, null, count]}>
        <planeGeometry args={[1, 1]} />
        <Shader map={img} />
      </instancedMesh>
    </>
  );
}
