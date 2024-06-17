import { config } from "@/Config";
import { Node } from "@/types";
import { Facets } from "@/types";
import metadata from "./metadata.json";
// import axios from "axios";

type METAPIObject = {
  data: {
    title: string;
    primaryImage: string;
    primaryImageSmall: string;
  };
};

// https://github.com/bahaaador/met-museum-react
// the issue with this one is that the image requests can't be loaded via js in visualisation.tsx because of CORS policy
export async function load(_url: string): Promise<{
  nodes: Node[];
  facets: Facets;
}> {
  // const response = await axios.get(url, {
  //   responseType: "json",
  // });

  // const objects: METAPIObject[] = [];

  // const objectPromises = response.data.objectIDs.map((id: string) =>
  //   axios
  //     .get(
  //       `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
  //       {
  //         responseType: "json",
  //       }
  //     )
  //     .catch((error) => {
  //       if (error.response && error.response.status === 404) {
  //         console.log(`Object with ID ${id} not found.`);
  //         return null; // Return null or a custom object to indicate failure
  //       }
  //       throw error; // Rethrow the error if it's not a 404
  //     })
  // );

  // await Promise.all(objectPromises)
  //   .then((results) => {
  //     // Filter out null values (failed requests)
  //     return results.filter((result) => result !== null);
  //   })
  //   .then((filteredResults) => {
  //     // Process filtered results
  //     console.log(filteredResults);
  //     objects.push(...filteredResults);
  //   })
  //   .catch((error) => {
  //     // Handle any errors that weren't caught by the .catch block in the map function
  //     console.error("An error occurred:", error);
  //   });

  const objects = metadata as METAPIObject[];

  const nodes = objects.map((obj: METAPIObject) => {
    const { primaryImageSmall: src } = obj.data;

    return {
      position: [0, 0, 0],
      sourcePosition: [0, 0, 0],
      targetPosition: [0, 0, 0],
      scale: [1, 1, 1],
      sourceScale: [1, 1, 1],
      targetScale: [1, 1, 1],
      thumbnail: {
        src,
        width: config.thumbnailWidth,
      },
    } as Node;
  });

  let facets: Facets = {};

  // if (url === "https://media.nga.gov/public/manifests/nga_highlights.json") {
  //   facets = getNodeFacets(nodes, metadata);
  // }

  return { nodes, facets };
}
