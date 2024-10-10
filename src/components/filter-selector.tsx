"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Facet, Facets, Filter, Filters, Node } from "@/types";
import { Button } from "./ui/button";

function FilterCheckbox({
  label,
  id,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={`text-sm font-medium leading-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {label}
      </label>
    </div>
  );
}

export function FilterSelector() {
  const nodes = useAppContext((state: AppState) => state.nodes);
  const layout = useAppContext((state: AppState) => state.layout);
  const filters: Filters = useAppContext((state: AppState) => state.filters);
  const facets: Facets = useAppContext((state: AppState) => state.facets);
  const setFilters = useAppContext((state: AppState) => state.setFilters);
  const [filteredFacets, setFilteredFacets] = useState<Facets>(facets);

  useEffect(() => {
    // Filter nodes based on the selected filters
    const remainingNodes = nodes.filter((n) => {
      return !n.filteredOut;
    });

    const newFilteredFacets: Facets = {};

    Object.keys(facets).forEach((facet) => {
      const selectedFilters = filters.filter(
        (filter) => filter.facet === facet
      );

      // Calculate the count of each facet value based on the remaining nodes
      const facetCounts: { [key: string]: number } = {};
      remainingNodes.forEach((node: Node) => {
        const facetValue = node.metadata![facet];
        if (facetValue) {
          if (!facetCounts[facetValue]) {
            facetCounts[facetValue] = 0;
          }
          facetCounts[facetValue]++;
        }
      });

      newFilteredFacets[facet] = new Set(
        Array.from(facets[facet])
          .map((f) => {
            const applicable =
              selectedFilters.length === 0 ||
              selectedFilters.some((filter) => filter.value === f.value);
            return {
              ...f,
              total: applicable ? facetCounts[f.value] || 0 : 0,
            };
          })
          .filter((f) => f.total > 0) // Exclude facets with count 0
      );
    });

    setFilteredFacets(newFilteredFacets);
  }, [filters, nodes]);

  const handleFilterChange = (
    facet: string,
    value: string,
    checked: boolean
  ) => {
    const newFilters: Filter[] = checked
      ? [
          ...filters.filter((filter) => filter.facet !== facet),
          { facet, value },
        ]
      : filters.filter(
          (filter) => filter.facet !== facet || filter.value !== value
        );

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters([]);
  };

  return (
    <div>
      <div className="overflow-y-auto overflow-x-hidden mt-4 h-72 pr-2">
        <Accordion type="single" collapsible>
          {layout && layout.facetingEnabled
            ? Object.keys(filteredFacets).map((facet: string) => {
                return (
                  <AccordionItem key={facet} value={facet}>
                    <AccordionTrigger className="text-white">
                      {facet}
                    </AccordionTrigger>
                    {Array.from(filteredFacets[facet])
                      .sort((a: Facet, b: Facet) => b.total - a.total)
                      .map((f: Facet, idx) => {
                        const isChecked =
                          filters.some((filter: Filter) => {
                            return (
                              filter.facet === facet && filter.value === f.value
                            );
                          }) || Array.from(filteredFacets[facet]).length === 1;
                        const isDisabled = f.total === 0;
                        return (
                          <AccordionContent key={idx} className="text-white">
                            <FilterCheckbox
                              label={`${f.value} (${f.total})`}
                              id={`${facet}-${f.value}`}
                              key={f.value}
                              checked={isChecked}
                              onChange={(checked) =>
                                handleFilterChange(facet, f.value, checked)
                              }
                              disabled={isDisabled}
                            />
                          </AccordionContent>
                        );
                      })}
                  </AccordionItem>
                );
              })
            : null}
        </Accordion>
      </div>
      <div>
        <Button onClick={clearFilters} className="mt-4 text-black">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
