import { useEffect } from "react";
import CameraControlsImpl from "camera-controls";

export const useTruck = (
  cameraControls: React.RefObject<CameraControlsImpl>
) => {
  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.mouseButtons.left =
        CameraControlsImpl.ACTION.TRUCK;
      cameraControls.current.mouseButtons.right =
        CameraControlsImpl.ACTION.NONE;
    }
  }, [cameraControls]);
};
