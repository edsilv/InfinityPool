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
import { Facet, Facets, Filter, Filters } from "@/types";

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

export function FilterSelector({
  mutuallyExclusive = true,
}: {
  mutuallyExclusive: boolean;
}) {
  const layout = useAppContext((state: AppState) => state.layout);
  const filters: Filters = useAppContext((state: AppState) => state.filters);
  const facets: Facets = useAppContext((state: AppState) => state.facets);
  const setFilters = useAppContext((state: AppState) => state.setFilters);

  const handleFilterChange = (
    facet: string,
    value: string,
    checked: boolean
  ) => {
    const newFilters = checked
      ? mutuallyExclusive
        ? [{ facet, value }]
        : [...filters, { facet, value }]
      : filters.filter(
          (filter) => filter.facet !== facet || filter.value !== value
        );

    setFilters(newFilters);
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden mt-4 h-72 pr-2">
      <Accordion type="single" collapsible>
        {layout && layout.facetingEnabled
          ? Object.keys(facets).map((facet: string) => {
              return (
                <AccordionItem key={facet} value={facet}>
                  <AccordionTrigger className="text-white">
                    {facet}
                  </AccordionTrigger>
                  {Array.from(facets[facet])
                    .sort((a: Facet, b: Facet) => b.total - a.total)
                    .map((f: Facet, idx) => {
                      const isChecked = filters.some((filter: Filter) => {
                        return (
                          filter.facet === facet && filter.value === f.value
                        );
                      });
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
  );
}
