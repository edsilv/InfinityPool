import { Group } from "three";
import useDoubleClick from "@/lib/hooks/use-double-click";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
// import { BoxHelper } from "three";
// import { useHelper } from "@react-three/drei";

type BoundsProps = {
  boundsRef: React.MutableRefObject<Group | null>;
  zoomToObject: (object: any) => void;
  recenter: () => void;
  children: React.ReactNode;
};

function Bounds({ boundsRef, zoomToObject, recenter, children }: BoundsProps) {
  const layout = useAppContext((state: AppState) => state.layout);
  const sort = useAppContext((state: AppState) => state.sort);
  const filters = useAppContext((state: AppState) => state.filters);

  // @ts-ignore
  // useHelper(boundsRef, BoxHelper, "white");

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
      key={`bounds/${layout.type}/${filters.length}/${sort}`}
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
      {children}
    </group>
  );
}

export default Bounds;
