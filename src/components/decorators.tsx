import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import { Decorators, Label } from "@/types";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import { Vector3 } from "three";

export function DecoratorsDisplay() {
  const { camera, size } = useThree();

  const decorators: Decorators | null = useAppContext(
    (state: AppState) => state.decorators
  );

  const v1 = new Vector3();

  useFrame(() => {
    updateLabelPositions();
  });

  function updateLabelPosition(idx: number, x: number, y: number) {
    const labelEl: HTMLElement = document.getElementById(`label-${idx}`)!;

    if (labelEl) {
      labelEl.setAttribute("transform", `translate(${x}, ${y})`);
    } else {
      console.error("could not find label element");
    }
  }

  function updateLabelPositions() {
    decorators?.labels.forEach((label: Label, idx: number) => {
      const [x, y] = calculatePosition(label);
      updateLabelPosition(idx, x, y);
    });
  }

  // https://github.com/pmndrs/drei/blob/master/src/web/Html.tsx#L25
  function calculatePosition(label: Label) {
    const objectPos = v1.copy(v1.fromArray(label.position));
    objectPos.project(camera);
    const widthHalf = size.width / 2;
    const heightHalf = size.height / 2;
    return [
      objectPos.x * widthHalf + widthHalf,
      -(objectPos.y * heightHalf) + heightHalf, // Move text down by 100px
    ];
  }

  //   function getIntersects(): Intersection<Object3D<Object3DEventMap>>[] {
  //     raycaster.setFromCamera(pointer, camera);
  //     return raycaster.intersectObjects(scene.children, true);
  //   }

  return (
    <Html
      zIndexRange={[50, 0]}
      calculatePosition={() => {
        return [0, 0];
      }}
      style={{
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
    >
      <svg
        width="100vw"
        height="100vh"
        onDoubleClick={(_e: React.MouseEvent<SVGElement>) => {
          // const intersects: Intersection<Object3D>[] = getIntersects();
          //   if (intersects.length > 0) {
          //     setAnnotations([
          //       ...annotations,
          //       {
          //         position: intersects[0].point,
          //         normal: intersects[0].face?.normal!,
          //         cameraPosition: cameraRefs.position.current!,
          //         cameraTarget: cameraRefs.target.current!,
          //       },
          //     ]);
          //     setSelectedAnnotation(annotations.length);
          //   }
        }}
      >
        {/* draw labels */}
        {decorators?.labels.map((label: Label, index: number) => {
          return (
            <React.Fragment key={index}>
              <g id={`label-${index}`} data-idx={index}>
                <text
                  x="0"
                  y="0"
                  textAnchor="end" // Center align the text
                  dominantBaseline="central"
                  fontSize="10"
                  fill="white"
                  transform="rotate(-45) translate(0, 0)" // Rotate and ensure positioning
                >
                  {label.text}
                </text>
              </g>
            </React.Fragment>
          );
        })}
      </svg>
    </Html>
  );
}
