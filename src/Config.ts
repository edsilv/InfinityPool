import { Layout } from "./types";

type Src = {
  value: string;
  label: string;
};

export type Config = {
  layouts: Layout[];
  loadingPagedSize: number;
  maxTextureSize: number;
  padding: number;
  nodeSpacing: number;
  nodeGroupSpacing: number;
  thumbnailHeight: number;
  thumbnailWidth: number;
  facetsIgnore: string[];
  srcs: Src[];
};

export const config: Config = {
  loadingPagedSize: 4,
  maxTextureSize: 4096,
  padding: 18,
  nodeSpacing: 1.2,
  nodeGroupSpacing: 1.5,
  thumbnailHeight: 100,
  thumbnailWidth: 100,
  facetsIgnore: ["id", "description", "title"],
  layouts: [
    {
      type: "grid",
      label: "Grid",
      facetingEnabled: true,
    },
    {
      type: "list",
      label: "List",
      facetingEnabled: true,
    },
    {
      type: "barchart",
      label: "Bar Chart",
      facetingEnabled: true,
    },
  ],
  srcs: [
    {
      value: "https://media.nga.gov/public/manifests/nga_highlights.json",
      label: "National Gallery Highlights",
    },
    {
      value:
        "https://iiif.vam.ac.uk/collections/MSL:1876:Forster:141:II/manifest.json",
      label: "Codex Forster",
    },
    {
      value:
        "https://culturedigitalskills.org/presentation/testcompressed/2024-05-19T17-49-24.json",
      label: "Design Archives",
    },
    {
      value:
        "https://iiif.bodleian.ox.ac.uk/iiif/manifest/390fd0e8-9eae-475d-9564-ed916ab9035c.json",
      label: "Shakespeare First Folio",
    },
    {
      value: "https://wellcomelibrary.org/iiif/b18035723/manifest",
      label: "Wunder der Vererbung",
    },
    {
      value: "https://wellcomelibrary.org/iiif/b18035978/manifest",
      label: "The Biocrats",
    },
    {
      value: "https://digital.library.villanova.edu/Item/vudl:60609/Manifest",
      label: "The Holy Bible",
    },
  ],
};
