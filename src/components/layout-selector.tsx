"use client";

import { useAppContext } from "@/lib/hooks/use-app-context";
import { OptionSelector } from "./option-selector";
import { Layout } from "@/types";
import { AppState } from "@/Store";
import { config } from "@/Config";

export function LayoutSelector() {
  const layout = useAppContext((state: AppState) => state.layout);
  const setLayout = useAppContext((state: AppState) => state.setLayout);

  return (
    <OptionSelector
      label="Layout"
      value={layout.type}
      onChange={(value: string) => {
        setLayout(
          config.layouts.find((layout) => layout.type === value) as Layout
        );
      }}
      options={config.layouts.map((layout) => {
        return {
          label: layout.label,
          value: layout.type,
        };
      })}
      description="Set the layout."
    />
  );
}
