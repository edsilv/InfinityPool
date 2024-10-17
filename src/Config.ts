import { Layout, SrcObj } from "./types";
import { load as CRMLoader } from "@/components/visualisers/crm/Loader";
import { load as GETTYLoader } from "@/components/visualisers/getty/Loader";
import { load as IIIFLoader } from "@/components/visualisers/iiif/Loader";
import { load as ScienceMuseumLoader } from "@/components/visualisers/sciencemuseum/Loader";

export type Config = {
  facetsIgnore: string[];
  layouts: Layout[];
  loadingPagedSize: number;
  maxTextureSize: number;
  nodeGroupSpacing: number;
  nodeSpacing: number;
  padding: number;
  placeholderImage: string;
  srcs: SrcObj[];
  thumbnailHeight: number;
  thumbnailWidth: number;
};

export const config: Config = {
  loadingPagedSize: 4,
  maxTextureSize: 4096,
  padding: 18,
  placeholderImage: "/images/placeholder.png",
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
    // {
    //   type: "list",
    //   label: "List",
    //   facetingEnabled: true,
    // },
    {
      type: "barchart",
      label: "Bar Chart",
      facetingEnabled: true,
    },
  ],
  srcs: [
    {
      id: "getty",
      loader: GETTYLoader,
      label: "Getty Collection",
    },
    {
      id: "crm",
      loader: CRMLoader,
      label: "CRM",
    },
    {
      id: "sciencemuseum",
      loader: ScienceMuseumLoader,
      label: "Science Museum",
    },
    // {
    //   id: "met",
    //   // url: "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=department=9",
    //   url: "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=van%20gogh",
    //   label: "Met Collection",
    // },
    {
      id: "nghighlights",
      loader: IIIFLoader,
      url: "https://media.nga.gov/public/manifests/nga_highlights.json",
      label: "National Gallery Highlights",
    },
    {
      id: "codexforster",
      loader: IIIFLoader,
      url: "https://iiif.vam.ac.uk/collections/MSL:1876:Forster:141:II/manifest.json",
      label: "Codex Forster",
    },
    {
      id: "designarchives",
      loader: IIIFLoader,
      url: "https://culturedigitalskills.org/presentation/testcompressed/2024-05-19T17-49-24.json",
      label: "Design Archives",
    },
    {
      id: "shakespeare",
      loader: IIIFLoader,
      url: "https://iiif.bodleian.ox.ac.uk/iiif/manifest/390fd0e8-9eae-475d-9564-ed916ab9035c.json",
      label: "Shakespeare First Folio",
    },
    {
      id: "wunder",
      loader: IIIFLoader,
      url: "https://wellcomelibrary.org/iiif/b18035723/manifest",
      label: "Wunder der Vererbung",
    },
    {
      id: "biocrats",
      loader: IIIFLoader,
      url: "https://wellcomelibrary.org/iiif/b18035978/manifest",
      label: "The Biocrats",
    },
    {
      id: "bible",
      loader: IIIFLoader,
      url: "https://digital.library.villanova.edu/Item/vudl:60609/Manifest",
      label: "The Holy Bible",
    },
  ],
};
