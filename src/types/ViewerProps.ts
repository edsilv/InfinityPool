import { SrcObj } from "./index";

export type ViewerProps = {
  onLoad?: (src: SrcObj) => void;
  src: SrcObj;
};

export type ViewerRef = {
  recenter: () => void;
};
