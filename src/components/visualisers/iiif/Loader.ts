import { Point } from "@/types/Point";
import { Vault, createThumbnailHelper } from "@iiif/helpers";
import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";
import { ContentLoader } from "@/types/ContentLoader";

export class IIIFLoader implements ContentLoader {
  private thumbailWidth: number = 100;
  private thumbnailHeight: number = 100;

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

    const thumbHelper = createThumbnailHelper(vault, {
      imageServiceLoader: loader,
    });

    const manifest = await vault.loadManifest(url);

    const thumbnailSrcs: string[] = [];

    const thumbnailPromises = manifest!.items.map((item) =>
      thumbHelper.getBestThumbnailAtSize(
        item,
        { width: this.thumbailWidth, height: this.thumbnailHeight },
        true
      )
    );

    await Promise.all(thumbnailPromises).then((cvThumbs) => {
      cvThumbs.forEach((cvThumb: any) => {
        thumbnailSrcs.push(cvThumb.best.id);
      });
    });

    const points = thumbnailSrcs.map((src: string) => {
      return {
        thumbnail: {
          src,
          width: this.thumbailWidth,
        },
      } as Point;
    });

    return points;
  }
}
