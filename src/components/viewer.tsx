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
  Html,
  OrthographicCamera,
  PerspectiveCamera,
  useHelper,
  useProgress,
} from "@react-three/drei";
import { BoxHelper, Group, Object3D, Vector3 } from "three";
import useStore from "@/Store";
import {
  ViewerProps as ViewerProps,
  CAMERA_UPDATE,
  DBL_CLICK,
  CameraRefs,
  RECENTER,
  CAMERA_CONTROLS_ENABLED,
} from "@/types";
import useDoubleClick from "@/lib/hooks/use-double-click";
import { useEventListener, useEventTrigger } from "@/lib/hooks/use-event";
import useTimeout from "@/lib/hooks/use-timeout";
// import { Perf } from "r3f-perf";
// import InstancedPoints from "./instanced-points";
import InstancedPointsProgressive from "./instanced-points-progressive";
import { Point } from "@/types/Point";
import { IIIFLoader } from "@/lib/IIIFLoader2";
import { GridLayout } from "@/lib/GridLayout";
import { ContentLoader } from "@/types/ContentLoader";

function Scene({ onLoad, src }: ViewerProps) {
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
  const { camera, gl } = useThree();

  const {
    ambientLightIntensity,
    boundsEnabled,
    loading,
    orthographicEnabled,
    points,
    setLoading,
    setPoints,
    upVector,
  } = useStore();

  const triggerCameraUpdateEvent = useEventTrigger(CAMERA_UPDATE);
  // const triggerCameraSleepEvent = useEventTrigger(CAMERA_SLEEP);

  // set the camera up vector
  camera.up.copy(new Vector3(upVector[0], upVector[1], upVector[2]));
  cameraRefs.controls.current?.updateCameraUp();

  // src changed
  useEffect(() => {
    let loader: ContentLoader | undefined;
    // if the src is of type iiif, load the manifest and parse the thumbnails into a points array
    if (src.type === "iiif") {
      loader = new IIIFLoader();
      loader.load(src.url).then((points: Point[]) => {
        console.log("set points", points.length);
        setPoints(points);
      });
    }

    // Cleanup function
    return () => {
      // Destroy the loader
      loader?.dispose?.();
    };
  }, [src]);

  // when loaded or camera type changed, zoom to object(s) instantaneously
  useTimeout(
    () => {
      if (!loading) {
        recenter(true);
      }
    },
    1,
    [loading, orthographicEnabled]
  );

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

  function Bounds({
    lineVisible,
    children,
  }: {
    lineVisible?: boolean;
    children: React.ReactNode;
  }) {
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
  }

  function Loader() {
    const { progress } = useProgress();
    if (progress === 100) {
      setTimeout(() => {
        if (onLoad) {
          onLoad(src);
          setLoading(false);
        }
      }, 1);
    }

    return (
      <Html
        wrapperClass="loading"
        calculatePosition={() => {
          return [
            gl.domElement.clientWidth / 2,
            gl.domElement.clientHeight / 2,
          ];
        }}
      >
        <div className="flex justify-center">
          <div className="h-1 w-24 bg-black rounded-full overflow-hidden transform translate-x-[-50%]">
            <div
              className="h-full bg-white"
              style={{
                width: `${Math.ceil(progress)}%`,
              }}
            />
          </div>
        </div>
      </Html>
    );
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
      <Bounds lineVisible={boundsEnabled}>
        <Suspense fallback={<Loader />}>
          <InstancedPointsProgressive points={points} layout={GridLayout} />
          {/* <Thing /> */}
          {/* {srcs.map((src, index) => {
            return <></>;
            // return <GLTF key={index} {...src} />;
          })} */}
        </Suspense>
      </Bounds>
      <Environment preset={environment} />
      {/* <Perf /> */}
    </>
  );
}

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
