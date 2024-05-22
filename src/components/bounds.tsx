import React, { useEffect, useRef } from "react";
import { useHelper } from "@react-three/drei";
import { BoxHelper, Group } from "three";
import useDoubleClick from "@/lib/hooks/use-double-click";

type BoundsProps = {
  boundsRef: React.MutableRefObject<Group | null>;
  lineVisible?: boolean;
  zoomToObject: (object: any) => void;
  recenter: () => void;
  children: React.ReactNode;
};

const Bounds = React.memo<React.FC<BoundsProps>>(function Bounds({
  boundsRef,
  lineVisible,
  zoomToObject,
  recenter,
  children,
}: BoundsProps) {
  const boundsLineRef = useRef<Group | null>(null);

  // @ts-ignore
  useHelper(boundsLineRef, BoxHelper, "white");

  // zoom to object on double click in scene mode
  const handleDoubleClickEvent = (e: any) => {
    e.stopPropagation();
    if (e.delta <= 2) {
      zoomToObject(e.object);
    }
  };

  // zoom to fit bounds on double click on background
  const handleOnPointerMissed = useDoubleClick(() => {
    recenter();
  });

  return (
    <group
      ref={boundsRef}
      onDoubleClick={handleDoubleClickEvent}
      onPointerMissed={(e: MouseEvent) => {
        const tagName = (e.target as HTMLElement).tagName;
        if (tagName === "SPAN" || tagName === "DIV") {
          // clicking on an overlaid annotation label or description
          return;
        } else {
          handleOnPointerMissed(e);
        }
      }}
    >
      {lineVisible ? <group ref={boundsLineRef}>{children}</group> : children}
    </group>
  );
});

export default Bounds;
