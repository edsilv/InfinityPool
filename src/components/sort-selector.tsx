"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { AppState } from "@/Store";

export function SortSelector() {
  const layout = useAppContext((state: AppState) => state.layout);
  const sort = useAppContext((state: AppState) => state.sort);
  const facets = useAppContext((state: AppState) => state.facets);
  const setFacet = useAppContext((state: AppState) => state.setSort);

  return (
    <OptionSelector
      label="Sort"
      value={sort}
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
      description="Sort by."
    />
  );
}
