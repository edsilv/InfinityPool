"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { AppState } from "@/Store";

export function FacetsSelector() {
  const layout = useAppContext((state: AppState) => state.layout);
  const facet = useAppContext((state: AppState) => state.facet);
  const facets = useAppContext((state: AppState) => state.facets);
  const setFacet = useAppContext((state: AppState) => state.setFacet);

  return (
    <OptionSelector
      label="Facet"
      value={facet}
      onChange={(value: string) => {
        setFacet(value);
      }}
      options={[
        {
          label: "none",
          value: "none",
        },
        ...(layout && layout.facetingEnabled
          ? Object.keys(facets).map((facet) => {
              return {
                label: facet,
                value: facet,
              };
            })
          : []),
      ]}
      description="Set the facet."
    />
  );
}
