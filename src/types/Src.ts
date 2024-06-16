import { Node } from "./Node";

export type Src = SrcObj[];

export type SrcObj = {
  requiredStatement?: string;
  url: string;
  type: string | "iiif" | "met" | "getty";
  nodes?: Node[];
  label: string;
};
