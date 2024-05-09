// import { Euler, Vector3 } from "@react-three/fiber";
import { Point } from "../lib/Point";

export type Src = SrcObj[];

export type SrcObj = {
  // label?: string;
  // position?: Vector3;
  // rotation?: Euler;
  // scale?: Vector3;
  requiredStatement?: string;
  url: string;
  type: string | "iiif";
  points?: Point[];
};
