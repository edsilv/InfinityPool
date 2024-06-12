"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { AppState } from "@/Store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Filters } from "@/types";

function FilterCheckbox({
  label,
  id,
  checked,
  onChange,
}: {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}

export function FilterSelector() {
  const layout = useAppContext((state: AppState) => state.layout);
  const filters: Filters = useAppContext((state: AppState) => state.filters);
  const facets = useAppContext((state: AppState) => state.facets);
  const setFilters = useAppContext((state: AppState) => state.setFilters);

  return (
    <Accordion type="single" collapsible>
      {layout && layout.facetingEnabled
        ? Object.keys(facets).map((facet) => {
            return (
              <AccordionItem key={facet} value={facet}>
                <AccordionTrigger className="text-white">
                  {facet}
                </AccordionTrigger>
                {Array.from(facets[facet]).map((x, idx) => {
                  return (
                    <AccordionContent key={idx} className="text-white">
                      <FilterCheckbox
                        label={x}
                        id={`${facet}-${x}`}
                        key={x}
                        checked={filters.some((f) => {
                          return f.facet === facet && f.value === x;
                        })}
                        onChange={(checked) => {
                          setFilters(
                            checked
                              ? [
                                  ...filters,
                                  {
                                    facet,
                                    value: x,
                                  },
                                ]
                              : filters.filter(
                                  (f) => f.facet !== facet || f.value !== x
                                )
                          );
                        }}
                      />
                    </AccordionContent>
                  );
                })}
              </AccordionItem>
            );
          })
        : null}
    </Accordion>
  );
}
