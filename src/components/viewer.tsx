import "@/viewer.css";
import "../index.css";
import React, {
  RefObject,
  Suspense,
  forwardRef,
  useEffect,
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
import { AppState } from "@/Store";
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
import { useAppContext } from "@/lib/hooks/use-app-context";
import { Loader } from "./loader";
import CameraControlsImpl from "camera-controls";
import GETTY from "./visualisers/getty";
import MET from "./visualisers/met";
import CRM from "./visualisers/crm";
import ScienceMuseum from "./visualisers/sciencemuseum";
import { Labels } from "./labels";
// import { CameraControls } from "./camera-controls";
// import { Perf } from "r3f-perf";

const Scene = () => {
  const boundsRef = useRef<Group | null>(null);

  const cameraRefs: CameraRefs = {
    controls: useRef<CameraControls | null>(null),
    position: useRef<Vector3>(new Vector3()),
    target: useRef<Vector3>(new Vector3()),
  };

  const cameraPosition = new Vector3();
  const cameraTarget = new Vector3();
  const environment = "apartment";
  const minDistance = 0.01;
  const { camera } = useThree();

  const ambientLightIntensity = useAppContext(
    (state: AppState) => state.ambientLightIntensity
  );

  const orthographicEnabled = useAppContext(
    (state: AppState) => state.orthographicEnabled
  );

  const upVector = useAppContext((state: AppState) => state.upVector);

  const triggerCameraUpdateEvent = useEventTrigger(CAMERA_UPDATE);
  // const triggerCameraSleepEvent = useEventTrigger(CAMERA_SLEEP);

  // set the camera up vector
  camera.up.copy(new Vector3(upVector[0], upVector[1], upVector[2]));
  cameraRefs.controls.current?.updateCameraUp();

  useEffect(() => {
    if (cameraRefs.controls.current) {
      cameraRefs.controls.current!.mouseButtons.left =
        CameraControlsImpl.ACTION.TRUCK;
      cameraRefs.controls.current!.mouseButtons.right =
        CameraControlsImpl.ACTION.NONE;
    }
  }, [cameraRefs.controls.current]);

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
        zoomToObject={zoomToObject}
        recenter={recenter}
      >
        <Suspense fallback={<Loader />}>
          <Visualiser />
        </Suspense>
      </Bounds>
      <Environment preset={environment} />
      <Labels />
      {/* <Perf /> */}
    </>
  );
};

const Visualiser = () => {
  const src = useAppContext((state: AppState) => state.src);

  if (!src) {
    return null;
  }

  function renderVisualizer(src: SrcObj) {
    switch (src.type) {
      case "crm":
        return <CRM />;
      case "getty":
        return <GETTY />;
      case "met":
        return <MET />;
      case "iiif":
        return <IIIF />;
      case "sciencemuseum":
        return <ScienceMuseum />;
      default:
        return null;
    }
  }

  return <>{renderVisualizer(src)}</>;
};

const Viewer = (
  _props: ViewerProps,
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
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Scene />
      </Canvas>
    </>
  );
};

export default forwardRef(Viewer);
