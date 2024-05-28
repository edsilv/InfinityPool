import { Point } from "./Point";

export type Src = SrcObj[];

export type SrcObj = {
  requiredStatement?: string;
  url: string;
  type: string | "iiif";
  points?: Point[];
};
