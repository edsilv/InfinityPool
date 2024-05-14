import { Point } from "@/types/Point";
import { Vault, createThumbnailHelper } from "@iiif/helpers";
import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";

export class IIIFLoader {
  private maxWidth: number = 90;

  constructor() {}

  async load(url: string): Promise<Point[]> {
    const vault = new Vault();

    vault.on("error", (error) => {
      throw new Error(error.action.error.message);
    });

    const loader = new ImageServiceLoader({
      verificationsRequired: 2,
      approximateServices: true,
      enableFetching: true,
      disableThrottling: false,
    });

    const manifest = await vault.loadManifest(url);
    const thumbHelper = createThumbnailHelper(vault, {
      imageServiceLoader: loader,
    });

    const thumbnailSrcs: string[] = [];

    const thumbnailPromises = manifest!.items.map((canvas) =>
      thumbHelper.getBestThumbnailAtSize(
        canvas,
        { width: 90, height: 90 },
        true
      )
    );

    await Promise.all(thumbnailPromises).then((cvThumbs) => {
      cvThumbs.forEach((cvThumb: any) => {
        thumbnailSrcs.push(cvThumb.best.id);
      });
    });

    // console.log(thumbnailSrcs);

    const points = thumbnailSrcs.map((src: string) => {
      return {
        thumbnail: {
          src,
          width: this.maxWidth,
        },
      } as Point;
    });

    return points;
  }
}
