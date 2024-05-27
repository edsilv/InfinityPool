import { Point } from "@/types/Point";
import { Vault, createThumbnailHelper } from "@iiif/helpers";
import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";
import { config } from "@/Config";

export async function load(url: string): Promise<Point[]> {
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
      { width: config.thumbnailWidth, height: config.thumbnailHeight },
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
      position: [0, 0, 0],
      sourcePosition: [0, 0, 0],
      targetPosition: [0, 0, 0],
      thumbnail: {
        src,
        width: config.thumbnailWidth,
      },
    } as Point;
  });

  return points;
}

// export class IIIFLoader implements ContentLoader {
//   private thumbailWidth: number = config.thumbnailWidth;
//   private thumbnailHeight: number = config.thumbnailHeight;

//   constructor() {}

//   async load(url: string): Promise<Point[]> {
//     const vault = new Vault();

//     vault.on("error", (error) => {
//       throw new Error(error.action.error.message);
//     });

//     const loader = new ImageServiceLoader({
//       verificationsRequired: 2,
//       approximateServices: true,
//       enableFetching: true,
//       disableThrottling: false,
//     });

//     const thumbHelper = createThumbnailHelper(vault, {
//       imageServiceLoader: loader,
//     });

//     const manifest = await vault.loadManifest(url);

//     const thumbnailSrcs: string[] = [];

//     const thumbnailPromises = manifest!.items.map((item) =>
//       thumbHelper.getBestThumbnailAtSize(
//         item,
//         { width: this.thumbailWidth, height: this.thumbnailHeight },
//         true
//       )
//     );

//     await Promise.all(thumbnailPromises).then((cvThumbs) => {
//       cvThumbs.forEach((cvThumb: any) => {
//         thumbnailSrcs.push(cvThumb.best.id);
//       });
//     });

//     const points = thumbnailSrcs.map((src: string) => {
//       return {
//         position: [0, 0, 0],
//         sourcePosition: [0, 0, 0],
//         targetPosition: [0, 0, 0],
//         thumbnail: {
//           src,
//           width: this.thumbailWidth,
//         },
//       } as Point;
//     });

//     // run current layout on points
//     // applyLayout(layout, points);

//     return points;
//   }
// }
