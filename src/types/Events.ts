export const CAMERA_CONTROLS_ENABLED = "alcameracontrolsenabled";
export const CAMERA_UPDATE = "alcameraupdate";
export const DBL_CLICK = "aldblclick";
export const RECENTER = "alrecenter";

export type Event =
  | typeof CAMERA_CONTROLS_ENABLED
  | typeof CAMERA_UPDATE
  | typeof DBL_CLICK
  | typeof RECENTER;
