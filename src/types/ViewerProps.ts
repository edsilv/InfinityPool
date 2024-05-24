import { SrcObj } from "./index";

export type ViewerProps = {
  onLoad?: (src: SrcObj) => void;
};

export type ViewerRef = {
  recenter: () => void;
};
