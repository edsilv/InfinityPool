import { Point } from "@/types/Point";
import { Canvas, loadManifest, parseManifest } from "manifesto.js";

export class IIIFLoader {
  private lowResWidth: number = 90;
  // private highResWidth: number = 200;

  constructor() {}

  async load(url: string): Promise<Point[]> {
    const json = await loadManifest(url);
    const iiifResource: any = parseManifest(json);

    const thumbnailSrcs: string[] = [];

    // todo: look for thumbnails on the canvases before resorting to generating image server requests
    // https://iiif.wellcomecollection.org/presentation/v2/b18035723
    // if no thumbnails are present, load the info.json for the first canvas and get the image server id to use when constructing the thumbnail src

    if (iiifResource.isCollection()) {
      // if it's a collection, get the thumbnails
      for (const manifest of iiifResource.items) {
        const thumbnail = manifest.getThumbnail();
        thumbnailSrcs.push(thumbnail.id);
      }
    } else {
      const sequence = iiifResource.getSequenceByIndex(0);
      const canvases = sequence.getCanvases();

      canvases.forEach((canvas: Canvas) => {
        const images = canvas.getImages();
        const firstImage = images[0];
        const resource = firstImage.getResource();
        const imgSrc = resource.id.replace(
          "full/full",
          `full/${this.lowResWidth},`
        );
        thumbnailSrcs.push(imgSrc);
      });
    }

    const points = thumbnailSrcs.map((src: string) => {
      return {
        thumbnail: {
          src,
          width: this.lowResWidth,
        },
      } as Point;
    });

    // console.log(points);
    return points;
  }
}
