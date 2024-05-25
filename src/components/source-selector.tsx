"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { AppState } from "@/Store";
import { SrcObj } from "@/types";

export function SourceSelector() {
  let src: SrcObj = useAppContext((state: AppState) => state.src);
  const setSrc = useAppContext((state: AppState) => state.setSrc);

  const srcs: { value: string; label: string }[] = [
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
  ];

  if (!src) {
    src = {
      url: srcs[0].value,
      type: "iiif",
    };

    setSrc(src);
  }

  return (
    <OptionSelector
      label="Source"
      value={src.url}
      onChange={(value: string) => {
        setSrc({
          url: value,
          type: "iiif",
        });
      }}
      options={srcs}
      description="Set the source."
    />
  );
}
