import { Facets, Node } from "@/types";
import { config } from "@/Config";
import { getNodeFacets } from "@/lib/utils";
import { node } from "@/lib/Node";

// https://github.com/TheScienceMuseum/collectionsonline/wiki/Collections-Online-API
// https://github.com/TheScienceMuseum/collectionsonline-api/blob/master/examples/simple-example/example-fetch.js
export const load = async (): Promise<{ nodes: Node[]; facets: Facets }> => {
  const url =
    "https://collection.sciencemuseumgroup.org.uk/search/museum/Science%20Museum?page[number]=0&page[size]=100";

  const opts = { headers: { Accept: "application/json" } };

  const res = await fetch(url, opts);

  if (!res.ok) {
    throw new Error(`${res.status} Failed to fetch results`);
  }

  const json = await res.json();

  // console.log(json);

  const objects = json.data.map((r: any) => {
    const thumbLocation =
      r.attributes.multimedia[0]["@processed"].zoom.location;
    const encodedThumbLocation = encodeURIComponent(thumbLocation);
    const thumbnail = `https://zoom.sciencemuseumgroup.org.uk/iiif/3/${encodedThumbLocation}/full/100,/0/default.jpg`;

    return {
      title: r.attributes.title[0].value,
      category: r.attributes.category[0].name,
      thumbnail,
    };
  });

  const nodes: Node[] = objects.map((obj: any) => {
    return {
      ...node,
      thumbnail: {
        src: obj.thumbnail,
        width: config.thumbnailWidth,
      },
      metadata: obj,
    };
  });

  const facets = getNodeFacets(nodes, objects, ["thumbnail", "title"]);

  return { nodes, facets };
};
