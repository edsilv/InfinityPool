import { useEffect, RefObject } from "react";
import CameraControlsImpl from "camera-controls";

export const useTruck = (cameraControlsRef: RefObject<CameraControlsImpl>) => {
  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.mouseButtons.left =
        CameraControlsImpl.ACTION.TRUCK;
      cameraControlsRef.current.mouseButtons.right =
        CameraControlsImpl.ACTION.NONE;
    }
  }, [cameraControlsRef.current]); // This dependency will trigger when the ref's current value changes
};
