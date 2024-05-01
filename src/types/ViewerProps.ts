import { SrcObj } from './index';

export type ViewerProps = {
  onLoad?: (src: SrcObj[]) => void;
  src: string | SrcObj | SrcObj[];
};

export type ViewerRef = {
  recenter: () => void;
};
