import { Loader, Node } from "@/types";
import { config } from "@/Config";
import metadata from "./metadata.json";
import { getNodeFacets } from "@/lib/utils";
import {
  getPrimaryName,
  getFieldValuesByClassifications,
  getMaterialStatements,
  getValueByClassification,
  normalizeFieldToArray,
  getDimensionsDescriptions,
  getProductionTimespans,
  getDigitalImages,
  getCultures,
  // @ts-ignore // no ts declaration file
} from "@thegetty/linkedart.js";
import { node } from "@/lib/Node";

// metadata from: https://observablehq.com/@jrladd/linked-art-3
// to construct new queries use the Getty's SPARQL endpoint: https://data.getty.edu/museum/collection/sparql-ui
const loadFunction = async () => {
  const objects = (metadata as any[]).map((l) => {
    return {
      title: getPrimaryName(l),
      artist: getFieldValuesByClassifications(
        l.produced_by,
        "referred_to_by",
        "https://data.getty.edu/museum/ontology/linked-data/tms/object/producer-description"
      )[0],
      materials: getMaterialStatements(l)[0],
      type: getValueByClassification(
        normalizeFieldToArray(l, "referred_to_by"),
        "http://vocab.getty.edu/aat/300435443"
      ),
      dimensions: getDimensionsDescriptions(l)[0],
      begin: getProductionTimespans(l)[0].begin_of_the_begin,
      end: getProductionTimespans(l)[0].end_of_the_end,
      image: getDigitalImages(l)[0],
      cultures: getCultures(l)[0],
    };
  });

  const nodes = objects
    .filter((obj) => obj.image) // Filter out objects without an image
    .map(
      (obj) =>
        ({
          ...node,
          thumbnail: obj.image
            ? {
                src: obj.image.replace(
                  "full/full",
                  `full/${config.thumbnailWidth},`
                ),
                width: config.thumbnailWidth,
              }
            : undefined,
          metadata: obj,
        }) as Node
    );

  const facets = getNodeFacets(nodes, objects, [
    "title",
    "dimensions",
    "begin",
    "end",
    "image",
  ]);

  return { nodes, facets };
};

export const load: Loader = loadFunction;
