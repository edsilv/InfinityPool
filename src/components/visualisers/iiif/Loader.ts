import { Node } from "@/types/Node";
import { Vault, createThumbnailHelper } from "@iiif/helpers";
import { ImageServiceLoader } from "@atlas-viewer/iiif-image-api";
import { config } from "@/Config";
import metadata from "./metadata.json";
import { Facets } from "@/types";

export async function load(url: string): Promise<{
  nodes: Node[];
  facets: Facets;
}> {
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

  const nodes = thumbnailSrcs.map((src: string) => {
    return {
      position: [0, 0, 0],
      sourcePosition: [0, 0, 0],
      targetPosition: [0, 0, 0],
      thumbnail: {
        src,
        width: config.thumbnailWidth,
      },
    } as Node;
  });

  // facets are a dictionary of
  // {
  //   "facet": Set["prop1", "prop2", "prop..."]
  // }
  const facets: Facets = {};

  // if it's the NGA Highlights manifest, add test metadata
  // todo: look for a linked metadata file in all manifests using seeAlso
  if (url === "https://media.nga.gov/public/manifests/nga_highlights.json") {
    nodes.forEach((node, idx) => {
      node.metadata = metadata[idx];

      Object.keys(node.metadata).forEach((key) => {
        if (!config.facetsIgnore.includes(key)) {
          // if the key isn't already tracked in facets, add it
          if (!facets[key]) {
            facets[key] = new Set();
          }

          facets[key].add(node.metadata[key]);
        }
      });
    });
  }

  return { nodes: nodes, facets };
}
