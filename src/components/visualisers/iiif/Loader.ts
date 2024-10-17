import { Loader, Node } from "@/types";
import { Vault, createThumbnailHelper } from "@iiif/helpers";
import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";
import { config } from "@/Config";
import metadata from "./metadata.json";
import { Facets } from "@/types";
import { getNodeFacets } from "@/lib/utils";
import { node } from "@/lib/Node";

const loadFunction = async (url?: string) => {
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

  const manifest = await vault.loadManifest(url!);

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

  const nodes = thumbnailSrcs.map((src: string) => {
    return {
      ...node,
      thumbnail: {
        src,
        width: config.thumbnailWidth,
      },
    } as Node;
  });

  let facets: Facets = {};

  if (url === "https://media.nga.gov/public/manifests/nga_highlights.json") {
    facets = getNodeFacets(nodes, metadata);
  }

  return { nodes, facets };
};

export const load: Loader = loadFunction;
