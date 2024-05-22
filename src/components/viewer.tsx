import "@/viewer.css";
import "../index.css";
import React, {
  RefObject,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  CameraControls,
  Environment,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Group, Object3D, Vector3 } from "three";
import useStore from "@/Store";
import {
  ViewerProps as ViewerProps,
  CAMERA_UPDATE,
  DBL_CLICK,
  CameraRefs,
  RECENTER,
  CAMERA_CONTROLS_ENABLED,
  SrcObj,
} from "@/types";

import { useEventListener, useEventTrigger } from "@/lib/hooks/use-event";
import IIIF from "./visualisers/iiif";
import Bounds from "./bounds";
// import { Perf } from "r3f-perf";

const Scene = React.memo(
  (props: ViewerProps) => {
    const { src } = props;

    const boundsRef = useRef<Group | null>(null);

    const cameraRefs: CameraRefs = {
      controls: useRef<CameraControls | null>(null),
      position: useRef<Vector3>(new Vector3()),
      target: useRef<Vector3>(new Vector3()),
    };

    const cameraPosition = new Vector3();
    const cameraTarget = new Vector3();
    const environment = "apartment";
    const minDistance = 0.1;
    const { camera } = useThree();

    const {
      ambientLightIntensity,
      boundsEnabled,
      // loading,
      orthographicEnabled,
      // points,
      // setLoading,
      // setPoints,
      upVector,
    } = useStore();

    const triggerCameraUpdateEvent = useEventTrigger(CAMERA_UPDATE);
    // const triggerCameraSleepEvent = useEventTrigger(CAMERA_SLEEP);

    // set the camera up vector
    camera.up.copy(new Vector3(upVector[0], upVector[1], upVector[2]));
    cameraRefs.controls.current?.updateCameraUp();

    // when loaded or camera type changed, zoom to object(s) instantaneously
    // useTimeout(
    //   () => {
    //     if (!loading) {
    //       recenter(true);
    //     }
    //   },
    //   1,
    //   [loading, orthographicEnabled]
    // );

    const handleRecenterEvent = () => {
      recenter();
    };

    useEventListener(RECENTER, handleRecenterEvent);

    const handleCameraEnabledEvent = (e: any) => {
      (cameraRefs.controls.current as any).enabled = e.detail;
    };

    useEventListener(CAMERA_CONTROLS_ENABLED, handleCameraEnabledEvent);

    // can't add event listener to camera controls because the camera switches between perspective and orthographic
    // and the listeners are not copied over
    // const handleCameraSleepEvent = () => {
    //   console.log('camera sleep');
    //   triggerCameraSleepEvent();
    // };

    // useEffect(() => {
    //   console.log('adding event listener');
    //   // detect onsleep event
    //   cameraRefs.controls.current?.addEventListener('rest', handleCameraSleepEvent);

    //   return () => {
    //     console.log('removing event listener');
    //     cameraRefs.controls.current?.removeEventListener('rest', handleCameraSleepEvent);
    //   };
    // }, [orthographicEnabled]);

    function zoomToObject(
      object: Object3D,
      instant?: boolean,
      padding: number = 0.1
    ) {
      cameraRefs.controls.current!.fitToBox(object, !instant, {
        cover: false,
        paddingLeft: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingTop: padding,
      });
    }

    function recenter(instant?: boolean, padding?: number) {
      if (boundsRef.current) {
        zoomToObject(boundsRef.current, instant, padding);
      }
    }

    function onCameraChange(e: any) {
      if (e.type !== "update") {
        return;
      }

      // get current camera position
      cameraRefs.controls.current!.getPosition(cameraPosition);
      cameraRefs.position.current = cameraPosition;

      // get current camera target
      cameraRefs.controls.current!.getTarget(cameraTarget);
      cameraRefs.target.current = cameraTarget;

      triggerCameraUpdateEvent({ cameraPosition, cameraTarget });
    }

    return (
      <>
        {orthographicEnabled ? (
          <OrthographicCamera makeDefault position={[0, 0, 2]} />
        ) : (
          <PerspectiveCamera />
        )}
        <CameraControls
          ref={cameraRefs.controls}
          minDistance={minDistance}
          onChange={onCameraChange}
        />
        <ambientLight intensity={ambientLightIntensity} />
        <Bounds
          boundsRef={boundsRef}
          lineVisible={boundsEnabled}
          zoomToObject={zoomToObject}
          recenter={recenter}
        >
          <Visualiser src={src} />
        </Bounds>
        <Environment preset={environment} />
        {/* <Perf /> */}
      </>
    );
  },
  (prevProps, nextProps) => {
    // only re-render if the src url changes
    return prevProps.src === nextProps.src;
  }
);

const Visualiser = React.memo(
  ({ src }: { src: SrcObj }) => {
    function renderVisualizer(src: SrcObj) {
      switch (src.type) {
        case "iiif":
          return <IIIF src={src.url} />;
        default:
          return null;
      }
    }

    return <>{renderVisualizer(src)}</>;
  },
  (prevProps, nextProps) => {
    // only re-render if the src url changes
    return prevProps.src.url === nextProps.src.url;
  }
);

const Viewer = (
  props: ViewerProps,
  ref: ((instance: unknown) => void) | RefObject<unknown> | null | undefined
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const triggerDoubleClickEvent = useEventTrigger(DBL_CLICK);
  const triggerRecenterEvent = useEventTrigger(RECENTER);

  useImperativeHandle(ref, () => ({
    recenter: () => {
      triggerRecenterEvent();
    },
  }));

  return (
    <>
      <Canvas
        ref={canvasRef}
        camera={{ fov: 30 }}
        onDoubleClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          triggerDoubleClickEvent(e);
        }}
      >
        <Scene {...props} />
      </Canvas>
    </>
  );
};

export default forwardRef(Viewer);
