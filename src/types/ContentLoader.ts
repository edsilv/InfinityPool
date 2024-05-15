import { Point } from "@/types/Point";

export interface ContentLoader {
  load(url: string): Promise<Point[]>;
  dispose(): void;
}
